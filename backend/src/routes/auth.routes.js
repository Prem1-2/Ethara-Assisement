import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UAParser } from "ua-parser-js";
import User from "../models/users.model.js";
import Session from "../models/session.model.js";
import { loginSchema, verifyEmailSchema } from "../schema/login.schema.js";
import { registerSchema } from "../schema/register.schema.js";
import { sendEmail } from "../utils/mailer.js";
import { requireAuth } from "../middleware/auth.js";
import {
	cookieBase,
	ACCESS_TOKEN_MAX_AGE,
	REFRESH_TOKEN_MAX_AGE,
} from "../utils/cookies.js";
import logger from "../logger/logger.js";

const router = express.Router();

// ── POST /api/auth/login ─────────────────────────────────────────────────────
router.post("/login", async (req, res) => {
	try {
		const reqBody = req.body;
		const parsedData = loginSchema.parse(reqBody);
		const { password } = parsedData;
		const selectedRole = reqBody.role;
		const email = "email" in parsedData ? parsedData.email : undefined;
		const username = "username" in parsedData ? parsedData.username : undefined;

		const query = email ? { email } : { username };
		const existingUser = await User.findOne(query);

		if (!existingUser) {
			return res.status(400).json({ message: "User does not exist" });
		}

		if (selectedRole && existingUser.role !== selectedRole) {
			return res.status(403).json({
				message: `Access denied: This account is registered as a ${existingUser.role}, not a ${selectedRole}.`,
			});
		}

		if (existingUser.role === "admin" && !existingUser.isAdmin) {
			existingUser.isAdmin = true;
			await existingUser.save();
			console.log("Auto-fixed isAdmin status for:", existingUser.email);
		}

		if (!existingUser.isverified) {
			return res.status(403).json({
				message: "Please verify your email before logging in",
				isVerified: false,
			});
		}

		const validPassword = await bcrypt.compare(password, existingUser.password);

		if (!validPassword) {
			return res.status(400).json({ message: "Wrong password!" });
		}

		const tokenData = {
			id: existingUser._id,
			role: existingUser.role,
			isAdmin: existingUser.isAdmin,
		};

		const token = jwt.sign(tokenData, process.env.TOKEN_SECRET, {
			expiresIn: "1d",
		});

		const refreshToken = jwt.sign(tokenData, process.env.TOKEN_SECRET, {
			expiresIn: "5d",
		});

		await User.findByIdAndUpdate(existingUser._id, { refreshToken });

		const ua = new UAParser(req.headers["user-agent"]);
		const device = ua.getDevice().model || "Desktop";
		const browser = ua.getBrowser().name || "Unknown";

		const ip =
			req.headers["x-forwarded-for"] ||
			req.headers["x-real-ip"] ||
			req.ip ||
			"unknown";

		await Session.updateMany({ userId: existingUser._id }, { isCurrent: false });

		const session = await Session.create({
			userId: existingUser._id,
			device,
			browser,
			ip,
			location: "Unknown",
			isCurrent: true,
		});

		const sessions = await Session.find({ userId: existingUser._id }).sort({
			createdAt: -1,
		});

		if (sessions.length > 5) {
			const sessionsToDelete = sessions.slice(5);
			const ids = sessionsToDelete.map((s) => s._id);
			await Session.deleteMany({ _id: { $in: ids } });
		}

		res.cookie("token", token, { ...cookieBase(), maxAge: ACCESS_TOKEN_MAX_AGE });
		res.cookie("refreshToken", refreshToken, {
			...cookieBase(),
			maxAge: REFRESH_TOKEN_MAX_AGE,
		});
		res.cookie("sessionId", session._id.toString(), {
			...cookieBase(),
			maxAge: REFRESH_TOKEN_MAX_AGE,
		});

		return res.json({
			message: "Logged In Successfully",
			success: true,
			user: {
				id: existingUser._id,
				username: existingUser.username,
				full_name: existingUser.full_name,
				email: existingUser.email,
				role: existingUser.role,
				isAdmin: existingUser.isAdmin,
				company: existingUser.company,
				joined: existingUser.createdAt,
			},
			sessionId: session._id,
		});
	} catch (error) {
		console.error("Login error detail:", error);
		return res
			.status(500)
			.json({ message: error.message || "Internal server error" });
	}
});

