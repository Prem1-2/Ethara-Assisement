import mongoose from "mongoose";

const TaskUpdateSchema = new mongoose.Schema(
	{
		note: { type: String, required: true },
		postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
	},
	{ timestamps: true },
);

const TaskSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: true,
			trim: true,
		},
		description: {
			type: String,
		},
		status: {
			type: String,
			enum: ["todo", "in-progress", "done"],
			default: "todo",
		},
		priority: {
			type: String,
			enum: ["Low", "Medium", "High"],
			default: "Medium",
		},
		assignedTo: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		projectId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Project",
			required: true,
		},
		dueDate: {
			type: Date,
		},
		updates: [TaskUpdateSchema],
	},
	{ timestamps: true },
);

// Delete cached model to ensure the schema with `updates` is always used
delete mongoose.models.Task;
export default mongoose.model("Task", TaskSchema);
