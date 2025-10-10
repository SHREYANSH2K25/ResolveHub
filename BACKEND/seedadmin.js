import mongoose from "mongoose"
import "dotenv/config"
import {User} from "./src/models/User.js"
import { hashPassword } from "./src/services/authService.js"

const MONGO_URI = process.env.MONGO_URI

const seedAdmin = async() => {
    try{
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB");

        const adminData = [
            {name : 'Global Admin', email : "global.admin@resolvehub.com", city :"Global"},
            { name : "Delhi Admin", email: "delhi.admin@resolvehub.com", city: "Delhi"},
            { name : "Mumbai Admin", email: "mumbai.admin@resolvehub.com", city: "Mumbai"},
            { name : "Prayagraj Admin", email: "prayagraj.admin@resolvehub.com", city: "Prayagraj"},
            { name : "Chennai Admin", email: "chennai.admin@resolvehub.com", city: "Chennai"},
            { name : "Jaipur Admin", email: "jaipur.admin@resolvehub.com", city: "Jaipur"},
        ]

        const password = await hashPassword("Admin@123");

        for(const admin of adminData){
            const existingAdmin = await User.findOne({role : "admin", city : admin.city});
            if(existingAdmin) {
                console.log("Admin already exists");
                continue;
            }
        
        const newAdmin = new User({
            name : admin.name,
            email: admin.email,
            password,
            role: "admin",
            city: admin.city
        });
        await newAdmin.save();
        console.log(`Admin for ${admin.city} created : ${admin.email}`);

    }
        process.exit(0);
    }catch(err) {
        console.error("Erro seeding admin: ", err);
        process.exit(1);
    }
};

seedAdmin();
