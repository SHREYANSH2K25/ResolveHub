import mongoose from "mongoose"

const VerificationCodeSchema = new mongoose.Schema({
    code : {type : String, required : true, unique : true},
    city: { type: String, required: true }, 
    expiresAt : {
        type : Date,
        required : true,
        default : () => new Date ( +new Date() + 24*60*60*1000) 
    },
    used : {
        type : Boolean,
        default : true
    }
})

export const VerificationCode = mongoose.model('VerificationCode', VerificationCodeSchema);