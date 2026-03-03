import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiMessageCircle, FiX } from "react-icons/fi";
import { useChat } from "../../context/ChatContext";
import { useAuth } from "../../context/AuthContext";
import { getMyConversation, sendMessage as sendMessageApi } from "../../services/chat.service";
import toast from "react-hot-toast";

const ChatWidget = () => {
  const { chatOpen, openChat, closeChat, toggleChat } = useChat();
  const { isAuthenticated } = useAuth();
  const [conversation, setConversation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);
  const pollRef = useRef(null);

  const fetchConversation = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    const { success, conversation: conv } = await getMyConversation();
    setLoading(false);
    if (success && conv) setConversation(conv);
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchConversation();
    const interval = chatOpen ? 5000 : 15000;
    pollRef.current = setInterval(fetchConversation, interval);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [chatOpen, isAuthenticated]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation?.messages?.length]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || sending || !isAuthenticated) return;
    setSending(true);
    const { success, message, error } = await sendMessageApi(input);
    setSending(false);
    setInput("");
    if (success && message) {
      setConversation((prev) => ({
        ...prev,
        messages: [...(prev?.messages || []), message],
      }));
    } else if (error) toast.error(error);
  };

  /** Unread = admin messages after the last user message. When chat is open, show 0. */
  const messages = conversation?.messages || [];
  const lastUserIdx = (() => {
    let idx = -1;
    messages.forEach((m, i) => {
      if (m.from === "user") idx = i;
    });
    return idx;
  })();
  const unreadFromMessages =
    lastUserIdx < 0
      ? messages.filter((m) => m.from === "admin").length
      : messages.slice(lastUserIdx + 1).filter((m) => m.from === "admin").length;
  const unreadCount = chatOpen ? 0 : unreadFromMessages;

  if (!isAuthenticated) return null;

  return (
    <>
      {/* Floating button */}
      <motion.button
        type="button"
        onClick={toggleChat}
        className="fixed bottom-6 right-6 z-[100] w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-colors"
        style={{
          backgroundColor: "var(--color-primary)",
          color: "white",
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={unreadCount > 0 ? `Open live chat (${unreadCount} unread)` : "Open live chat"}
      >
        <FiMessageCircle size={24} />
        {unreadCount > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 min-w-[1.25rem] h-5 px-1 rounded-full flex items-center justify-center text-xs font-bold text-white"
            style={{ backgroundColor: "var(--color-tertiary)" }}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {chatOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-[101] lg:bg-transparent"
              onClick={closeChat}
              aria-hidden="true"
            />
            <motion.div
              initial={{ opacity: 0, x: 320 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 320 }}
              transition={{ type: "tween", duration: 0.25 }}
              className="fixed z-[102] w-[calc(100vw-2rem)] max-w-md left-4 right-4 sm:left-auto sm:right-6 sm:w-full bottom-4 sm:bottom-6 top-auto max-h-[min(480px,calc(100dvh-6rem))] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
              style={{
                backgroundColor: "var(--bg-primary)",
                border: "1px solid var(--border-primary)",
              }}
            >
              <div
                className="flex items-center justify-between px-4 py-3 border-b"
                style={{ borderColor: "var(--border-primary)", backgroundColor: "var(--bg-secondary)" }}
              >
                <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>
                  Live Chat
                </h3>
                <motion.button
                  type="button"
                  onClick={closeChat}
                  className="p-2 rounded-lg transition-colors"
                  style={{ color: "var(--text-secondary)" }}
                  whileHover={{ backgroundColor: "var(--bg-tertiary)" }}
                  aria-label="Close chat"
                >
                  <FiX size={20} />
                </motion.button>
              </div>
              <div
                className="flex-1 overflow-y-auto p-4 space-y-3"
                style={{ backgroundColor: "var(--bg-primary)" }}
              >
                {loading && !conversation?.messages?.length ? (
                  <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
                    Loading...
                  </p>
                ) : (
                  (conversation?.messages || []).map((msg, i) => (
                    <div
                      key={msg._id || i}
                      className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className="max-w-[85%] px-3 py-2 rounded-xl text-sm"
                        style={{
                          backgroundColor: msg.from === "user" ? "var(--color-primary)" : "var(--bg-tertiary)",
                          color: msg.from === "user" ? "white" : "var(--text-primary)",
                        }}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
              <form onSubmit={handleSend} className="p-3 border-t" style={{ borderColor: "var(--border-primary)" }}>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2.5 rounded-xl border-2 outline-none text-sm transition-colors"
                    style={{
                      borderColor: "var(--border-primary)",
                      backgroundColor: "var(--bg-primary)",
                      color: "var(--text-primary)",
                    }}
                    disabled={sending}
                  />
                  <motion.button
                    type="submit"
                    disabled={!input.trim() || sending}
                    className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 transition-opacity"
                    style={{ backgroundColor: "var(--color-primary)" }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Send
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatWidget;
