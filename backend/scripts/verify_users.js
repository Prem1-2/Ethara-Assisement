import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../src/models/users.model.js";

dotenv.config();

const MONGO_URI = process.env.PROD_DATABASE_URL || process.env.MONGODB_URI;

async function verifyAllUsers() {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(MONGO_URI);
        console.log("Connected!");

        const result = await User.updateMany(
            { isverified: { $ne: true } },
            { $set: { isverified: true } }
        );

        console.log(`Updated ${result.modifiedCount} users to verified status.`);
        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

verifyAllUsers();
