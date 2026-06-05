import express from "express";
import Project from "../models/projects.model.js";
import Task from "../models/task.model.js";
import User from "../models/users.model.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

// ── GET /api/admin/progress ──────────────────────────────────────────────────
router.get("/progress", requireAuth, requireAdmin, async (req, res) => {
	try {
		const projectId = req.query.projectId;
		const memberId = req.query.memberId;

		// ── Single member detail ──────────────────────────────────────────────
		if (memberId) {
			const member = await User.findById(memberId)
				.select("full_name email job_title department")
				.populate("teamId", "name");
			if (!member) return res.status(404).json({ error: "Member not found" });

			const tasks = await Task.find({ assignedTo: memberId })
				.populate("projectId", "name")
				.populate({
					path: "updates.postedBy",
					select: "full_name",
					strictPopulate: false,
				})
				.sort({ updatedAt: -1 });

			const stats = {
				total: tasks.length,
				todo: tasks.filter((t) => t.status === "todo").length,
				inProgress: tasks.filter((t) => t.status === "in-progress").length,
				done: tasks.filter((t) => t.status === "done").length,
				overdue: tasks.filter(
					(t) =>
						t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "done",
				).length,
			};

			return res.json({ member, tasks, stats });
		}

		// ── Single project detail ─────────────────────────────────────────────
		if (projectId) {
			const project = await Project.findById(projectId)
				.populate("teamId", "name members")
				.populate("createdBy", "full_name");
			if (!project) return res.status(404).json({ error: "Project not found" });

			const tasks = await Task.find({ projectId })
				.populate("assignedTo", "full_name email job_title")
				.populate({
					path: "updates.postedBy",
					select: "full_name",
					strictPopulate: false,
				})
				.sort({ createdAt: -1 });

			// Group tasks by member
			const memberMap = {};
			for (const task of tasks) {
				const uid = task.assignedTo?._id?.toString();
				if (!uid) continue;
				if (!memberMap[uid]) {
					memberMap[uid] = {
						member: task.assignedTo,
						tasks: [],
						stats: { total: 0, todo: 0, inProgress: 0, done: 0, overdue: 0 },
					};
				}
				memberMap[uid].tasks.push(task);
				memberMap[uid].stats.total++;
				if (task.status === "todo") memberMap[uid].stats.todo++;
				else if (task.status === "in-progress")
					memberMap[uid].stats.inProgress++;
				else if (task.status === "done") memberMap[uid].stats.done++;
				if (
					task.dueDate &&
					new Date(task.dueDate) < new Date() &&
					task.status !== "done"
				) {
					memberMap[uid].stats.overdue++;
				}
			}

			const totalTasks = tasks.length;
			const doneTasks = tasks.filter((t) => t.status === "done").length;
			const projectStats = {
				total: totalTasks,
				done: doneTasks,
				inProgress: tasks.filter((t) => t.status === "in-progress").length,
				todo: tasks.filter((t) => t.status === "todo").length,
				overdue: tasks.filter(
					(t) =>
						t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "done",
				).length,
				completionRate:
					totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0,
			};

			return res.json({
				project,
				memberProgress: Object.values(memberMap),
				projectStats,
			});
		}

		// ── All projects overview ─────────────────────────────────────────────
		const projects = await Project.find()
			.populate("teamId", "name")
			.populate("createdBy", "full_name")
			.sort({ createdAt: -1 });

		const projectsWithStats = await Promise.all(
			projects.map(async (proj) => {
				const tasks = await Task.find({ projectId: proj._id });
				const total = tasks.length;
				const done = tasks.filter((t) => t.status === "done").length;
				const inProgress = tasks.filter(
					(t) => t.status === "in-progress",
				).length;
				const overdue = tasks.filter(
					(t) =>
						t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "done",
				).length;
				return {
					_id: proj._id,
					name: proj.name,
					description: proj.description,
					team: proj.teamId,
					createdBy: proj.createdBy,
					createdAt: proj.createdAt,
					stats: {
						total,
						done,
						inProgress,
						todo: tasks.filter((t) => t.status === "todo").length,
						overdue,
						completionRate: total > 0 ? Math.round((done / total) * 100) : 0,
					},
				};
			}),
		);

		return res.json({ projects: projectsWithStats });
	} catch (error) {
		console.error("Progress API error:", error);
		return res.status(500).json({ error: error.message });
	}
});

export default router;