// ── POST /api/auth/logout ────────────────────────────────────────────────────
router.post("/logout", async (req, res) => {
	try {
		const sessionId = req.cookies?.sessionId;

		// Clear refresh token from database
		try {
			const token = req.cookies?.token || "";
			const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
			await User.findByIdAndUpdate(decoded.id, { refreshToken: null });
		} catch (error) {
			console.error("Error clearing refresh token:", error.message);
		}

		if (sessionId) {
			await Session.findByIdAndDelete(sessionId);
		}

		const clearOpts = {
			httpOnly: true,
			secure: process.env.NODE_ENV !== "development",
			sameSite: "strict",
			path: "/",
		};
		res.clearCookie("token", clearOpts);
		res.clearCookie("refreshToken", clearOpts);
		res.clearCookie("sessionId", clearOpts);

		return res.json({ message: "Logout successfully!", success: true });
	} catch (error) {
		console.error("Logout error:", error);
		return res.status(500).json({ message: "Logout failed" });
	}
});

// ── POST /api/auth/refresh ───────────────────────────────────────────────────
router.post("/refresh", async (req, res) => {
	try {
		const refreshToken = req.cookies?.refreshToken;
		const sessionId = req.cookies?.sessionId;

		if (!refreshToken) {
			return res
				.status(401)
				.json({ success: false, message: "Refresh token not found" });
		}

		if (!sessionId) {
			return res
				.status(401)
				.json({ success: false, message: "Session not found" });
		}

		let decoded;
		try {
			decoded = jwt.verify(refreshToken, process.env.TOKEN_SECRET);
		} catch {
			return res
				.status(401)
				.json({ success: false, message: "Invalid or expired refresh token" });
		}

		const user = await User.findById(decoded.id);
		if (!user) {
			return res.status(404).json({ success: false, message: "User not found" });
		}

		if (user.refreshToken !== refreshToken) {
			return res
				.status(401)
				.json({ success: false, message: "Refresh token mismatch" });
		}

		const session = await Session.findById(sessionId);
		if (!session) {
			return res
				.status(401)
				.json({ success: false, message: "Session expired or invalid" });
		}

		if (session.userId.toString() !== decoded.id) {
			return res
				.status(401)
				.json({ success: false, message: "Session user mismatch" });
		}

		await Session.findByIdAndUpdate(sessionId, { lastActive: new Date() });

		const tokenData = {
			id: user._id,
			role: user.role,
			isAdmin: user.isAdmin,
		};

		const newAccessToken = jwt.sign(tokenData, process.env.TOKEN_SECRET, {
			expiresIn: "1d",
		});

		res.cookie("token", newAccessToken, {
			...cookieBase(),
			maxAge: ACCESS_TOKEN_MAX_AGE,
		});

		return res.json({
			success: true,
			message: "Access token refreshed successfully",
		});
	} catch (error) {
		console.error("Refresh token error:", error);
		return res
			.status(500)
			.json({ success: false, message: "Token refresh failed" });
	}
});

// ── POST /api/auth/register ──────────────────────────────────────────────────
router.post("/register", async (req, res) => {
	try {
		const reqBody = req.body;
		const parsed_data = registerSchema.safeParse(reqBody);
		if (!parsed_data.success) {
			const error = parsed_data.error.issues[0]?.message;
			return res.status(400).json({ errors: error });
		}
		const {
			username,
			name,
			email,
			password,
			role,
			company,
			job_title,
			department,
		} = parsed_data.data;
		const userExists = await User.findOne({ $or: [{ email }, { username }] });
		if (userExists) {
			return res
				.status(409)
				.json({ message: `User already exists with ${username}` });
		}

		if (role === "admin") {
			const admin_count = await User.countDocuments({ company, role: "admin" });
			if (admin_count >= 2) {
				return res.status(409).json({
					errors: "Cannot add more than 2 admins within the same company",
				});
			}
		}

		const hashedPassword = await bcrypt.hash(password, 10);
		const newUser = new User({
			username,
			full_name: name,
			email,
			password: hashedPassword,
			role,
			company,
			job_title,
			department,
			isverified: true,
			isAdmin: role === "admin",
		});
		const saved_user = await newUser.save();
		const user_response = await User.findById(saved_user._id).select("-password");
		logger.info(`User registered successfully: ${saved_user._id}`);
		if (role === "admin") {
			try {
				await sendEmail({
					email,
					emailType: "VERIFY",
					userId: saved_user._id,
					username,
				});
				console.log("Verification email sent to:", email);
			} catch (emailError) {
				logger.error(`Failed to send verification email: ${emailError.message}`);
				console.error("Email sending failed but user was created.");
			}
		}

		return res.status(201).json({
			message: "User created successfully",
			success: true,
			user_response,
		});
	} catch (error) {
		logger.error(`Error in registration: ${error.message}`);
		return res
			.status(500)
			.json({ message: "Internal server error", error: error.message });
	}
});

