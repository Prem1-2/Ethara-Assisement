import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../src/models/users.model.js";

dotenv.config();

const MONGO_URI = process.env.PROD_DATABASE_URL || process.env.MONGODB_URI;

async function checkAdminQuery() {
    try {
        await mongoose.connect(MONGO_URI);

        const adminEmail = "saurabhkumar.poly123@gmail.com";
        const adminUser = await User.findOne({ email: adminEmail });

        console.log("Admin User:", {
            email: adminUser?.email,
            role: adminUser?.role,
            isAdmin: adminUser?.isAdmin
        });

        let query = {};
        if (adminUser && (adminUser.role === "admin" || adminUser.isAdmin)) {
            query = {};
        } else {
            query = { role: "admin" };
        }

        const totalUsers = await User.countDocuments(query);
        console.log("Total users matching query:", totalUsers);

        const users = await User.find(query).sort({ createdAt: -1 }).limit(120);
        const found = users.find(u => u.email === "2301731114@krmu.edu.in");
        if (found) {
            console.log("Target user found in query results at index:", users.indexOf(found));
        } else {
            console.log("Target user NOT found in query results!");
        }

        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

checkAdminQuery();
