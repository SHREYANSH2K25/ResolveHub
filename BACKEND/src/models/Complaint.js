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
        enum : ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'AUTO-CLOSED'],
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
    city : {
        type : String,
        default : null,
    },
    department: {
        type: String,
        enum: ['Sanitation', 'Plumbing', 'Structural', 'Electrical'],
        default: null
    },
    mediaUrls: [String],
    assignedTo : {
        type : mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default : null
    },
    assignedUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: []
    }],
    resolutionDate: { 
        type: Date 
    },
    resolvedAt: {
        type: Date
    },
    feedbackRating: { 
        type: Number, min: 1, max: 5 
    }, 
    feedbackComment: { 
        type: String 
    },
    // SLA Tracking Fields
    sla: {
        deadline: {
            type: Date,
            required: false // Will be set by initializeSLA after complaint creation
        },
        timeRemaining: {
            type: Number, // in hours
            default: 0
        },
        isOverdue: {
            type: Boolean,
            default: false
        },
        breachedAt: {
            type: Date
        }
    },
    // Escalation Fields
    escalation: {
        level: {
            type: Number,
            default: 0,
            min: 0,
            max: 3 // 0: No escalation, 1: Level 1, 2: Level 2, 3: Level 3
        },
        escalatedAt: {
            type: Date
        },
        escalatedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        autoEscalated: {
            type: Boolean,
            default: false
        },
        escalationReason: {
            type: String,
            enum: ['SLA_BREACH', 'MANUAL', 'HIGH_PRIORITY', 'REPEAT_COMPLAINT'],
            default: 'SLA_BREACH'
        }
    }
}, {timestamps : true});

// Index for Geospatial Heatmap Visualization
ComplaintSchema.index({ location: '2dsphere' });

export const Complaint = mongoose.model('Complaint', ComplaintSchema);