// ── GET /api/auth/session ────────────────────────────────────────────────────
router.get("/session", requireAuth, async (req, res) => {
	try {
		const sessions = await Session.find({ userId: req.auth.id }).sort({
			createdAt: -1,
		});
		return res.json({ sessions });
	} catch (error) {
		return res
			.status(500)
			.json({ message: "Error fetching sessions", error: error.message });
	}
});

// ── DELETE /api/auth/session ─────────────────────────────────────────────────
router.delete("/session", requireAuth, async (req, res) => {
	try {
		const { sessionId, logoutAll } = req.body || {};

		if (logoutAll) {
			const currentSessionId = req.cookies?.sessionId;
			await Session.deleteMany({
				userId: req.auth.id,
				_id: { $ne: currentSessionId },
			});

			return res.json({
				success: true,
				message: "All other sessions logged out",
			});
		}

		if (sessionId) {
			const session = await Session.findById(sessionId);

			if (!session) {
				return res
					.status(404)
					.json({ success: false, message: "Session not found" });
			}

			if (session.userId.toString() !== req.auth.id) {
				return res
					.status(403)
					.json({ success: false, message: "Unauthorized" });
			}

			await Session.findByIdAndDelete(sessionId);

			return res.json({ success: true, message: "Session logged out" });
		}

		return res
			.status(400)
			.json({ success: false, message: "sessionId or logoutAll required" });
	} catch (error) {
		console.error("Session logout error:", error);
		return res
			.status(500)
			.json({ success: false, message: "Failed to logout session" });
	}
});

// ── GET /api/auth/user_profile ───────────────────────────────────────────────
router.get("/user_profile", requireAuth, async (req, res) => {
	try {
		const userId = req.auth.id;

		const user = await User.findById(userId).select(
			"-password -isverified -__v",
		);

		if (!user) {
			return res.status(404).json({ success: false, error: "User not found" });
		}

		const sessions = await Session.find({ userId }).sort({ createdAt: -1 });

		return res.json({
			message: "User found",
			success: true,
			data: {
				user,
				session: sessions,
			},
		});
	} catch (error) {
		console.error("user_profile error:", error);
		return res.status(500).json({ success: false, error: error.message });
	}
});

// ── PATCH /api/auth/update_profile ───────────────────────────────────────────
router.patch("/update_profile", requireAuth, async (req, res) => {
	try {
		const body = req.body || {};
		const allowedFields = ["full_name", "job_title", "department"];
		const updateData = {};

		for (const field of allowedFields) {
			if (body[field] !== undefined) {
				updateData[field] = body[field];
			}
		}

		if (Object.keys(updateData).length === 0) {
			return res
				.status(400)
				.json({ success: false, message: "No valid fields to update" });
		}

		const updatedUser = await User.findByIdAndUpdate(req.auth.id, updateData, {
			new: true,
			select: "-password -refreshToken -__v",
		});

		if (!updatedUser) {
			return res.status(404).json({ success: false, message: "User not found" });
		}

		return res.json({
			success: true,
			message: "Profile updated successfully",
			data: updatedUser,
		});
	} catch (error) {
		console.error("Update profile error:", error);
		return res
			.status(500)
			.json({ success: false, message: "Failed to update profile" });
	}
});

// ── POST /api/auth/verify_admin ──────────────────────────────────────────────
router.post("/verify_admin", async (req, res) => {
	try {
		const { token } = verifyEmailSchema.parse(req.body);

		const verifyuser = await User.findOne({
			verifytoken: token,
			verifytokenexpiry: { $gt: Date.now() },
		});
		if (!verifyuser) {
			return res.status(400).json({ error: "Invalid token." });
		}
		verifyuser.isverified = true;
		verifyuser.isAdmin = true;
		verifyuser.verifytoken = null;
		verifyuser.verifytokenexpiry = null;
		await verifyuser.save();
		return res
			.status(200)
			.json({ message: "Email Verified Successfully", success: true });
	} catch (error) {
		return res
			.status(500)
			.json({ error: "Token verification failed", message: error.message });
	}
});

export default router;
