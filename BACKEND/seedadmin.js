import mongoose from "mongoose"
import "dotenv/config"
import {User} from "./src/models/User.js"
import { hashPassword } from "./src/services/authService.js"

const MONGO_URI = process.env.MONGO_URI

const seedAdmin = async() => {
    try{
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB");

        const existingAdmin = await User.findOne({role : "admin"});
        if(existingAdmin) {
            console.log("Admin already exists");
            process.exit(0);
        }

        const password = await hashPassword("Admin@123");
        const admin = new User({
            name : "Super Admin",
            email: "shreyansh@resolvehub.com",
            password,
            role: "admin"
        });
        await admin.save();
        console.log("Admin user created,");

        process.exit(0);
    }catch(err) {
        console.error("Erro seeding admin: ", err);
        process.exit(1);
    }
};

seedAdmin();
