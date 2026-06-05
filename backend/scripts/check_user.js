import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../src/models/users.model.js";

dotenv.config();

const MONGO_URI = process.env.PROD_DATABASE_URL || process.env.MONGODB_URI;

async function checkUser() {
    try {
        await mongoose.connect(MONGO_URI);
        const email = "2301731114@krmu.edu.in";
        const user = await User.findOne({ email });
        if (user) {
            console.log("User found:");
            console.log(user);
        } else {
            console.log("User NOT found in database: " + email);
        }
        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

checkUser();
