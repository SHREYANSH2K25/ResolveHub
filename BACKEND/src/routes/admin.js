import express from "express";
import auth from "../middlewares/auth.js"
import authorize from "../middlewares/rbac.js";
import { User } from "../models/User.js";
import {hashPassword} from "../services/authService.js"
import { VerificationCode } from "../models/Verificationmodel.js";

const router = express.Router();

router.post('/users', auth, authorize('admin'), async(req, res) => {
    const { name, email, password, city} = req.body;
    if(!city || city.trim() === ''){
        return res.status(400).json({ msg: 'City is required for creating staff member.'})
    }
    try{
        let user = await User.findOne({email});
        if(user) return user.status(400).json({msg : 'User already exists'});

        user = new User({name, email, password, city});
        user.password = await hashPassword(password);

        // explictly assigned role to staff
        user.role = 'staff';
        user.city = city.trim();
        await user.save();

        res.json({
            msg : `Staff user created for ${city} successfully and provisioned`,
            userId : user.id,
            role : user.role
        });
    }
    catch(err){
        console.error('Admin user creation error: ', err.message);
        res.status(500).send('Server error');
    }
})


router.post('/verification-code', auth, authorize('admin'), async(req, res)=> {
    try{
        // Generation a code
        const newCode = Math.random().toString(36).substring(2,8).toUpperCase();

        // invalidate old code and generate a new one
        await VerificationCode.updateMany(
            { used : false},
            { $set : {
                used : true
            }}
        );

        const code = new VerificationCode({
            code : newCode
        })
        await code.save();
    }
    catch(err) {
        console.error("Verification Code generation error : ", err.message);
        res.status(500).send('Server error');
    }
})
export default router;