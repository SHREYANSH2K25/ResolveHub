import express from "express"
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
const router = express.Router();

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
            Sanitation: "Sanitation",
            Plumbing: "Plumbing",
            Structural: "Structural",
            Electrical: "Electrical",
        }
        
        const matchedDepartment = departmentMap[category] || null;

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
        console.error('Submission error:', err);
        console.error('Stack trace:', err.stack);
        res.status(500).json({msg : err.message || 'Server error during upload'});
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

        // Apply city-based filtering with new assignedUsers field
        if (currentUser.role === 'staff') {
            // Staff members see complaints where they are in assignedUsers or from their city
            filter.$or = [
                { city: currentUser.city },
                { assignedUsers: req.user.id }, // New: Check if user is in assignedUsers array
                { assignedTo: req.user.id } // Legacy: Still check primary assignee
            ];
        } else if (currentUser.role === 'admin' && currentUser.city !== 'Global') {
            // City admin sees complaints from their city or where they are assigned
            filter.$or = [
                { city: currentUser.city },
                { assignedUsers: req.user.id } // New: Check if admin is in assignedUsers array
            ];
        }
        // Global admin sees all complaints (no additional filtering)

        // Find complaints with the filter
        const complaints = await Complaint.find(filter)
            .populate('submittedBy', 'name email')
            .populate('assignedTo', 'name department city')
            .populate('assignedUsers', 'name role department city')
            .sort({createdAt: -1});

        res.json(complaints);
    }
    catch(err){
        console.error('STAFF dashboard fetch error : ', err.message);
        res.status(500).send('Server Error');
    }
});


// staff, admin updates the status of a complaint 
router.put('/:id/status', auth, authorize(['staff', 'admin']), async(req, res) => {
    const {status} = req.body;
    const complaintId = req.params.id;

    if(!['IN_PROGRESS', 'RESOLVED'].includes(status)){
        return res.status(400).json({msg : 'Invalid status provided.'});
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
            // Staff can access complaints from their city or assigned to them
            const cityStaff = await User.find({ 
                role: 'staff', 
                city: currentUser.city 
            }).select('_id');
            const staffIds = cityStaff.map(staff => staff._id);
            
            hasAccess = complaint.city === currentUser.city ||
                       staffIds.some(id => id.equals(complaint.assignedTo)) ||
                       complaint.assignedTo?.equals(req.user.id);
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

        // add bonus based on resolutiontime
        if(status === 'RESOLVED'){
            const staffId = updatedComplaint.assignedTo;
            if(staffId){
                updateLeaderboardPoints(staffId, updatedComplaint, 'RESOLUTION');
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
        console.error('Status update error: ', err.message);
        res.status(500).send('Server error');
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
        // find all complaints not yet resolved (Open or In progress)
        const complaintLocations = await Complaint.find({
            status : {$in: ['OPEN', 'IN PROGRESS']}
        })
        .select('location status -_id'); // to retrieve only location coordinates and status

        res.json(complaintLocations); // data returned as an array of geoJSON points.
    }
    catch(err) {
        console.error('Heatmap data fetch error: ', err.message);
        res.status(500).send('Server error');
    }
});
export default router;