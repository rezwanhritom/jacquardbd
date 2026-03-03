import ChatConversation from "../models/ChatConversation.js";
import User from "../models/User.js";

/**
 * GET /api/chat/conversation — get or create the authenticated user's conversation
 */
export async function getOrCreateMyConversation(req, res, next) {
  try {
    const userId = req.user._id;
    let conv = await ChatConversation.findOne({ user: userId }).sort({ updatedAt: -1 }).lean();
    if (!conv) {
      conv = await ChatConversation.create({ user: userId, messages: [] });
      conv = conv.toObject();
    }
    return res.json({ success: true, conversation: conv });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/chat/message — append a user message to their conversation
 */
export async function sendMessage(req, res, next) {
  try {
    const userId = req.user._id;
    const { text } = req.body;
    if (!text || typeof text !== "string" || !text.trim()) {
      return res.status(400).json({ success: false, message: "Message text is required" });
    }
    let conv = await ChatConversation.findOne({ user: userId });
    if (!conv) {
      conv = await ChatConversation.create({ user: userId, messages: [] });
    }
    conv.messages.push({ from: "user", text: text.trim() });
    await conv.save();
    const lastMsg = conv.messages[conv.messages.length - 1];
    return res.status(201).json({ success: true, message: lastMsg });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/chat/conversations — admin: list all conversations
 */
export async function listConversations(req, res, next) {
  try {
    const list = await ChatConversation.find()
      .populate("user", "name email")
      .sort({ updatedAt: -1 })
      .lean();
    return res.json({ success: true, conversations: list });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/chat/conversations/:id — admin: get one conversation with messages
 */
export async function getConversationById(req, res, next) {
  try {
    const conv = await ChatConversation.findById(req.params.id)
      .populate("user", "name email")
      .lean();
    if (!conv) {
      return res.status(404).json({ success: false, message: "Conversation not found" });
    }
    return res.json({ success: true, conversation: conv });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/chat/conversations/:id/reply — admin: add admin reply to conversation
 */
export async function adminReply(req, res, next) {
  try {
    const conv = await ChatConversation.findById(req.params.id);
    if (!conv) {
      return res.status(404).json({ success: false, message: "Conversation not found" });
    }
    const { text } = req.body;
    if (!text || typeof text !== "string" || !text.trim()) {
      return res.status(400).json({ success: false, message: "Message text is required" });
    }
    conv.messages.push({ from: "admin", text: text.trim() });
    await conv.save();
    const lastMsg = conv.messages[conv.messages.length - 1];
    return res.status(201).json({ success: true, message: lastMsg });
  } catch (err) {
    next(err);
  }
}
