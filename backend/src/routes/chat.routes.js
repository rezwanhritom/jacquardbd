import { Router } from "express";
import { protect, requireRole } from "../middlewares/auth.middleware.js";
import {
  getOrCreateMyConversation,
  sendMessage,
  getOrCreateGuestConversation,
  sendGuestMessage,
  listConversations,
  getConversationById,
  adminReply,
} from "../controller/chat.controller.js";
import { ensureGuestSession } from "../middlewares/guestSession.middleware.js";

const router = Router();

router.get("/guest/conversation", ensureGuestSession, getOrCreateGuestConversation);
router.post("/guest/message", ensureGuestSession, sendGuestMessage);

// User: get my conversation, send message
router.get("/conversation", protect, getOrCreateMyConversation);
router.post("/message", protect, sendMessage);

// Admin: list conversations, get one, reply
router.get("/conversations", protect, requireRole(["admin"]), listConversations);
router.get("/conversations/:id", protect, requireRole(["admin"]), getConversationById);
router.post("/conversations/:id/reply", protect, requireRole(["admin"]), adminReply);

export default router;
