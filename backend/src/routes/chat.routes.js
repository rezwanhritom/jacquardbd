import { Router } from "express";
import { protect, requireRole } from "../middlewares/auth.middleware.js";
import {
  getOrCreateMyConversation,
  sendMessage,
  listConversations,
  getConversationById,
  adminReply,
} from "../controller/chat.controller.js";

const router = Router();

// User: get my conversation, send message
router.get("/conversation", protect, getOrCreateMyConversation);
router.post("/message", protect, sendMessage);

// Admin: list conversations, get one, reply
router.get("/conversations", protect, requireRole(["admin"]), listConversations);
router.get("/conversations/:id", protect, requireRole(["admin"]), getConversationById);
router.post("/conversations/:id/reply", protect, requireRole(["admin"]), adminReply);

export default router;
