import express from "express"
import mongoose from "mongoose"
import auth from "../middlewares/auth.js"
import upload from "../middlewares/fileUpload.js"
import cloudinary from "../config/cloudinaryConfig.js"
import { runTriageandAssign } from "../services/triageService.mjs"
import {geocodeLocation} from "../services/geoCodingService.js"
import {Complaint} from "../models/Complaint.js"
import { User } from "../models/User.js"
import authorize from '../middlewares/rbac.js'
import { notifyCitizenOfStatusChange } from "../services/notificationService.js"
import { updateLeaderboardPoints } from "../services/gamificationService.js"
import { initializeSLA, updateSLAStatus, processSLAUpdates } from "../services/slaService.js"
const router = express.Router();

// Add logging middleware for all complaint routes
router.use((req, res, next) => {
    console.log(`[Complaints Router] ${req.method} ${req.path} - Params:`, req.params, 'Body:', req.body);
    next();
});

// helper to convert bufer(binary data) to string for cloudianry to accept
const bufferToDataUri = (file) =>{
    return `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
};

/* COMPLAINT SUBMISSION FLOW:
    1. Middleware Check (auth): Verifies JWT and sets req.user.id.
    2. Middleware Check (upload): Parses files using multer and sets req.files.
    3. Upload to Cloudinary: Files are uploaded concurrently (Promise.all) to the cloud.
    4. AI Triage & Assignment: The Triage Service determines the 'category' and 'assignedToId'.
    5. Database Save: A new Complaint document is created with status 'OPEN', saving the Cloudinary URLs and the assigned staff ID.
*/

router.post('/', auth, upload, async(req, res) => {
    const {title, description, rawAddress} = req.body;
    let finalCoordinates = null;
    let mediaUrls = [];
    let category = null;
    let assignedToId = null;

    // basic validation
    if(!title || !description || !rawAddress) {
        return res.status(400).json ({msg : 'Please include title, description and valid address.'})
    }

    try {  
        console.log('Starting complaint submission process...');
        
        // handle multiple file uploads to cloudinary
        if(req.files && req.files.length > 0) {
            console.log('Processing file uploads...');

            // map files to concurrent upload promises
            const uploadPromises = req.files.map(file => {
                const dataURI = bufferToDataUri(file);

                // uploads data uri to cloudinary
                return cloudinary.uploader.upload(dataURI, {
                    folder: 'resolvehub_complaints'
                });
            });

            // Waits for uploads to complete 
            const uploadResults = await Promise.all(uploadPromises);
            
            // we extract secure urls for db storage
            mediaUrls = uploadResults.map(result => result.secure_url);
        }

        console.log('Running ML triage and geocoding...');
        
        // calls ML contract service to determine category and assignment
        const triageResults = await runTriageandAssign(mediaUrls, description);
        category = triageResults.category;
        console.log('Category detected:', category);
        
        const { coordinates, city } = await geocodeLocation(rawAddress);
        finalCoordinates = coordinates;
        const detectedCity = city;
        console.log('Detected city:', detectedCity);
        console.log('Coordinates:', finalCoordinates);
    
        const departmentMap = {
            // Capital case (from AI)
            Sanitation: "Sanitation",
            Plumbing: "Plumbing",
            Structural: "Structural", 
            Electrical: "Electrical",
            // Lowercase (from user input/frontend)
            sanitation: "Sanitation",
            plumbing: "Plumbing",
            structural: "Structural",
            electrical: "Electrical"
        }
        
        const matchedDepartment = departmentMap[category] || null;
        console.log(`[Complaint Assignment] Category: ${category} -> Department: ${matchedDepartment}`);

        // WHEN NORMAL COMPLAINT THEN ISSUE IS ALREADY RESOLVED
        if(category === "Normal"){
            const autoComplaint = new Complaint({
                submittedBy: req.user.id,
                title,
                description,
                category : category,
                city: detectedCity,
                location : {type : 'Point', coordinates : finalCoordinates},
                mediaUrls,
                status : 'AUTO-CLOSED'
            })

            await autoComplaint.save();

            notifyCitizenOfStatusChange(autoComplaint, "Auto-closed as no issue detected.")
            return res.json({
                msg : "Complaint detected as 'Normal' and auto-closed by system.",
                complaintId: autoComplaint._id,
            })
        }

        // Enhanced assignment logic based on priority hierarchy
        let primaryAssignee = null;
        let assignedUsers = [];
        let assignmentMessage = "";

        // Find city admin
        const cityAdmin = await User.findOne({role: "admin", city: detectedCity});
        const globalAdmin = await User.findOne({role: "admin", city: "Global"});
        
        // Find all staff in the city
        const cityStaff = await User.find({role: "staff", city: detectedCity});
        
        // Find department-specific staff in the city
        const departmentStaff = await User.find({
            role: "staff", 
            city: detectedCity, 
            department: matchedDepartment
        });

        console.log(`Assignment Logic for ${detectedCity}:`);
        console.log(`- City Staff Count: ${cityStaff.length}`);
        console.log(`- Department Staff Count: ${departmentStaff.length}`);
        console.log(`- City Admin: ${cityAdmin?.name || 'None'}`);

        if (cityStaff.length === 0) {
            // Case 1: No staff in city → Assign to City Admin (or Global Admin as fallback)
            primaryAssignee = cityAdmin || globalAdmin;
            assignedUsers = [primaryAssignee._id];
            assignmentMessage = `No staff available in ${detectedCity}. Assigned to ${primaryAssignee.name}.`;
            console.log("Case 1: No staff in city");
            
        } else if (departmentStaff.length === 0) {
            // Case 2: Staff exists but not for this department → Assign to City Admin
            primaryAssignee = cityAdmin || globalAdmin;
            assignedUsers = [primaryAssignee._id];
            assignmentMessage = `No ${matchedDepartment} staff available in ${detectedCity}. Assigned to ${primaryAssignee.name}.`;
            console.log("Case 2: No department staff");
            
        } else {
            // Case 3: Department staff exists → Assign to both Department Staff AND City Admin
            primaryAssignee = departmentStaff[0]; // Primary assignee is the staff member
            assignedUsers = [departmentStaff[0]._id];
            
            if (cityAdmin) {
                assignedUsers.push(cityAdmin._id);
            }
            
            assignmentMessage = `Assigned to ${departmentStaff[0].name} (${matchedDepartment} Staff) and ${cityAdmin?.name || 'City Admin'}.`;
            console.log("Case 3: Department staff exists - dual assignment");
        }

        assignedToId = primaryAssignee?._id;
        // Create new complaint with enhanced assignment data
        console.log(`[Complaint Creation] Creating complaint with:`, {
            category,
            department: matchedDepartment,
            city: detectedCity,
            assignedTo: assignedToId,
            assignedUsers
        });

        const newComplaint = new Complaint ({
            submittedBy : req.user.id,
            title,
            description,
            category : category,
            city: detectedCity,
            department: matchedDepartment,
            assignedTo : assignedToId,  // Primary assignee
            assignedUsers: assignedUsers,  // All assigned users
            location : {type : 'Point', coordinates : finalCoordinates},
            mediaUrls,  // Save the array of secure cloudinry urls
            status : 'OPEN'  // initiates the transparent complaint lifestyle
        })

        const complaint = await newComplaint.save();

        // Initialize SLA for the new complaint
        try {
            await initializeSLA(complaint._id);
            console.log(`✅ SLA initialized for complaint ${complaint._id}`);
        } catch (slaError) {
            console.error('⚠️ Failed to initialize SLA (non-critical):', slaError);
            // Continue with complaint creation even if SLA init fails
        }

        // Send notification about assignment
        if (assignmentMessage) {
            notifyCitizenOfStatusChange(complaint, assignmentMessage);
        }

        res.json({
            msg : 'Complaint submitted and assigned successfully.', 
            complaintId : complaint._id, 
            assignedCategory : category, 
            assignedDepartment : matchedDepartment, 
            assignedTo: assignedToId,
            assignedUsers: assignedUsers.length,
            assignmentDetails: assignmentMessage
        })
    }
    catch(err){
        console.error('💥 COMPLAINT SUBMISSION ERROR:', err);
        console.error('📍 Error Name:', err.name);
        console.error('📋 Error Message:', err.message);
        console.error('🔍 Stack Trace:', err.stack);
        
        // Enhanced error reporting
        let errorMessage = 'Server error during complaint submission';
        let statusCode = 500;
        
        if (err.name === 'ValidationError') {
            errorMessage = `Validation failed: ${Object.values(err.errors).map(e => e.message).join(', ')}`;
            statusCode = 400;
        } else if (err.name === 'CastError') {
            errorMessage = 'Invalid data format provided';
            statusCode = 400;
        } else if (err.message.includes('geocoding') || err.message.includes('address')) {
            errorMessage = 'Failed to process the provided address';
            statusCode = 400;
        } else if (err.message.includes('triage') || err.message.includes('ML')) {
            errorMessage = 'Failed to categorize complaint automatically';
            statusCode = 500;
        }
        
        res.status(statusCode).json({
            msg: errorMessage,
            error: process.env.NODE_ENV === 'development' ? err.message : undefined,
            timestamp: new Date().toISOString()
        });
    }
})


// Citizen Tracking (History of Complaints)
router.get('/history', auth, authorize('citizen'), async(req, res) => {
    try {

        // submittedBy id must match id we get by JWT token
        const complaints = await Complaint.find({submittedBy: req.user.id})

        // replace submittedby with name and email
            .populate('submittedBy', 'name email')
            .sort({createdAt: -1});
        // also sorted by creation date, newest first
        
        res.json(complaints);
    }
    catch(err){
        console.error('CITIZEN history fetch error : ', err.message);
        res.status(500).send('Server Error');
    }
})

// Debug test submission (no auth)
router.post('/debug/test-submit', async (req, res) => {
    try {
        const { title = "Test Structural Complaint", category = "structural" } = req.body;
        
        const departmentMap = {
            // Capital case (from AI)
            Sanitation: "Sanitation",
            Plumbing: "Plumbing",
            Structural: "Structural", 
            Electrical: "Electrical",
            // Lowercase (from user input/frontend)
            sanitation: "Sanitation",
            plumbing: "Plumbing",
            structural: "Structural",
            electrical: "Electrical"
        };
        
        const matchedDepartment = departmentMap[category] || null;
        
        console.log(`[Test] Category: ${category} -> Department: ${matchedDepartment}`);
        
        res.json({
            category,
            matchedDepartment,
            success: matchedDepartment ? true : false
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Debug route to fix gamification
router.get('/debug/fix-gamification', async (req, res) => {
    try {
        console.log('🎯 [Debug] Starting gamification fix for all staff...');
        
        // Find all staff members
        const staffMembers = await User.find({ role: 'staff' });
        console.log(`Found ${staffMembers.length} staff members`);

        let updatedCount = 0;
        const results = [];
        
        for (const staff of staffMembers) {
            console.log(`👤 Processing: ${staff.name} (${staff.city}, ${staff.department})`);
            
            // Count resolved complaints for this staff member
            const resolvedCount = await Complaint.countDocuments({
                status: 'RESOLVED',
                $or: [
                    { assignedTo: staff._id },
                    { assignedUsers: staff._id }
                ]
            });

            // Calculate points based on resolved complaints
            const basePoints = resolvedCount * 10; // 10 points per resolved complaint
            
            // Determine badge based on points
            let badge = 'Rookie';
            if (basePoints >= 1000) badge = 'Municipal Legend';
            else if (basePoints >= 500) badge = 'City Champion';
            else if (basePoints >= 250) badge = 'Expert Fixer';
            else if (basePoints >= 100) badge = 'Problem Solver';

            // Update user with gamification data
            await User.findByIdAndUpdate(staff._id, {
                $set: {
                    points: basePoints,
                    resolutionStreak: resolvedCount,
                    topFixerBadge: badge
                }
            });

            const result = {
                name: staff.name,
                city: staff.city,
                department: staff.department,
                resolvedComplaints: resolvedCount,
                points: basePoints,
                badge: badge
            };
            
            results.push(result);
            console.log(`✅ ${staff.name}: ${resolvedCount} resolved → ${basePoints} points → ${badge}`);
            updatedCount++;
        }

        console.log(`✅ Fixed gamification for ${updatedCount} staff members`);
        
        res.json({
            msg: `Fixed gamification for ${updatedCount} staff members`,
            results: results
        });
        
    } catch (err) {
        console.error('❌ Error fixing gamification:', err);
        res.status(500).json({ error: err.message });
    }
});

// Debug route to check all complaints
router.get('/debug/all', async (req, res) => {
    try {
        const complaints = await Complaint.find({})
            .populate('submittedBy', 'name')
            .select('title category department city status assignedTo assignedUsers')
            .sort({ createdAt: -1 });
        
        console.log(`[Debug] Total complaints in database: ${complaints.length}`);
        res.json(complaints);
    } catch (err) {
        console.error('Debug fetch error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Staff Dashboard
router.get('/staff', auth, authorize(['staff', 'admin']), async(req, res) => {
    try {
        // Get the current user's details
        const currentUser = await User.findById(req.user.id);
        if (!currentUser) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Build filter query
        let filter = {
            status: {
                $in: ['OPEN', 'IN_PROGRESS']
            }
        };

        // Apply role-based filtering with city and department restrictions
        if (currentUser.role === 'staff') {
            console.log(`[Staff Filter] User: ${currentUser.name}, City: ${currentUser.city}, Department: ${currentUser.department}`);
            
            // Staff members see complaints where:
            // 1. They are specifically assigned (assignedUsers or assignedTo)
            // 2. OR complaints from their city AND same department
            filter.$or = [
                { assignedUsers: req.user.id }, // Specifically assigned to this staff
                { assignedTo: req.user.id }, // Legacy: Primary assignee
                { 
                    $and: [
                        { city: currentUser.city },
                        { department: currentUser.department }
                    ]
                }
            ];
            
            console.log(`[Staff Filter] Applied filter:`, JSON.stringify(filter, null, 2));
        } else if (currentUser.role === 'admin' && currentUser.city !== 'Global') {
            // City admin sees all complaints from their city (regardless of department)
            filter.$or = [
                { city: currentUser.city },
                { assignedUsers: req.user.id } // If specifically assigned
            ];
        }
        // Global admin sees all complaints (no additional filtering)

        // Find complaints with the filter
        const complaints = await Complaint.find(filter)
            .populate('submittedBy', 'name email')
            .populate('assignedTo', 'name department city')
            .populate('assignedUsers', 'name role department city')
            .sort({createdAt: -1});

        console.log(`[Staff Filter] Found ${complaints.length} complaints for user ${currentUser.name}`);
        
        // Debug: Log each complaint's details
        complaints.forEach((complaint, index) => {
            console.log(`[Staff Filter] Complaint ${index + 1}:`, {
                id: complaint._id,
                title: complaint.title,
                category: complaint.category,
                department: complaint.department,
                city: complaint.city,
                assignedTo: complaint.assignedTo?._id,
                assignedUsers: complaint.assignedUsers?.map(u => u._id)
            });
        });

        // Calculate resolved complaints count for staff members
        let resolvedCount = 0;
        if (currentUser.role === 'staff') {
            const resolvedFilter = {
                status: 'RESOLVED',
                $or: [
                    { assignedTo: req.user.id },
                    { assignedUsers: req.user.id }
                ]
            };
            
            resolvedCount = await Complaint.countDocuments(resolvedFilter);
            console.log(`[Staff Stats] Resolved complaints count for ${currentUser.name}: ${resolvedCount}`);
        }

        res.json({
            complaints,
            resolvedCount: currentUser.role === 'staff' ? resolvedCount : undefined
        });
    }
    catch(err){
        console.error('STAFF dashboard fetch error : ', err.message);
        res.status(500).send('Server Error');
    }
});


// staff, admin updates the status of a complaint 
router.put('/:id/status', auth, authorize(['staff', 'admin']), async(req, res) => {
    console.log(`[Complaints] Status update request - ID: ${req.params.id}, Body:`, req.body);
    
    const {status} = req.body;
    const complaintId = req.params.id;

    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(complaintId)) {
        console.log(`[Complaints] Invalid ObjectId format: ${complaintId}`);
        return res.status(400).json({msg : 'Invalid complaint ID format'});
    }

    if(!['IN_PROGRESS', 'RESOLVED'].includes(status)){
        console.log(`[Complaints] Invalid status: ${status}`);
        return res.status(400).json({msg : 'Invalid status provided. Must be IN_PROGRESS or RESOLVED'});
    }

    try{
        // Get the current user's details
        const currentUser = await User.findById(req.user.id);
        if (!currentUser) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // First, check if the complaint exists
        const complaint = await Complaint.findById(complaintId);
        if(!complaint){
            return res.status(404).json({msg : 'Complaint not found'});
        }

        // Check access permissions based on user role and city
        let hasAccess = false;
        
        if (currentUser.role === 'admin' && currentUser.city === 'Global') {
            // Global admin can access all complaints
            hasAccess = true;
        } else if (currentUser.role === 'admin') {
            // City admin can access complaints from their city
            const cityStaff = await User.find({ 
                role: 'staff', 
                city: currentUser.city 
            }).select('_id');
            const staffIds = cityStaff.map(staff => staff._id);
            
            hasAccess = complaint.city === currentUser.city || 
                       staffIds.some(id => id.equals(complaint.assignedTo));
        } else if (currentUser.role === 'staff') {
            // Staff can access complaints where:
            // 1. They are specifically assigned
            // 2. From their city AND same department
            hasAccess = complaint.assignedTo?.equals(req.user.id) ||
                       complaint.assignedUsers?.some(userId => userId.equals(req.user.id)) ||
                       (complaint.city === currentUser.city && complaint.department === currentUser.department);
        }

        if (!hasAccess) {
            return res.status(403).json({ msg: 'Access denied. You can only update complaints from your city.' });
        }

        let updateFields = { status };

        if(status === 'RESOLVED'){
            updateFields.resolutionDate = new Date();
            updateFields.resolvedAt = new Date();
        }

        const updatedComplaint = await Complaint.findByIdAndUpdate(
            complaintId,
            { $set : updateFields},
            {new : true, runValidators : true}
        );

        // Update SLA status after status change
        try {
            await updateSLAStatus(updatedComplaint._id);
            console.log(`[SLA] Updated SLA status for complaint ${updatedComplaint._id}`);
        } catch (slaError) {
            console.error(`[SLA] Error updating SLA status for complaint ${updatedComplaint._id}:`, slaError);
            // Don't fail the status update if SLA update fails
        }

        // add bonus based on resolutiontime
        if(status === 'RESOLVED'){
            const staffId = updatedComplaint.assignedTo;
            console.log(`[Complaints] Complaint resolved - Status: ${status}, AssignedTo: ${staffId}`);
            if(staffId){
                console.log(`[Complaints] Triggering gamification for staff: ${staffId}`);
                await updateLeaderboardPoints(staffId, updatedComplaint, 'RESOLUTION');
            } else {
                console.log(`[Complaints] No staff assigned to complaint ${updatedComplaint._id}`);
            }
        }
        notifyCitizenOfStatusChange(updatedComplaint);

        res.json({
            msg : `Complaint status updated to ${status}`,
            complaintId : updatedComplaint._id,
            newStatus : updatedComplaint.status,
            resolutionDate : updatedComplaint.resolutionDate
        });
    }
    catch (err) {
        console.error('[Complaints] Status update error:', err.message);
        console.error('[Complaints] Stack trace:', err.stack);
        console.error('[Complaints] Request params:', req.params);
        console.error('[Complaints] Request body:', req.body);
        
        if (err.name === 'CastError') {
            return res.status(400).json({ 
                msg: 'Invalid complaint ID format',
                error: 'INVALID_OBJECT_ID',
                complaintId: req.params.id 
            });
        }
        
        if (err.name === 'ValidationError') {
            return res.status(400).json({ 
                msg: 'Validation error', 
                errors: Object.values(err.errors).map(e => e.message) 
            });
        }
        
        res.status(500).json({ 
            msg: 'Server error during status update',
            error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
        });
    }
});


// Logic for feedback loop
router.post('/:id/feedback', auth, authorize('citizen'), async(req, res) => {
    const {rating, comment} = req.body;
    const complaintId = req.params.id;
    const citizenId = req.user.id;

    if(!rating || rating < 0 || rating > 5){
        return res.status(400).json({msg : 'Rating must be between 1 and 5.'});
    }

    try{
        // find specific complaint
        const complaint = await Complaint.findOne({
            _id : complaintId,
            submittedBy: citizenId,
            status : 'RESOLVED'
        });

        // if no such complaint exist return
        if(!complaint){
            return res.status(404).json({msg : 'Complaint not found or not yet resolved.'});
        }

        // if feedback already given return
        if(complaint.feedbackRating) {
            return res.status(400).json({msg : 'Feedback has already been recorded for this complaint.'});
        }

        // update feedback and return new id
        const updatedComplaint = await Complaint.findByIdAndUpdate(
            complaintId,
            {
                $set : {
                    feedbackRating: rating,
                    feedbackComment: comment || null
                }
            },
            {
                new: true, runValidators: true
            }
        );  

        // add bonus based on feedback
        if(updatedComplaint.status === 'RESOLVED' && updatedComplaint.assignedTo){
            const staffId = updatedComplaint.assignedTo;
            updateLeaderboardPoints(staffId, updatedComplaint, 'FEEDBACK');
        }
        if (rating <= 2) {
            const globalAdmin = await User.findOne({ role: "admin", city: "Global" });
            if (globalAdmin) {
                notifyCitizenOfStatusChange(
                updatedComplaint,
                `Low feedback alert: Complaint ${complaintId} rated ${rating}/5. Global admin notified.`
                );
            }
        }

        res.json({msg: 'Feedback recorded successflly.', complaintId: updatedComplaint._id});
    }
    catch(err){
        console.error('Feedback submission error:', err.message);
        res.status(500).send('Server error');
    }
});


// heatmap logic
router.get('/heatmap', auth, authorize(['staff', 'admin']), async(req, res) => {
    try{
        // Get the current user's details
        const currentUser = await User.findById(req.user.id);
        if (!currentUser) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Build filter query - same logic as staff endpoint
        let filter = {
            status: { $in: ['OPEN', 'IN_PROGRESS'] }
        };

        // Apply role-based filtering
        if (currentUser.role === 'staff') {
            // Staff see complaints they're assigned to OR from their city+department
            filter.$or = [
                { assignedUsers: req.user.id },
                { assignedTo: req.user.id },
                { 
                    $and: [
                        { city: currentUser.city },
                        { department: currentUser.department }
                    ]
                }
            ];
        } else if (currentUser.role === 'admin' && currentUser.city !== 'Global') {
            // City admin sees complaints from their city
            filter.$or = [
                { city: currentUser.city },
                { assignedUsers: req.user.id }
            ];
        }
        // Global admin sees all complaints (no additional filtering)

        const complaintLocations = await Complaint.find(filter)
            .select('location status -_id'); // retrieve only location coordinates and status

        res.json(complaintLocations); // data returned as an array of geoJSON points.
    }
    catch(err) {
        console.error('Heatmap data fetch error: ', err.message);
        res.status(500).send('Server error');
    }
});
// SLA Management Endpoints

// Get overdue complaints
router.get('/sla/overdue', auth, authorize(['staff', 'admin']), async (req, res) => {
    try {
        const currentUser = await User.findById(req.user.id);
        
        let filter = { 
            'sla.isOverdue': true,
            status: { $in: ['OPEN', 'IN_PROGRESS'] }
        };

        // Apply role-based filtering
        if (currentUser.role === 'staff') {
            filter.$or = [
                { assignedUsers: req.user.id },
                { assignedTo: req.user.id },
                { 
                    $and: [
                        { city: currentUser.city },
                        { department: currentUser.department }
                    ]
                }
            ];
        } else if (currentUser.role === 'admin' && currentUser.city !== 'Global') {
            filter.city = currentUser.city;
        }

        const overdueComplaints = await Complaint.find(filter)
            .populate('submittedBy', 'name email')
            .populate('assignedTo', 'name department')
            .populate('escalation.escalatedTo', 'name role')
            .sort({ 'sla.breachedAt': 1 }); // Oldest breaches first

        res.json({
            count: overdueComplaints.length,
            complaints: overdueComplaints
        });
    } catch (error) {
        console.error('Error fetching overdue complaints:', error);
        res.status(500).json({ msg: 'Failed to fetch overdue complaints' });
    }
});

// Process SLA updates (manual trigger)
router.post('/sla/process', auth, authorize(['admin']), async (req, res) => {
    try {
        const result = await processSLAUpdates();
        res.json({
            msg: 'SLA processing completed',
            ...result
        });
    } catch (error) {
        console.error('Error processing SLA updates:', error);
        res.status(500).json({ msg: 'Failed to process SLA updates' });
    }
});

// Get SLA statistics
router.get('/sla/stats', auth, authorize(['staff', 'admin']), async (req, res) => {
    try {
        const currentUser = await User.findById(req.user.id);
        
        let baseFilter = {};
        
        // Apply role-based filtering
        if (currentUser.role === 'staff') {
            baseFilter = {
                $or: [
                    { assignedUsers: req.user.id },
                    { assignedTo: req.user.id },
                    { 
                        $and: [
                            { city: currentUser.city },
                            { department: currentUser.department }
                        ]
                    }
                ]
            };
        } else if (currentUser.role === 'admin' && currentUser.city !== 'Global') {
            baseFilter.city = currentUser.city;
        }

        // Get various SLA statistics
        const [
            totalActive,
            onTime,
            overdue,
            escalatedLevel1,
            escalatedLevel2,
            escalatedLevel3
        ] = await Promise.all([
            Complaint.countDocuments({ 
                ...baseFilter, 
                status: { $in: ['OPEN', 'IN_PROGRESS'] } 
            }),
            Complaint.countDocuments({ 
                ...baseFilter, 
                status: { $in: ['OPEN', 'IN_PROGRESS'] },
                'sla.isOverdue': false
            }),
            Complaint.countDocuments({ 
                ...baseFilter, 
                'sla.isOverdue': true,
                status: { $in: ['OPEN', 'IN_PROGRESS'] }
            }),
            Complaint.countDocuments({ 
                ...baseFilter, 
                'escalation.level': 1
            }),
            Complaint.countDocuments({ 
                ...baseFilter, 
                'escalation.level': 2
            }),
            Complaint.countDocuments({ 
                ...baseFilter, 
                'escalation.level': 3
            })
        ]);

        res.json({
            totalActive,
            onTime,
            overdue,
            escalations: {
                level1: escalatedLevel1,
                level2: escalatedLevel2,
                level3: escalatedLevel3,
                total: escalatedLevel1 + escalatedLevel2 + escalatedLevel3
            },
            slaCompliance: totalActive > 0 ? Math.round((onTime / totalActive) * 100) : 100
        });
    } catch (error) {
        console.error('Error fetching SLA stats:', error);
        res.status(500).json({ msg: 'Failed to fetch SLA statistics' });
    }
});

export default router;