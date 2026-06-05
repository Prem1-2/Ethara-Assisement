import express from "express";
import Team from "../models/teams.model.js";
import Project from "../models/projects.model.js";
import Task from "../models/task.model.js";
import User from "../models/users.model.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

// ── GET /api/dashboard ───────────────────────────────────────────────────────
router.get("/", requireAuth, requireAdmin, async (_req, res) => {
	try {
		const totalTeams = await Team.countDocuments();
		const totalProjects = await Project.countDocuments();
		const totalTasks = await Task.countDocuments();
		const totalMembers = await User.countDocuments({ role: "member" });

		const todoTasks = await Task.countDocuments({ status: "todo" });
		const inProgressTasks = await Task.countDocuments({ status: "in-progress" });
		const doneTasks = await Task.countDocuments({ status: "done" });
		const overdueTasks = await Task.countDocuments({
			dueDate: { $lt: new Date() },
			status: { $ne: "done" },
		});

		// Monthly task progress for the last 6 months
		const sixMonthsAgo = new Date();
		sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
		sixMonthsAgo.setDate(1);
		sixMonthsAgo.setHours(0, 0, 0, 0);

		const tasksByMonth = await Task.aggregate([
			{ $match: { createdAt: { $gte: sixMonthsAgo } } },
			{
				$group: {
					_id: {
						year: { $year: "$createdAt" },
						month: { $month: "$createdAt" },
						status: "$status",
					},
					count: { $sum: 1 },
				},
			},
			{ $sort: { "_id.year": 1, "_id.month": 1 } },
		]);

		const monthNames = [
			"Jan", "Feb", "Mar", "Apr", "May", "Jun",
			"Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
		];
		const progressMap = {};
		for (let i = 0; i < 6; i++) {
			const d = new Date();
			d.setMonth(d.getMonth() - (5 - i));
			const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
			progressMap[key] = {
				month: monthNames[d.getMonth()],
				todo: 0,
				inProgress: 0,
				done: 0,
			};
		}

		for (const entry of tasksByMonth) {
			const key = `${entry._id.year}-${entry._id.month}`;
			if (!progressMap[key]) continue;
			if (entry._id.status === "todo") progressMap[key].todo = entry.count;
			else if (entry._id.status === "in-progress")
				progressMap[key].inProgress = entry.count;
			else if (entry._id.status === "done") progressMap[key].done = entry.count;
		}

		const taskProgress = Object.values(progressMap);

		const teamMembers = await User.find({ role: "member" })
			.select("full_name email job_title department teamId")
			.populate("teamId", "name")
			.sort({ createdAt: -1 })
			.limit(10);

		const recentProjects = await Project.find()
			.populate("teamId", "name")
			.populate("createdBy", "full_name")
			.sort({ createdAt: -1 })
			.limit(5);

		const recentTasks = await Task.find()
			.populate("assignedTo", "full_name")
			.populate("projectId", "name")
			.sort({ createdAt: -1 })
			.limit(5);

		return res.status(200).json({
			stats: { totalTeams, totalProjects, totalTasks, totalMembers },
			taskBreakdown: {
				todo: todoTasks,
				inProgress: inProgressTasks,
				done: doneTasks,
				overdue: overdueTasks,
			},
			taskProgress,
			teamMembers,
			recentProjects,
			recentTasks,
		});
	} catch (error) {
		console.error("Dashboard API Error:", error);
		return res.status(500).json({ error: error.message });
	}
});

export default router;
