import express from "express";
import auth from "../middlewares/auth.mjs"
import authorize from "../middlewares/rbac.js";
import { User } from "../models/User.js";
import {hashPassword} from "../services/authService.js"

const router = express.Router();

router.post('/users', auth, authorize('admin'), async(req, res) => {
    const { name, email, password} = req.body;

    try{
        let user = await User.findOne({email});
        if(user) return user.status(400).json({msg : 'User already exists'});

        user = new User({name, email, password});
        user.password = await hashPassword(password);

        // explictly assigned role to staff
        user.role = 'staff';

        await user.save();

        res.json({
            msg : "Staff user created successfully and provisioned",
            userId : user.id,
            role : user.role
        });
    }
    catch(err){
        console.error('Admin user creation error: ', err.message);
        res.status(500).send('Server error');
    }
})

export default router;