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

},{timestamps : true});

export const User = mongoose.model('User', UserSchema)