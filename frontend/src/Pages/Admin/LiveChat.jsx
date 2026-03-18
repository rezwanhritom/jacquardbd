import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { FiMessageCircle, FiSend, FiUser } from "react-icons/fi";
import { listConversations, getConversation, adminReply } from "../../services/chat.service";
import { fadeInUp } from "../../utils/animations";
import toast from "react-hot-toast";

const AdminLiveChat = () => {
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [conversation, setConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingThread, setLoadingThread] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const pollRef = useRef(null);

  const fetchList = async () => {
    setLoading(true);
    const res = await listConversations();
    setLoading(false);
    if (res.success && res.conversations) setConversations(res.conversations);
  };

  const fetchThread = async (id) => {
    if (!id) return;
    setLoadingThread(true);
    setSelected(id);
    const res = await getConversation(id);
    setLoadingThread(false);
    if (res.success && res.conversation) setConversation(res.conversation);
    else setConversation(null);
  };

  useEffect(() => {
    fetchList();
  }, []);

  useEffect(() => {
    if (selected) {
      fetchThread(selected);
      pollRef.current = setInterval(() => fetchThread(selected), 4000);
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [selected]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation?.messages?.length]);

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selected || sending) return;
    setSending(true);
    const res = await adminReply(selected, replyText);
    setSending(false);
    setReplyText("");
    if (res.success && res.message) {
      setConversation((prev) =>
        prev ? { ...prev, messages: [...(prev.messages || []), res.message] } : prev
      );
      toast.success("Reply sent.");
    } else {
      toast.error(res.error || "Failed to send");
    }
  };

  const formatDate = (d) => {
    if (!d) return "";
    const date = new Date(d);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (loading) {
    return (
      <motion.div variants={fadeInUp} className="flex justify-center py-16">
        <p style={{ color: "var(--text-secondary)" }}>Loading conversations...</p>
      </motion.div>
    );
  }

  return (
    <motion.div variants={fadeInUp} className="space-y-4">
      <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
        Reply to customer live chat messages. Select a conversation to view and respond.
      </p>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-280px)] min-h-[400px]">
        {/* Conversation list */}
        <div
          className="border rounded-xl overflow-hidden flex flex-col"
          style={{ borderColor: "var(--border-primary)", backgroundColor: "var(--bg-secondary)" }}
        >
          <div className="px-4 py-3 border-b font-semibold text-sm" style={{ borderColor: "var(--border-primary)", color: "var(--text-primary)" }}>
            Conversations
          </div>
          <div className="flex-1 overflow-y-auto divide-y" style={{ borderColor: "var(--border-primary)" }}>
            {conversations.length === 0 ? (
              <div className="p-4 text-sm" style={{ color: "var(--text-tertiary)" }}>
                No conversations yet.
              </div>
            ) : (
              conversations.map((c) => (
                <button
                  key={c._id}
                  type="button"
                  onClick={() => fetchThread(c._id)}
                  className="w-full text-left px-4 py-3 hover:bg-opacity-80 transition-colors"
                  style={{
                    backgroundColor: selected === c._id ? "var(--bg-tertiary)" : "transparent",
                    color: "var(--text-primary)",
                  }}
                >
                  <div className="flex items-center gap-2">
                    <FiUser size={16} style={{ color: "var(--color-primary)" }} />
                    <span className="font-medium truncate">
                      {c.user?.name || (c.guestSessionId ? `Guest (${String(c.guestSessionId).slice(0, 8)}…)` : "Chat")}
                    </span>
                  </div>
                  <p className="text-xs truncate mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                    {c.user?.email || (c.guestSessionId ? "Guest · live chat" : "")}
                  </p>
                  <p className="text-xs mt-1 line-clamp-1" style={{ color: "var(--text-secondary)" }}>
                    {c.messages?.length ? c.messages[c.messages.length - 1]?.text : "No messages"}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Thread */}
        <div
          className="lg:col-span-2 border rounded-xl flex flex-col overflow-hidden"
          style={{ borderColor: "var(--border-primary)", backgroundColor: "var(--bg-primary)" }}
        >
          {!selected ? (
            <div className="flex-1 flex items-center justify-center p-8" style={{ color: "var(--text-tertiary)" }}>
              <div className="text-center">
                <FiMessageCircle size={48} className="mx-auto mb-2 opacity-50" />
                <p>Select a conversation to view and reply.</p>
              </div>
            </div>
          ) : loadingThread ? (
            <div className="flex-1 flex items-center justify-center" style={{ color: "var(--text-secondary)" }}>
              Loading...
            </div>
          ) : (
            <>
              <div className="px-4 py-3 border-b flex items-center gap-2" style={{ borderColor: "var(--border-primary)", backgroundColor: "var(--bg-secondary)" }}>
                <FiUser size={18} style={{ color: "var(--color-primary)" }} />
                <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
                  {conversation?.user?.name ||
                    (conversation?.guestSessionId
                      ? `Guest (${String(conversation.guestSessionId).slice(0, 8)}…)`
                      : "User")}
                </span>
                <span className="text-sm" style={{ color: "var(--text-tertiary)" }}>
                  {conversation?.user?.email || (conversation?.guestSessionId ? "Guest live chat" : "")}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {(conversation?.messages || []).map((msg, i) => (
                  <div
                    key={msg._id || i}
                    className={`flex ${msg.from === "admin" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className="max-w-[85%] px-3 py-2 rounded-xl text-sm"
                      style={{
                        backgroundColor: msg.from === "admin" ? "var(--color-primary)" : "var(--bg-tertiary)",
                        color: msg.from === "admin" ? "white" : "var(--text-primary)",
                      }}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <form onSubmit={handleReply} className="p-3 border-t" style={{ borderColor: "var(--border-primary)" }}>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your reply..."
                    className="flex-1 px-4 py-2.5 rounded-xl border-2 outline-none text-sm"
                    style={{
                      borderColor: "var(--border-primary)",
                      backgroundColor: "var(--bg-primary)",
                      color: "var(--text-primary)",
                    }}
                    disabled={sending}
                  />
                  <motion.button
                    type="submit"
                    disabled={!replyText.trim() || sending}
                    className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 flex items-center gap-2"
                    style={{ backgroundColor: "var(--color-primary)" }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <FiSend size={16} />
                    Send
                  </motion.button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default AdminLiveChat;
