import mongoose from "mongoose"

const VerificationCodeSchema = new mongoose.Schema({
    code : {
        type : String, 
        required : true, 
        unique : true,
        // Store codes as uppercase for consistency
        uppercase: true 
    },
    city: { 
        type: String, 
        required: true,
        // Store city names capitalized/trimmed for consistency
        trim: true 
    }, 
    expiresAt : {
        type : Date,
        required : true,
        default : () => new Date ( +new Date() + 24*60*60*1000) 
    },
    used: { 
        type: Boolean, 
        default: false 
    }
})

export const VerificationCode = mongoose.model('VerificationCode', VerificationCodeSchema);
