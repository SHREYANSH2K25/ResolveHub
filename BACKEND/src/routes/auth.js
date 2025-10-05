import express from 'express'
import {User} from '../models/User.js' 
import {hashPassword, comparePassword, generateToken} from '../services/authService.js'

const router = express.Router();


// Register User
router.post('/register', async(req, res) => {
    const {name, email, password} = req.body;

    try {
        let user = await User.findOne({email});
        if(user) return res.status(400).json ({msg : "User already exists"});

        // Create new user instance
        user = new User ({ name, email, password});

        // Hash password
        user.password = await hashPassword(password);
        await user.save(); // now user has _id assigned by mongo 

        // generate new token and sends it back
        const token = generateToken(user.id, user.role);
        res.json({token});
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