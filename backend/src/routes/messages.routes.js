import express from "express";
import Message from "../models/message.model.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// ── GET /api/messages ────────────────────────────────────────────────────────
router.get("/", requireAuth, async (req, res) => {
	try {
		const currentUserId = req.auth.id;
		const otherUserId = req.query.userId;

		let query = {
			$or: [{ sender: currentUserId }, { receiver: currentUserId }],
		};

		if (otherUserId) {
			query = {
				$or: [
					{ sender: currentUserId, receiver: otherUserId },
					{ sender: otherUserId, receiver: currentUserId },
				],
			};
		}

		const messages = await Message.find(query)
			.populate("sender", "full_name email")
			.populate("receiver", "full_name email")
			.sort({ createdAt: 1 });

		return res.status(200).json({ messages });
	} catch (error) {
		return res.status(500).json({ error: error.message });
	}
});

// ── POST /api/messages ───────────────────────────────────────────────────────
router.post("/", requireAuth, async (req, res) => {
	try {
		const sender = req.auth.id;
		const { receiver, content } = req.body;

		if (!receiver || !content) {
			return res
				.status(400)
				.json({ error: "Receiver and content are required" });
		}

		const message = await Message.create({ sender, receiver, content });
		return res.status(201).json({ message });
	} catch (error) {
		return res.status(500).json({ error: error.message });
	}
});

export default router;
