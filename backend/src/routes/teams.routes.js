import express from "express";
import Team from "../models/teams.model.js";
import User from "../models/users.model.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

// ── GET /api/teams ───────────────────────────────────────────────────────────
router.get("/", requireAuth, requireAdmin, async (_req, res) => {
	try {
		const teams = await Team.find()
			.populate("members", "full_name email job_title department")
			.populate("createdBy", "full_name email")
			.sort({ createdAt: -1 });

		return res.status(200).json({ teams });
	} catch (error) {
		console.error("Teams GET Error:", error);
		return res.status(500).json({ error: error.message });
	}
});

// ── POST /api/teams ──────────────────────────────────────────────────────────
router.post("/", requireAuth, requireAdmin, async (req, res) => {
	try {
		const { name, members } = req.body;

		if (!name) {
			return res.status(400).json({ error: "Team name is required" });
		}

		const team = await Team.create({
			name,
			members: members || [],
			createdBy: req.user._id,
		});

		if (members && members.length > 0) {
			await User.updateMany({ _id: { $in: members } }, { teamId: team._id });
		}

		const populatedTeam = await Team.findById(team._id)
			.populate("members", "full_name email job_title department")
			.populate("createdBy", "full_name email");

		return res.status(201).json({ team: populatedTeam });
	} catch (error) {
		console.error("Teams POST Error:", error);
		return res.status(500).json({ error: error.message });
	}
});

// ── GET /api/teams/:id ───────────────────────────────────────────────────────
router.get("/:id", requireAuth, requireAdmin, async (req, res) => {
	try {
		const { id } = req.params;
		const team = await Team.findById(id)
			.populate("members", "full_name email job_title department")
			.populate("createdBy", "full_name email");

		if (!team) {
			return res.status(404).json({ error: "Team not found" });
		}

		return res.status(200).json({ team });
	} catch (error) {
		return res.status(500).json({ error: error.message });
	}
});

// ── PATCH /api/teams/:id ─────────────────────────────────────────────────────
router.patch("/:id", requireAuth, requireAdmin, async (req, res) => {
	try {
		const { id } = req.params;
		const { name, members } = req.body;

		const team = await Team.findById(id);
		if (!team) {
			return res.status(404).json({ error: "Team not found" });
		}

		const oldMembers = team.members.map((m) => m.toString());

		if (name) team.name = name;
		if (members !== undefined) team.members = members;

		await team.save();

		const removedMembers = oldMembers.filter((m) => !members.includes(m));
		if (removedMembers.length > 0) {
			await User.updateMany(
				{ _id: { $in: removedMembers } },
				{ $unset: { teamId: "" } },
			);
		}

		if (members && members.length > 0) {
			await User.updateMany({ _id: { $in: members } }, { teamId: team._id });
		}

		const updatedTeam = await Team.findById(id)
			.populate("members", "full_name email job_title department")
			.populate("createdBy", "full_name email");

		return res.status(200).json({ team: updatedTeam });
	} catch (error) {
		return res.status(500).json({ error: error.message });
	}
});

// ── DELETE /api/teams/:id ────────────────────────────────────────────────────
router.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
	try {
		const { id } = req.params;
		const team = await Team.findById(id);

		if (!team) {
			return res.status(404).json({ error: "Team not found" });
		}

		await User.updateMany({ teamId: id }, { $unset: { teamId: "" } });
		await Team.findByIdAndDelete(id);

		return res.status(200).json({ message: "Team deleted successfully" });
	} catch (error) {
		return res.status(500).json({ error: error.message });
	}
});

export default router;
