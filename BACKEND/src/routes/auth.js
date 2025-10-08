import express from 'express'
import {User} from '../models/User.js' 
import {hashPassword, comparePassword, generateToken} from '../services/authService.js'
import { VerificationCode } from '../models/Verificationmodel.js';

const router = express.Router();


// Register User
router.post('/register', async(req, res) => {
    const {name, email, password, verificationcode, city, desiredRole, department} = req.body;

    try {

        let user = await User.findOne({email});
        if(user) return res.status(400).json ({msg : "User already exists"});

        // Initialize default User data
        let finalRole = 'citizen';
        let finalCity = null;
        let finalDepartment = null;

        // if admin then check whether admin exists already if not assign user data
        if(desiredRole === 'admin'){
            const adminCount = await User.countDocuments({role : 'admin' });

            if(adminCount === 0) {
                finalRole = 'admin';
                finalCity = city || 'Global';
                finalDepartment = null;
            } else{
                return res.status(403).json({msg : 'Admin role already exists and cannot be created by public registration.'})
            }
        }

        // staff self-registration and verification using code
        if(desiredRole === 'staff') {
            const validCode = await VerificationCode.findOne({ code: verificationcode, used : false});
            if(!validCode || validCode.expiresAt < new Date()) {
                return res.status(403).json({ msg : 'Invalid or expired code please verify your code.'});
            }

            if(!city || !department ) {
                return res.status(400).json({msg : 'City and Department are required for registration.'})
            }

            finalRole = 'staff';
            finalCity = city;
            finalDepartment = department;

            verificationcode.used = true;
            await verificationcode.save();
        }

        if(finalRole === 'citizen'){
            finalCity = null;
            finalDepartment = null;
        }

        // Create new user instance
        user = new User ({ 
            name, 
            email, 
            password, 
            role : finalRole, 
            city : finalCity, 
            department : finalDepartment
        });

        // Hash password
        user.password = await hashPassword(password);
        await user.save(); // now user has _id assigned by mongo 

        // generate new token and sends it back
        const token = generateToken(user.id, user.role);
        res.json({token, role : user.role});
    } catch(err){
        console.error(err.message);
        res.status(500).send('Server error');
    }
})

router.post('/login', async(req, res) => {
    const {email, password} = req.body;

    try {
        let user = await User.findOne({email});
        if(!user) return res.status(400).json({msg : 'Invalid Credentials'});

        const isMatch = await comparePassword(password, user.password);
        if(!isMatch) return res.status(400).json({msg : 'Invalid Credentials'});

        const token = generateToken(user.id, user.role);
        res.json({token});
    } catch(err){
        console.error(err.message);
        res.status(500).send('Server error');
    }
})

export default router;