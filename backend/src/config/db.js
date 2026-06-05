import dns from "node:dns";
import mongoose from "mongoose";
import logger from "../logger/logger.js";

/**
 * Connect to MongoDB once at server start-up.
 *
 * In the original Next.js app the connection was cached across serverless
 * invocations (`globalThis.mongoose`). A long-running Express process only
 * needs to connect a single time, so this is intentionally simpler.
 */
export async function connectDB() {
	const MONGO_URI = process.env.PROD_DATABASE_URL;

	if (!MONGO_URI) {
		throw new Error("MongoDB URI missing (set PROD_DATABASE_URL)");
	}

	// `mongodb+srv://` URIs require a DNS SRV lookup. Node's resolver (c-ares)
	// sometimes gets `querySrv ECONNREFUSED` when the system's configured
	// nameserver refuses SRV queries. Pointing it at public DNS avoids that.
	if (MONGO_URI.startsWith("mongodb+srv://")) {
		try {
			dns.setServers(["8.8.8.8", "1.1.1.1"]);
		} catch (err) {
			logger.warn(`Could not override DNS servers: ${err.message}`);
		}
	}

	mongoose.set("strictQuery", true);

	const conn = await mongoose.connect(MONGO_URI, {
		maxPoolSize: 10,
	});

	logger.info("MongoDB connected successfully");

	mongoose.connection.on("error", (err) =>
		logger.error(`MongoDB runtime error: ${err.message}`),
	);
	mongoose.connection.on("disconnected", () =>
		logger.warn("MongoDB disconnected"),
	);
	mongoose.connection.on("reconnected", () => logger.info("MongoDB reconnected"));

	return conn.connection;
}
