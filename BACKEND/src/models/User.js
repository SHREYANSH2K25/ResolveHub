import mongoose from "mongoose"

const UserSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true
    },
    email :{
        type : String,
        required : true,
        unique : true
    },
    phone: { 
        type: String,
        required: false, // Make it optional, but recommended for notifications
        unique: true,
        sparse: true 
    },
    password : {
        type : String,
        required : true
    },
    role : {
        type : String,
        enum : ['citizen', 'staff', 'admin'],
        default : 'citizen'
    },
    points : {
        type : Number,
        default : 0
    },
    department : {
        type : String
    },
      provider: {
      type: String, // 'google' | 'github' | 'local'
      default: "local",
    },
    providerId: {
      type: String,
      index: true,
      sparse: true,
    },

},{timestamps : true});

export const User = mongoose.model('User', UserSchema)