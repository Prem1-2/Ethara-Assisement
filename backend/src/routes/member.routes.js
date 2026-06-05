import express from "express";
import Task from "../models/task.model.js";
import Project from "../models/projects.model.js";
import Team from "../models/teams.model.js";
import User from "../models/users.model.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// ── GET /api/member/dashboard ────────────────────────────────────────────────
router.get("/dashboard", requireAuth, async (req, res) => {
	try {
		const user = await User.findById(req.auth.id).populate("teamId", "name");
		if (!user) return res.status(404).json({ error: "User not found" });

		const memberId = user._id;

		const [
			totalTasks,
			todoTasks,
			inProgressTasks,
			doneTasks,
			overdueTasks,
			highTasks,
			mediumTasks,
			lowTasks,
		] = await Promise.all([
			Task.countDocuments({ assignedTo: memberId }),
			Task.countDocuments({ assignedTo: memberId, status: "todo" }),
			Task.countDocuments({ assignedTo: memberId, status: "in-progress" }),
			Task.countDocuments({ assignedTo: memberId, status: "done" }),
			Task.countDocuments({
				assignedTo: memberId,
				status: { $ne: "done" },
				dueDate: { $lt: new Date() },
			}),
			Task.countDocuments({ assignedTo: memberId, priority: "High" }),
			Task.countDocuments({ assignedTo: memberId, priority: "Medium" }),
			Task.countDocuments({ assignedTo: memberId, priority: "Low" }),
		]);

		const recentTasks = await Task.find({ assignedTo: memberId })
			.populate("projectId", "name")
			.sort({ updatedAt: -1 })
			.limit(5);

		const sixMonthsAgo = new Date();
		sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
		sixMonthsAgo.setDate(1);
		sixMonthsAgo.setHours(0, 0, 0, 0);

		const tasksByMonth = await Task.aggregate([
			{ $match: { assignedTo: memberId, createdAt: { $gte: sixMonthsAgo } } },
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
		for (const e of tasksByMonth) {
			const key = `${e._id.year}-${e._id.month}`;
			if (!progressMap[key]) continue;
			if (e._id.status === "todo") progressMap[key].todo = e.count;
			else if (e._id.status === "in-progress")
				progressMap[key].inProgress = e.count;
			else if (e._id.status === "done") progressMap[key].done = e.count;
		}

		return res.json({
			user: {
				_id: user._id,
				full_name: user.full_name,
				email: user.email,
				job_title: user.job_title,
				department: user.department,
				team: user.teamId,
			},
			stats: {
				totalTasks,
				todoTasks,
				inProgressTasks,
				doneTasks,
				overdueTasks,
				highTasks,
				mediumTasks,
				lowTasks,
			},
			taskProgress: Object.values(progressMap),
			recentTasks,
		});
	} catch (error) {
		console.error("Member dashboard error:", error);
		return res.status(500).json({ error: error.message });
	}
});

// ── GET /api/member/projects ─────────────────────────────────────────────────
router.get("/projects", requireAuth, async (req, res) => {
	try {
		const user = req.user;

		if (!user.teamId) {
			return res.json({ projects: [] });
		}

		const projects = await Project.find({ teamId: user.teamId })
			.populate(
				"createdBy",
				"full_name email role job_title department company",
			)
			.sort({ createdAt: -1 });

		const projectsWithStats = await Promise.all(
			projects.map(async (project) => {
				const [totalTasks, todoTasks, inProgressTasks, doneTasks] =
					await Promise.all([
						Task.countDocuments({ projectId: project._id }),
						Task.countDocuments({ projectId: project._id, status: "todo" }),
						Task.countDocuments({
							projectId: project._id,
							status: "in-progress",
						}),
						Task.countDocuments({ projectId: project._id, status: "done" }),
					]);
				return {
					_id: project._id,
					name: project.name,
					description: project.description,
					createdBy: project.createdBy,
					createdAt: project.createdAt,
					stats: {
						total: totalTasks,
						todo: todoTasks,
						inProgress: inProgressTasks,
						done: doneTasks,
						progress:
							totalTasks > 0
								? Math.round((doneTasks / totalTasks) * 100)
								: 0,
					},
				};
			}),
		);

		return res.json({ projects: projectsWithStats });
	} catch (error) {
		console.error("Fetch member projects API error:", error);
		return res.status(500).json({ error: error.message });
	}
});

// ── GET /api/member/tasks ────────────────────────────────────────────────────
router.get("/tasks", requireAuth, async (req, res) => {
	try {
		const user = req.user;
		const status = req.query.status;

		const query = { assignedTo: user._id };
		if (status && ["todo", "in-progress", "done"].includes(status)) {
			query.status = status;
		}

		const tasks = await Task.find(query)
			.populate("projectId", "name description")
			.populate({
				path: "updates.postedBy",
				select: "full_name",
				strictPopulate: false,
			})
			.sort({ createdAt: -1 });

		return res.json({ tasks });
	} catch (error) {
		console.error("GET /api/member/tasks error:", error.message);
		return res.status(500).json({ error: error.message });
	}
});

// ── GET /api/member/tasks/:id ────────────────────────────────────────────────
router.get("/tasks/:id", requireAuth, async (req, res) => {
	try {
		const user = req.user;
		const { id } = req.params;
		const task = await Task.findById(id)
			.populate("projectId", "name description")
			.populate({
				path: "updates.postedBy",
				select: "full_name",
				strictPopulate: false,
			});

		if (!task) return res.status(404).json({ error: "Task not found" });
		if (task.assignedTo.toString() !== user._id.toString()) {
			return res.status(403).json({ error: "Access denied" });
		}

		return res.json({ task });
	} catch (error) {
		console.error("GET /api/member/tasks/[id] error:", error.message);
		return res.status(500).json({ error: error.message });
	}
});

// ── PATCH /api/member/tasks/:id ──────────────────────────────────────────────
router.patch("/tasks/:id", requireAuth, async (req, res) => {
	try {
		const user = req.user;
		const { id } = req.params;
		const task = await Task.findById(id);

		if (!task) return res.status(404).json({ error: "Task not found" });
		if (task.assignedTo.toString() !== user._id.toString()) {
			return res.status(403).json({ error: "Access denied" });
		}

		const body = req.body;

		if (body.status) {
			const allowed = ["todo", "in-progress", "done"];
			if (!allowed.includes(body.status)) {
				return res.status(400).json({ error: "Invalid status" });
			}
			task.status = body.status;
		}

		if (body.note && body.note.trim()) {
			task.updates.push({ note: body.note.trim(), postedBy: user._id });
		}

		await task.save();

		const updated = await Task.findById(id)
			.populate("projectId", "name description")
			.populate({
				path: "updates.postedBy",
				select: "full_name",
				strictPopulate: false,
			});

		return res.json({ task: updated });
	} catch (error) {
		console.error("PATCH /api/member/tasks/[id] error:", error.message);
		return res.status(500).json({ error: error.message });
	}
});

// ── GET /api/member/team ─────────────────────────────────────────────────────
router.get("/team", requireAuth, async (req, res) => {
	try {
		const user = req.user;

		if (!user.teamId) {
			return res.json({ team: null, members: [] });
		}

		const team = await Team.findById(user.teamId)
			.populate(
				"createdBy",
				"full_name email role job_title department company",
			)
			.populate(
				"members",
				"full_name email role job_title department company",
			);

		if (!team) {
			return res.json({ team: null, members: [] });
		}

		return res.json({
			team: {
				_id: team._id,
				name: team.name,
				createdBy: team.createdBy,
				createdAt: team.createdAt,
			},
			members: team.members || [],
		});
	} catch (error) {
		console.error("Fetch member team API error:", error);
		return res.status(500).json({ error: error.message });
	}
});

export default router;
