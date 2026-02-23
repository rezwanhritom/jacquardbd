import { useState, useEffect } from "react";
import { Container } from "../../components";
import { getFaqs, submitFaqQuestion } from "../../services/faq.service";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";

const FAQ = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();

  const fetchFaqs = async () => {
    setLoading(true);
    const result = await getFaqs();
    if (result.success && result.faqs) setFaqs(result.faqs);
    else setFaqs([]);
    setLoading(false);
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const q = (question || "").trim();
    if (!q) {
      toast.error("Please enter your question.");
      return;
    }
    setSubmitting(true);
    const result = await submitFaqQuestion({ question: q, email: (email || "").trim() || undefined });
    setSubmitting(false);
    if (result.success) {
      toast.success(result.message || "Question submitted. An admin will reply soon.");
      setQuestion("");
      setEmail("");
    } else {
      toast.error(result.message || "Failed to submit question.");
    }
  };

  return (
    <div className="min-h-[60vh] py-16">
      <Container>
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-2" style={{ color: "var(--color-primary)" }}>
            FAQs
          </h1>
          <p className="text-lg mb-10" style={{ color: "var(--text-secondary)" }}>
            Find answers to common questions, or ask your own below.
          </p>

          {loading ? (
            <p style={{ color: "var(--text-secondary)" }}>Loading...</p>
          ) : faqs.length === 0 ? (
            <p style={{ color: "var(--text-secondary)" }}>No answered FAQs yet. Ask a question below.</p>
          ) : (
            <ul className="space-y-4 mb-12">
              {faqs.map((faq, i) => (
                <motion.li
                  key={faq._id || i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-xl border p-4"
                  style={{ borderColor: "var(--border-primary)", backgroundColor: "var(--bg-secondary)" }}
                >
                  <p className="font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                    {faq.question}
                  </p>
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                    {faq.reply}
                  </p>
                  {faq.repliedAt && (
                    <p className="text-xs mt-2 opacity-70" style={{ color: "var(--text-secondary)" }}>
                      Answered {new Date(faq.repliedAt).toLocaleDateString()}
                    </p>
                  )}
                </motion.li>
              ))}
            </ul>
          )}

          <div className="border-t pt-10" style={{ borderColor: "var(--border-primary)" }}>
            <h2 className="text-xl font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
              Ask a question
            </h2>
            <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
              Your question will be reviewed and answered by our team. Only answered questions appear above.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-primary)" }}>
                  Your question *
                </label>
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  rows={4}
                  required
                  className="w-full px-4 py-3 rounded-lg border outline-none resize-none"
                  style={{
                    borderColor: "var(--border-primary)",
                    backgroundColor: "var(--bg-primary)",
                    color: "var(--text-primary)",
                  }}
                  placeholder="Type your question here..."
                />
              </div>
              {!user && (
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-primary)" }}>
                    Email (optional, for follow-up)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border outline-none"
                    style={{
                      borderColor: "var(--border-primary)",
                      backgroundColor: "var(--bg-primary)",
                      color: "var(--text-primary)",
                    }}
                    placeholder="your@email.com"
                  />
                </div>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-lg font-semibold text-white disabled:opacity-60"
                style={{ backgroundColor: "var(--color-primary)" }}
              >
                {submitting ? "Submitting..." : "Submit question"}
              </button>
            </form>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default FAQ;
