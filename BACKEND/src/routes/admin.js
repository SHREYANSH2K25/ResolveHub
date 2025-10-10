import express from "express";
import auth from "../middlewares/auth.js"
import authorize from "../middlewares/rbac.js";
import { User } from "../models/User.js";
import {hashPassword} from "../services/authService.js"
import { VerificationCode } from "../models/Verificationmodel.js";

const router = express.Router();

router.post('/users', auth, authorize('admin'), async(req, res) => {
    const { name, email, password, city, department} = req.body;
    
    try{
        const admin = await User.findById(req.user.id);
        if(!admin) return res.status(403).json({msg: "Admin not found"});
        if (!admin.city) {
            return res.status(400).json({ msg: "Admin city not assigned" });
        }
        if (!department || department.trim() === '') {
            return res.status(400).json({ msg: 'Department is required for creating staff member.' });
        }

        // Validate department enum
        const validDepartments = ['Sanitation', 'Structural', 'Plumbing', 'Electrical'];
        if (!validDepartments.includes(department.trim())) {
            return res.status(400).json({ msg: 'Invalid department. Must be one of: ' + validDepartments.join(', ') });
        }

        let user = await User.findOne({email});
        if(user) return res.status(400).json({msg : 'User already exists'});

        user = new User({
            name, 
            email, 
            password, 
            city : admin.city,
            role: 'staff',
            department: department.trim()
        });

        user.password = await hashPassword(password);
        await user.save();

        res.json({
            msg : `Staff user created for ${admin.city} successfully and provisioned`,
            userId : user.id,
            role : user.role,
            city : user.city,
            department : user.department
        });
    }
    catch(err){
        console.error('Admin user creation error: ', err.message);
        res.status(500).send('Server error');
    }
})


router.post('/verification-code', auth, authorize('admin'), async(req, res)=> {
    try{
        const admin = await User.findById(req.user.id);
        if (!admin) return res.status(403).json({ msg: "Admin not found" });
        if (!admin.city) return res.status(400).json({ msg: "Admin city not assigned" });
        // invalidate old code and generate a new one
        await VerificationCode.updateMany(
            { used : false, city : admin.city},
            { $set : {
                used : true
            }}
        );
        
        // Generation a code
        const newCode = Math.random().toString(36).substring(2,8).toUpperCase();
        const code = new VerificationCode({
            code : newCode,
            city : admin.city,
            used : false,
            expiresAt: new Date(Date.now() + 24*60*60*1000)
        })
        await code.save();

        res.json({
            msg: `Verification code generated for ${admin.city}`,
            code: newCode
        });

    }
    catch(err) {
        console.error("Verification Code generation error : ", err.message);
        res.status(500).send('Server error');
    }
})
export default router;