import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "../src/models/users.model.js";

dotenv.config();

const MONGO_URI = process.env.PROD_DATABASE_URL || process.env.MONGODB_URI;

async function resetPassword() {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(MONGO_URI);

        const username = "Aadi_ai";
        const newPassword = "Password@123"; // A safe password that passes validation

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const result = await User.findOneAndUpdate(
            { username: username },
            { $set: { password: hashedPassword, isverified: true } },
            { new: true }
        );

        if (result) {
            console.log(`Password for user '${username}' has been reset to: ${newPassword}`);
        } else {
            console.log(`User '${username}' not found.`);
        }
        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

resetPassword();
