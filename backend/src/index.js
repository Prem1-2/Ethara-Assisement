import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { connectDB } from "./config/db.js";
import logger from "./logger/logger.js";

import authRoutes from "./routes/auth.routes.js";
import usersRoutes from "./routes/users.routes.js";
import tasksRoutes from "./routes/tasks.routes.js";
import projectsRoutes from "./routes/projects.routes.js";
import teamsRoutes from "./routes/teams.routes.js";
import messagesRoutes from "./routes/messages.routes.js";
import searchRoutes from "./routes/search.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import memberRoutes from "./routes/member.routes.js";

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────
const allowedOrigins = [
	...new Set(
		[
			process.env.FRONTEND_URL,
			process.env.DOMAIN_URL,
			"http://localhost:3000",
		].filter(Boolean),
	),
];

app.use(
	cors({
		origin(origin, callback) {
			// allow same-origin / curl / server-to-server (no Origin header)
			if (!origin) return callback(null, true);
			if (
				allowedOrigins.includes(origin) ||
				process.env.NODE_ENV === "development"
			) {
				return callback(null, true);
			}
			return callback(new Error(`Origin ${origin} not allowed by CORS`));
		},
		credentials: true,
		methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization"],
	}),
);

app.use(express.json({ limit: "5mb" }));
app.use(cookieParser());

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
	res.json({ status: "ok", service: "ethara-backend" });
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/tasks", tasksRoutes);
app.use("/api/projects", projectsRoutes);
app.use("/api/teams", teamsRoutes);
app.use("/api/messages", messagesRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/member", memberRoutes);

// ── 404 + error handler ─────────────────────────────────────────────────────
app.use((req, res) => {
	res.status(404).json({ error: `Not found: ${req.method} ${req.originalUrl}` });
});

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
	logger.error(`Unhandled error: ${err.message}`);
	res.status(err.status || 500).json({ error: err.message || "Server error" });
});

// ── Bootstrap ─────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

// Start listening immediately so the service is reachable, then connect to
// MongoDB in the background. Mongoose buffers queries until the connection is
// ready, so requests issued during startup still resolve once connected.
app.listen(PORT, () => {
	logger.info(`Ethara backend listening on http://localhost:${PORT}`);
	logger.info(`Allowed CORS origins: ${allowedOrigins.join(", ")}`);
});

connectDB().catch((err) => {
	logger.error(`MongoDB connection failed: ${err.message}`);
	logger.error("API requests that hit the database will fail until it is reachable.");
});

export default app;
