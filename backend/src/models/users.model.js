import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
	{
		username: {
			type: String,
			required: [true, "provide username"],
			unique: true,
		},
		email: {
			type: String,
			required: [true, "provide username"],
			unique: true,
		},
		full_name: {
			type: String,
			required: [true, "provide username"],
		},
		password: {
			type: String,
			required: [true],
		},
		isverified: {
			type: Boolean,
			default: false,
		},
		// Admin access control - ONLY USERS WITH isAdmin=true CAN LOGIN
		isAdmin: {
			type: Boolean,
			default: false,
		},
		role: {
			type: String,
			enum: ["admin", "member"],
			default: "member",
		},
		job_title: {
			type: String,
			required: [true, "provide job title"],
		},
		department: {
			type: String,
			required: [true, "provide department name"],
		},
		company: {
			type: String,
			required: [true, "provide company name"],
		},
		teamId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Team",
			required: false,
		},
		forgotpasswordtoken: String,
		forgotpasswordtokenexpiry: Date,
		verifytoken: String,
		verifytokenexpiry: Date,
		refreshToken: String,
	},
	{ timestamps: true },
);

const UsersModel = mongoose.models.User || mongoose.model("User", UserSchema);

export default UsersModel;
