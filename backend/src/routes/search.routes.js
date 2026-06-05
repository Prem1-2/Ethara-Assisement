import express from "express";
import Project from "../models/projects.model.js";
import Task from "../models/task.model.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// ── GET /api/search?q= ───────────────────────────────────────────────────────
router.get("/", requireAuth, async (req, res) => {
	try {
		const user = req.user;
		const q = req.query.q || "";

		if (!q.trim()) {
			return res.json({ tasks: [], projects: [] });
		}

		const queryRegex = new RegExp(q, "i");

		if (user.role === "admin" || user.isAdmin) {
			// Admin can search all tasks and projects
			const projects = await Project.find({ name: queryRegex })
				.populate("teamId", "name")
				.limit(10);

			const tasks = await Task.find({ title: queryRegex })
				.populate("projectId", "name")
				.populate("assignedTo", "full_name email")
				.limit(10);

			return res.json({ tasks, projects });
		}

		// Member can search tasks assigned to them
		const tasks = await Task.find({
			assignedTo: user._id,
			title: queryRegex,
		})
			.populate("projectId", "name")
			.limit(10);

		// Find projects related to the user's tasks that match the query name
		const userTasks = await Task.find({ assignedTo: user._id }).select(
			"projectId",
		);
		const projectIds = [
			...new Set(
				userTasks.map((t) => t.projectId?.toString()).filter(Boolean),
			),
		];

		const projects = await Project.find({
			_id: { $in: projectIds },
			name: queryRegex,
		})
			.populate("teamId", "name")
			.limit(10);

		return res.json({ tasks, projects });
	} catch (error) {
		console.error("Search API Error:", error);
		return res.status(500).json({ error: error.message });
	}
});

export default router;
