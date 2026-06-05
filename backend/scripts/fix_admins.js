import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../src/models/users.model.js";

dotenv.config();

const MONGO_URI = process.env.PROD_DATABASE_URL || process.env.MONGODB_URI;

async function fixAdminPermissions() {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(MONGO_URI);

        const result = await User.updateMany(
            { role: "admin", isAdmin: { $ne: true } },
            { $set: { isAdmin: true } }
        );

        console.log(`Successfully updated ${result.modifiedCount} accounts to have proper Admin permissions.`);
        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

fixAdminPermissions();
