import express from "express"
import auth from "../middlewares/auth.js"
import upload from "../middlewares/fileUpload.js"
import cloudinary from "../config/cloudinaryConfig.js"
import { runTriageandAssign } from "../services/triageService.js"
import {Complaint} from "../models/Complaints.js"

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
    const {title, description, coordinates} = req.body;

    let mediaUrls = [];
    let category = null;
    let assignedToId = null;

    // basic validation
    if(!title || !description || !coordinates || coordinates.length !== 2) {
        return res.status(400).json ({msg : 'Please include title, description and valid coordinates'})
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
        const triageResults = await runTriageandAssign(mediaUrls[0], description);
        category = triageResults.category;
        assignedToId = triageResults.assignedToId;

        // Create new complaint with assigned data
        const newComplaint = new Complaint ({
            submittedBy : req.user.id,
            title,
            description,
            category : category,
            assignedTo : assignedToId,
            location : {type : 'Point', coordinates : coordinates},
            mediaUrls : mediaUrls,  // Save the array of secure cloudinry urls
            status : 'OPEN'  // initiates the transparent complaint lifestyle
        })

        const complaint = await newComplaint.save();

        res.json({msg : 'Complaint submitted and assigned.', complaintId : complaint._id, assignedCategory : category})

    }
    catch(err){
        console.error('Submission error : ', err);
        res.status(500).json({msg : 'Server error during upload'});
    }
})

export default router;