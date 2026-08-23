import { useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { FiMessageCircle, FiX } from "react-icons/fi";
import { useChat } from "../../context/ChatContext";
import { useAuth } from "../../context/AuthContext";
import { useCookieConsent } from "../../context/CookieConsentContext";
import {
  getMyConversation,
  sendMessage as sendMessageApi,
  getGuestConversation,
  sendGuestMessage,
} from "../../services/chat.service";
import toast from "react-hot-toast";

/**
 * Live chat: fixed bottom-right on all routes (shop + auth). Logged-in users use account chat;
 * guests use cookie-backed session when chat cookies are accepted.
 */
const ChatWidget = () => {
  const { chatOpen, openChat, closeChat, toggleChat } = useChat();
  const { isAuthenticated } = useAuth();
  const { decided, chatAllowed, openCookieSettings } = useCookieConsent();
  const [conversation, setConversation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);
  const pollRef = useRef(null);

  const canUseChat = isAuthenticated || (decided && chatAllowed);

  const fetchConversation = async () => {
    if (isAuthenticated) {
      setLoading(true);
      const { success, conversation: conv } = await getMyConversation();
      setLoading(false);
      if (success && conv) setConversation(conv);
      return;
    }
    if (!chatAllowed || !decided) {
      setConversation(null);
      return;
    }
    setLoading(true);
    const { success, conversation: conv } = await getGuestConversation();
    setLoading(false);
    if (success && conv) setConversation(conv);
  };

  useEffect(() => {
    if (!chatOpen && !isAuthenticated && !chatAllowed) return;
    fetchConversation();
    const interval = chatOpen ? 5000 : 15000;
    pollRef.current = setInterval(() => {
      if (isAuthenticated || chatAllowed) fetchConversation();
    }, interval);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [chatOpen, isAuthenticated, chatAllowed, decided]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation?.messages?.length]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || sending) return;
    if (isAuthenticated) {
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
      return;
    }
    if (!chatAllowed) return;
    setSending(true);
    const { success, message, error } = await sendGuestMessage(input);
    setSending(false);
    setInput("");
    if (success && message) {
      setConversation((prev) => ({
        ...prev,
        messages: [...(prev?.messages || []), message],
      }));
    } else if (error) toast.error(error);
  };

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

  const fabClass =
    "fixed z-[100] w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-colors " +
    "right-4 bottom-[max(1rem,env(safe-area-inset-bottom,0px))] sm:right-6 sm:bottom-[max(1.5rem,env(safe-area-inset-bottom,0px))]";

  return (
    <>
      <motion.button
        type="button"
        onClick={toggleChat}
        data-chat-widget="fab"
        className={fabClass}
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
              data-chat-widget="overlay"
              aria-hidden="true"
            />
            <motion.div
              initial={{ opacity: 0, x: 320 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 320 }}
              transition={{ type: "tween", duration: 0.25 }}
              data-chat-widget="panel"
              className="fixed z-[102] w-[calc(100vw-1.5rem)] max-w-md left-3 right-3 sm:left-auto sm:right-4 sm:w-full bottom-[max(0.75rem,env(safe-area-inset-bottom,0px))] sm:bottom-[max(1rem,env(safe-area-inset-bottom,0px))] top-auto max-h-[min(480px,calc(100dvh-5.5rem))] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
              style={{
                backgroundColor: "var(--bg-primary)",
                border: "1px solid var(--border-primary)",
              }}
            >
              <div
                className="flex items-center justify-between px-4 py-3 border-b shrink-0"
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

              {!canUseChat ? (
                <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ backgroundColor: "var(--bg-primary)" }}>
                  {!decided ? (
                    <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                      Please respond to the cookie banner so we can offer live chat on this device.
                    </p>
                  ) : (
                    <>
                      <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                        To message our team without logging in, enable <strong>Live chat</strong> cookies in your preferences.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          closeChat();
                          openCookieSettings();
                        }}
                        className="w-full py-2.5 rounded-xl text-sm font-semibold text-white"
                        style={{ backgroundColor: "var(--color-primary)" }}
                      >
                        Cookie settings
                      </button>
                      <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                        Or{" "}
                        <Link to="/login" className="underline font-medium" style={{ color: "var(--color-primary)" }}>
                          sign in
                        </Link>{" "}
                        to use chat with your account.
                      </p>
                    </>
                  )}
                </div>
              ) : (
                <>
                  <div
                    className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0"
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
                  <form onSubmit={handleSend} className="p-3 border-t shrink-0" style={{ borderColor: "var(--border-primary)" }}>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2.5 rounded-xl border-2 outline-none text-sm transition-colors min-w-0"
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
                        className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 transition-opacity shrink-0"
                        style={{ backgroundColor: "var(--color-primary)" }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Send
                      </motion.button>
                    </div>
                  </form>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatWidget;
