import mongoose from "mongoose";

const SessionSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		device: String,
		browser: String,
		ip: String,
		location: String,
		lastActive: {
			type: Date,
			default: Date.now,
			expires: 60 * 60 * 24 * 5, // ✅ 5 days
		},
		isCurrent: {
			type: Boolean,
			default: true,
		},
	},
	{ timestamps: true },
);

const SessionModel =
	mongoose.models.Session || mongoose.model("Session", SessionSchema);

export default SessionModel;
