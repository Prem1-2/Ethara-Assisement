import jwt from "jsonwebtoken";
import User from "../models/users.model.js";

function extractBearer(header) {
	if (typeof header !== "string") return null;
	const stripped = header.replace(/^Bearer\s+/i, "").trim();
	return stripped || null;
}

/**
 * Verify the access token (cookie first, then `Authorization: Bearer`),
 * load the user, and attach `req.auth` (decoded JWT) + `req.user` (DB doc).
 *
 * Returns 401 on any failure so the frontend's axios interceptor can trigger
 * the /auth/refresh flow.
 */
export async function requireAuth(req, res, next) {
	try {
		const token = req.cookies?.token || extractBearer(req.headers.authorization);

		if (!token) {
			return res.status(401).json({ error: "Unauthorized" });
		}

		let decoded;
		try {
			decoded = jwt.verify(token, process.env.TOKEN_SECRET);
		} catch {
			return res.status(401).json({ error: "Invalid or expired token" });
		}

		const user = await User.findById(decoded.id);
		if (!user) {
			return res.status(401).json({ error: "User not found" });
		}

		req.auth = decoded;
		req.user = user;
		next();
	} catch (error) {
		return res.status(500).json({ error: error.message });
	}
}

/**
 * Must be used after requireAuth. Mirrors the strict check used by most of the
 * original admin-only routes: `user.role === "admin"`.
 */
export function requireAdmin(req, res, next) {
	if (!req.user || req.user.role !== "admin") {
		return res.status(403).json({ error: "Access denied" });
	}
	next();
}

/**
 * Must be used after requireAuth. Looser variant used by a few original routes:
 * `user.role === "admin" || user.isAdmin`.
 */
export function requireAdminOrFlag(req, res, next) {
	if (!req.user || (req.user.role !== "admin" && !req.user.isAdmin)) {
		return res.status(403).json({ error: "Access denied" });
	}
	next();
}
