import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiMessageCircle, FiTrash2, FiSave, FiEdit2 } from "react-icons/fi";
import { EmptyState } from "../../components";
import toast from "react-hot-toast";
import { getAdminFaqs, updateFaq, deleteFaq } from "../../services/faq.service";
import { fadeInUp } from "../../utils/animations";

const AdminFaq = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editQuestion, setEditQuestion] = useState("");
  const [editReply, setEditReply] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchFaqs = async () => {
    setLoading(true);
    const result = await getAdminFaqs();
    if (result.success && result.faqs) setFaqs(result.faqs);
    else setFaqs([]);
    setLoading(false);
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const startEdit = (faq) => {
    setEditingId(faq._id);
    setEditQuestion(faq.question || "");
    setEditReply(faq.reply || "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditQuestion("");
    setEditReply("");
  };

  const handleSave = async () => {
    if (!editingId) return;
    setSaving(true);
    const result = await updateFaq(editingId, { question: editQuestion.trim(), reply: editReply.trim() });
    setSaving(false);
    if (result.success) {
      toast.success("FAQ updated.");
      setEditingId(null);
      setEditQuestion("");
      setEditReply("");
      fetchFaqs();
    } else {
      toast.error(result.message || "Failed to update");
    }
  };

  const handleDelete = async (id) => {
    if (!id) return;
    setDeletingId(id);
    const result = await deleteFaq(id);
    setDeletingId(null);
    if (result.success) {
      toast.success("FAQ deleted.");
      fetchFaqs();
      if (editingId === id) cancelEdit();
    } else {
      toast.error(result.message || "Failed to delete");
    }
  };

  if (loading) {
    return (
      <motion.div variants={fadeInUp} className="flex items-center justify-center py-16">
        <p style={{ color: "var(--text-secondary)" }}>Loading FAQs...</p>
      </motion.div>
    );
  }

  if (faqs.length === 0) {
    return (
      <motion.div variants={fadeInUp}>
        <EmptyState
          icon={FiMessageCircle}
          title="No FAQ questions yet"
          description="When customers submit questions from the FAQ page, they will appear here. You can reply and edit them."
        />
      </motion.div>
    );
  }

  return (
    <motion.div variants={fadeInUp} className="space-y-6">
      <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
        Edit questions, add or edit replies. Only answered FAQs are shown to customers on the FAQ page.
      </p>
      <div className="space-y-4">
        {faqs.map((faq) => (
          <div
            key={faq._id}
            className="rounded-xl border p-4"
            style={{ borderColor: "var(--border-primary)", backgroundColor: "var(--bg-primary)" }}
          >
            {editingId === faq._id ? (
              <>
                <div className="space-y-3 mb-4">
                  <label className="block text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                    Question
                  </label>
                  <input
                    type="text"
                    value={editQuestion}
                    onChange={(e) => setEditQuestion(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border outline-none"
                    style={{
                      borderColor: "var(--border-primary)",
                      backgroundColor: "var(--bg-secondary)",
                      color: "var(--text-primary)",
                    }}
                  />
                  <label className="block text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                    Reply (visible to customers when set)
                  </label>
                  <textarea
                    value={editReply}
                    onChange={(e) => setEditReply(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg border outline-none resize-none"
                    style={{
                      borderColor: "var(--border-primary)",
                      backgroundColor: "var(--bg-secondary)",
                      color: "var(--text-primary)",
                    }}
                    placeholder="Type your reply..."
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white disabled:opacity-60"
                    style={{ backgroundColor: "var(--color-primary)" }}
                  >
                    <FiSave size={16} />
                    {saving ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border font-medium"
                    style={{ borderColor: "var(--border-primary)", color: "var(--text-primary)" }}
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium mb-1" style={{ color: "var(--text-primary)" }}>
                      {faq.question}
                    </p>
                    <p className="text-xs mb-2" style={{ color: "var(--text-secondary)" }}>
                      {faq.user?.email || faq.email || "Guest"} · {faq.createdAt ? new Date(faq.createdAt).toLocaleString() : ""}
                    </p>
                    {faq.reply ? (
                      <p className="text-sm mt-2 p-2 rounded" style={{ color: "var(--text-secondary)", backgroundColor: "var(--bg-secondary)" }}>
                        {faq.reply}
                      </p>
                    ) : (
                      <p className="text-sm italic" style={{ color: "var(--text-tertiary)" }}>No reply yet</p>
                    )}
                    {faq.repliedAt && (
                      <p className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>
                        Replied {new Date(faq.repliedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => startEdit(faq)}
                      className="p-2 rounded-lg border transition-colors"
                      style={{ borderColor: "var(--border-primary)", color: "var(--color-primary)" }}
                      title="Edit / Reply"
                    >
                      <FiEdit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(faq._id)}
                      disabled={deletingId === faq._id}
                      className="p-2 rounded-lg border transition-colors disabled:opacity-50"
                      style={{ borderColor: "var(--border-primary)", color: "var(--color-tertiary)" }}
                      title="Delete"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default AdminFaq;
