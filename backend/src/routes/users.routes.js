import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/users.model.js";
import { registerSchema } from "../schema/register.schema.js";
import {
	requireAuth,
	requireAdmin,
	requireAdminOrFlag,
} from "../middleware/auth.js";

const router = express.Router();

// ── GET /api/users  (paginated list) ─────────────────────────────────────────
// Any authenticated user; the result set is scoped by role.
router.get("/", requireAuth, async (req, res) => {
	try {
		const user = req.user;

		const page = Math.max(1, parseInt(req.query.page || "1", 10));
		const limit = Math.min(
			100,
			Math.max(1, parseInt(req.query.limit || "10", 10)),
		);
		const search = req.query.search || "";
		const skip = (page - 1) * limit;

		let query = {};
		if (user.role === "admin" || user.isAdmin) {
			// Admin can see everyone
			query = {};
		} else {
			// Members can only see Admins (to chat with support/management)
			query = { role: "admin" };
		}
		if (search) {
			query.$or = [
				{ full_name: { $regex: search, $options: "i" } },
				{ email: { $regex: search, $options: "i" } },
				{ department: { $regex: search, $options: "i" } },
			];
		}

		const [users, total] = await Promise.all([
			User.find(query)
				.select("-password -refreshToken -forgotpasswordtoken -verifytoken")
				.populate("teamId", "name")
				.sort({ createdAt: -1 })
				.skip(skip)
				.limit(limit),
			User.countDocuments(query),
		]);

		return res.status(200).json({
			users,
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
		});
	} catch (error) {
		console.error("Users GET Error:", error);
		return res.status(500).json({ error: error.message });
	}
});

// ── POST /api/users  (create single or bulk) ─────────────────────────────────
router.post("/", requireAuth, requireAdminOrFlag, async (req, res) => {
	try {
		const admin = req.user;
		const body = req.body;

		// Bulk: array of users
		const isBulk = Array.isArray(body);
		const entries = isBulk ? body : [body];

		const results = { created: [], failed: [] };

		for (const entry of entries) {
			// Validate with zod schema
			const parsed = registerSchema.safeParse({ ...entry, role: "member" });
			if (!parsed.success) {
				results.failed.push({
					entry,
					error: parsed.error.issues[0]?.message || "Validation failed",
				});
				continue;
			}

			const { username, name, email, password, company, job_title, department } =
				parsed.data;

			const exists = await User.findOne({ $or: [{ email }, { username }] });
			if (exists) {
				results.failed.push({ entry, error: `User already exists: ${email}` });
				continue;
			}

			const hashedPassword = await bcrypt.hash(password, 10);
			const newUser = await User.create({
				username,
				full_name: name,
				email,
				password: hashedPassword,
				role: "member",
				company: company || admin.company,
				job_title,
				department,
				isverified: true, // admin-created users are pre-verified
			});

			const safe = await User.findById(newUser._id).select(
				"-password -refreshToken -forgotpasswordtoken -verifytoken",
			);
			results.created.push(safe);
		}

		const status = results.created.length > 0 ? 201 : 400;
		return res.status(status).json(results);
	} catch (error) {
		console.error("Users POST Error:", error);
		return res.status(500).json({ error: error.message });
	}
});

// ── DELETE /api/users/:id ────────────────────────────────────────────────────
router.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
	try {
		const { id } = req.params;

		const user = await User.findById(id);
		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}
		if (user.role === "admin") {
			return res
				.status(403)
				.json({ error: "Cannot delete an admin account" });
		}

		await User.findByIdAndDelete(id);
		return res.status(200).json({ message: "User deleted successfully" });
	} catch (error) {
		console.error("Users DELETE Error:", error);
		return res.status(500).json({ error: error.message });
	}
});

// ── PATCH /api/users/:id  (reset password by admin) ──────────────────────────
router.patch("/:id", requireAuth, requireAdmin, async (req, res) => {
	try {
		const { id } = req.params;
		const { password } = req.body;

		if (!password || password.length < 6) {
			return res
				.status(400)
				.json({ error: "Password must be at least 6 characters" });
		}

		const user = await User.findById(id);
		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		const hashed = await bcrypt.hash(password, 10);
		await User.findByIdAndUpdate(id, { password: hashed, refreshToken: null });

		return res.status(200).json({ message: "Password updated successfully" });
	} catch (error) {
		console.error("Users PATCH Error:", error);
		return res.status(500).json({ error: error.message });
	}
});

export default router;
