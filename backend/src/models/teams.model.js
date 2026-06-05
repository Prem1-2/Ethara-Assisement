import mongoose from "mongoose";

const TeamSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
		},
		members: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "User",
			},
		],
		createdBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
	},
	{ timestamps: true },
);

export default mongoose.models.Team || mongoose.model("Team", TeamSchema);
