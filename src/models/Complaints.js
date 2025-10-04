import mongoose from "mongoose"

const ComplaintSchema = new mongoose.Schema({
    submittedBy : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required : true
    },
    title : {
        type : String,
        required : true
    },
    description : {
        type : String,
        required : true
    },
    category : {
        type : String,
    },
    status : {
        type : String,
        enum : ['OPEN', 'IN PROGRESS', 'RESOLVED'],
        default : 'OPEN'
    },
    location : {
        type : {
            type : String,  // geojson type
            enum : ['Point'], 
            default : 'Point'
        },
        coordinates : {type : [Number], required : true},
    },
    mediaUrls: [String],
    assignedTo : {
        type : mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default : null
    },
    resolutionDate: { 
        type: Date 
    },
    feedbackRating: { 
        type: Number, min: 1, max: 5 
    }, 
    feedbackComment: { 
        type: String 
    }
}, {timestamps : true});

// Index for Geospatial Heatmap Visualization
ComplaintSchema.index({ location: '2dsphere' });

export const Complaint = mongoose.model('Complaint', ComplaintSchema);