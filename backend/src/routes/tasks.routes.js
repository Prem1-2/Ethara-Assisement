import express from "express";
import Task from "../models/task.model.js";
import {
	requireAuth,
	requireAdmin,
	requireAdminOrFlag,
} from "../middleware/auth.js";

const router = express.Router();

// ── GET /api/tasks ───────────────────────────────────────────────────────────
router.get("/", requireAuth, requireAdminOrFlag, async (req, res) => {
	try {
		const projectId = req.query.projectId;
		const query = projectId ? { projectId } : {};

		const tasks = await Task.find(query)
			.populate("assignedTo", "full_name email")
			.populate("projectId", "name")
			.sort({ createdAt: -1 });

		return res.status(200).json({ tasks });
	} catch (error) {
		return res.status(500).json({ error: error.message });
	}
});

// ── POST /api/tasks ──────────────────────────────────────────────────────────
router.post("/", requireAuth, requireAdminOrFlag, async (req, res) => {
	try {
		const body = req.body;
		const { title, description, status, priority, projectId, dueDate } = body;

		if (!title || !projectId) {
			return res
				.status(400)
				.json({ error: "Title and projectId are required" });
		}

		// ── Team-wise assignment: create one task per selected member ──────────
		if (
			body.assignToTeam &&
			Array.isArray(body.memberIds) &&
			body.memberIds.length > 0
		) {
			const created = await Promise.all(
				body.memberIds.map((memberId) =>
					Task.create({
						title,
						description,
						status: status || "todo",
						priority: priority || "Medium",
						assignedTo: memberId,
						projectId,
						dueDate,
					}),
				),
			);

			const populated = await Task.find({
				_id: { $in: created.map((t) => t._id) },
			})
				.populate("assignedTo", "full_name email")
				.populate("projectId", "name");

			return res
				.status(201)
				.json({ tasks: populated, count: populated.length });
		}

		// ── Single assignment ──────────────────────────────────────────────────
		if (!body.assignedTo) {
			return res
				.status(400)
				.json({ error: "assignedTo is required for single assignment" });
		}

		const task = await Task.create({
			title,
			description,
			status: status || "todo",
			priority: priority || "Medium",
			assignedTo: body.assignedTo,
			projectId,
			dueDate,
		});

		const populatedTask = await Task.findById(task._id)
			.populate("assignedTo", "full_name email")
			.populate("projectId", "name");

		return res.status(201).json({ task: populatedTask });
	} catch (error) {
		return res.status(500).json({ error: error.message });
	}
});

// ── GET /api/tasks/:id ───────────────────────────────────────────────────────
router.get("/:id", requireAuth, requireAdmin, async (req, res) => {
	try {
		const { id } = req.params;
		const task = await Task.findById(id)
			.populate("assignedTo", "full_name email")
			.populate("projectId", "name");

		if (!task) {
			return res.status(404).json({ error: "Task not found" });
		}

		return res.status(200).json({ task });
	} catch (error) {
		return res.status(500).json({ error: error.message });
	}
});

// ── PATCH /api/tasks/:id ─────────────────────────────────────────────────────
router.patch("/:id", requireAuth, requireAdmin, async (req, res) => {
	try {
		const { id } = req.params;
		const { title, description, status, assignedTo, projectId, dueDate } =
			req.body;

		const task = await Task.findByIdAndUpdate(
			id,
			{ title, description, status, assignedTo, projectId, dueDate },
			{ new: true, runValidators: true },
		)
			.populate("assignedTo", "full_name email")
			.populate("projectId", "name");

		if (!task) {
			return res.status(404).json({ error: "Task not found" });
		}

		return res.status(200).json({ task });
	} catch (error) {
		return res.status(500).json({ error: error.message });
	}
});

// ── DELETE /api/tasks/:id ────────────────────────────────────────────────────
router.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
	try {
		const { id } = req.params;
		const task = await Task.findByIdAndDelete(id);

		if (!task) {
			return res.status(404).json({ error: "Task not found" });
		}

		return res.status(200).json({ message: "Task deleted successfully" });
	} catch (error) {
		return res.status(500).json({ error: error.message });
	}
});

export default router;
