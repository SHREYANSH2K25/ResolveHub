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
        // handle multiple file uploads to cloudinary
        if(req.files && req.files.length > 0) {

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

        // calls ML contract service to determine category and assignment
        const triageResults = await runTriageandAssign(mediaUrls, description);
        category = triageResults.category;
        const { coordinates, city } = await geocodeLocation(rawAddress);
        finalCoordinates = coordinates;
        const detectedCity = city;

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
                category : category,
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

        // find staff or fallback to global admin
        let staff = null;
        if(detectedCity && matchedDepartment){
            staff = await User.findOne({
                role : "staff",
                city : detectedCity,
                department : matchedDepartment,
            })
        }

        const globalAdmin = await User.findOne({role : "admin", city: "Global"});

        if(!staff){
            if(globalAdmin) {
                assignedToId = globalAdmin._id;
                console.log(
                    `No staff found in ${detectedCity}. Assigned to Global Admin (${globalAdmin.email})`
                );

                notifyCitizenOfStatusChange(
                    null,
                    `Global Admin has been assigned complaint due to missing local staff for ${detectedCity}.`
                );
            } else {
                console.warn("No Global Admin found - complaint unassigned.");
                assignedToId = null;
            }
        } else{
            assignedToId = staff._id;
        }
        // Create new complaint with assigned data

        const newComplaint = new Complaint ({
            submittedBy : req.user.id,
            
            title,
            description,
            category : category,
            city: detectedCity,
            department: matchedDepartment,
            assignedTo : assignedToId,
            location : {type : 'Point', coordinates : finalCoordinates},
            mediaUrls,  // Save the array of secure cloudinry urls
            status : 'OPEN'  // initiates the transparent complaint lifestyle
        })

        const complaint = await newComplaint.save();

        res.json({
            msg : 'Complaint submitted and assigned.', 
            complaintId : complaint._id, 
            assignedCategory : category, 
            assignedDepartment : matchedDepartment, 
            assignedTo: assignedToId
        })
    }
    catch(err){
        console.error('Submission error : ', err.message || err);
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

        // find complaints where status is not resolved
        const complaints = await Complaint.find({
            status : {
                $in : ['OPEN', 'IN PROGRESS']
            }
        })
            // enrich the data with actual names and info
            .populate('submittedBy', 'name email')
            .populate('assignedTo' , 'name department')
            .sort({createdAt : -1});
        

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

    if(!['IN PROGRESS', 'RESOLVED'].includes(status)){
        return res.status(400).json({msg : 'Invalid status provided.'});
    }

    let updateFields = { status };

    if(status == 'RESOLVED'){
        updateFields.resolutionDate = new Date();
    }

    try{
        const complaint = await Complaint.findByIdAndUpdate(
            complaintId,
            { $set : updateFields},
            {new : true, runValidators : true}
        );

        if(!complaint){
            return res.status(404).json({msg : 'Complaint not found'});
        }

        // add bonus based on resolutiontime
        if(status === 'RESOLVED'){
            const staffId = complaint.assignedTo;
            if(staffId){
                updateLeaderboardPoints(staffId, complaint, 'RESOLUTION');
            }
        }
        notifyCitizenOfStatusChange(complaint);

        res.json({
            msg : `Complaint status updated to ${status}`,
            complaintId : complaint._id,
            newStatus : complaint.status,
            resolutionDate : complaint.resolutionDate
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