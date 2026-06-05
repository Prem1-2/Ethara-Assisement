import express from "express";
import Project from "../models/projects.model.js";
import Task from "../models/task.model.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

// ── GET /api/projects ────────────────────────────────────────────────────────
router.get("/", requireAuth, requireAdmin, async (_req, res) => {
	try {
		const projects = await Project.find()
			.populate("teamId", "name")
			.populate("createdBy", "full_name email")
			.sort({ createdAt: -1 });

		return res.status(200).json({ projects });
	} catch (error) {
		return res.status(500).json({ error: error.message });
	}
});

// ── POST /api/projects ───────────────────────────────────────────────────────
router.post("/", requireAuth, requireAdmin, async (req, res) => {
	try {
		const { name, description, teamId } = req.body;

		if (!name || !teamId) {
			return res.status(400).json({ error: "Name and teamId are required" });
		}

		const project = await Project.create({
			name,
			description,
			teamId,
			createdBy: req.user._id,
		});

		const populatedProject = await Project.findById(project._id)
			.populate("teamId", "name")
			.populate("createdBy", "full_name email");

		return res.status(201).json({ project: populatedProject });
	} catch (error) {
		return res.status(500).json({ error: error.message });
	}
});

// ── GET /api/projects/:id ────────────────────────────────────────────────────
router.get("/:id", requireAuth, requireAdmin, async (req, res) => {
	try {
		const { id } = req.params;
		const project = await Project.findById(id)
			.populate("teamId", "name")
			.populate("createdBy", "full_name email");

		if (!project) {
			return res.status(404).json({ error: "Project not found" });
		}

		return res.status(200).json({ project });
	} catch (error) {
		return res.status(500).json({ error: error.message });
	}
});

// ── PATCH /api/projects/:id ──────────────────────────────────────────────────
router.patch("/:id", requireAuth, requireAdmin, async (req, res) => {
	try {
		const { id } = req.params;
		const { name, description, teamId } = req.body;

		const project = await Project.findByIdAndUpdate(
			id,
			{ name, description, teamId },
			{ new: true, runValidators: true },
		)
			.populate("teamId", "name")
			.populate("createdBy", "full_name email");

		if (!project) {
			return res.status(404).json({ error: "Project not found" });
		}

		return res.status(200).json({ project });
	} catch (error) {
		return res.status(500).json({ error: error.message });
	}
});

// ── DELETE /api/projects/:id ─────────────────────────────────────────────────
router.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
	try {
		const { id } = req.params;
		const project = await Project.findById(id);

		if (!project) {
			return res.status(404).json({ error: "Project not found" });
		}

		await Task.deleteMany({ projectId: id });
		await Project.findByIdAndDelete(id);

		return res.status(200).json({ message: "Project deleted successfully" });
	} catch (error) {
		return res.status(500).json({ error: error.message });
	}
});

export default router;
