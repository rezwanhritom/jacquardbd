/**
 * Chat API. Uses credentials (cookies).
 * - getMyConversation, sendMessage: authenticated user.
 * - listConversations, getConversation, adminReply: admin only.
 */

const getBaseUrl = () => {
  const url = import.meta.env.VITE_API_URL;
  if (url) return url.replace(/\/$/, "");
  return "http://localhost:5001";
};

async function chatFetch(path, options = {}) {
  const baseUrl = getBaseUrl();
  const res = await fetch(`${baseUrl}/api/chat${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  return res;
}

export async function getGuestConversation() {
  const res = await chatFetch("/guest/conversation");
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { success: false, conversation: null, message: data.message || "Failed to load chat" };
  }
  return { success: true, conversation: data.conversation, message: data.message };
}

export async function sendGuestMessage(text) {
  const res = await chatFetch("/guest/message", {
    method: "POST",
    body: JSON.stringify({ text: String(text).trim() }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { success: false, message: null, error: data.message || "Failed to send" };
  }
  return { success: true, message: data.message, error: null };
}

export async function getMyConversation() {
  const res = await chatFetch("/conversation");
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { success: false, conversation: null, message: data.message || "Failed to load chat" };
  }
  return { success: true, conversation: data.conversation, message: data.message };
}

export async function sendMessage(text) {
  const res = await chatFetch("/message", {
    method: "POST",
    body: JSON.stringify({ text: text.trim() }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { success: false, message: null, error: data.message || "Failed to send" };
  }
  return { success: true, message: data.message, error: null };
}

export async function listConversations() {
  const res = await chatFetch("/conversations");
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { success: false, conversations: [], message: data.message };
  }
  return { success: true, conversations: data.conversations || [] };
}

export async function getConversation(id) {
  const res = await chatFetch(`/conversations/${id}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { success: false, conversation: null, message: data.message };
  }
  return { success: true, conversation: data.conversation };
}

export async function adminReply(conversationId, text) {
  const res = await chatFetch(`/conversations/${conversationId}/reply`, {
    method: "POST",
    body: JSON.stringify({ text: text.trim() }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { success: false, message: null, error: data.message };
  }
  return { success: true, message: data.message, error: null };
}
