import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fadeInUp, staggerContainer } from "../../utils/animations";
import { FiPlus, FiEdit, FiTrash2, FiX, FiSave, FiCalendar, FiUsers } from "react-icons/fi";
import { EmptyState } from "../../components";
import toast from "react-hot-toast";
import { getCampaigns, createCampaign, updateCampaign, deleteCampaign } from "../../services/campaigns.service";

const toDateInput = (date) => {
  if (!date) return "";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
};

const Campaigns = () => {
  const [campaignsList, setCampaignsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "Discount",
    status: "Scheduled",
    startDate: "",
    endDate: "",
    discount: "",
    targetAudience: "All Customers",
  });

  const fetchCampaigns = async () => {
    setLoading(true);
    const result = await getCampaigns();
    if (result.success && result.campaigns) {
      setCampaignsList(result.campaigns);
    } else {
      toast.error(result.message || "Failed to load campaigns");
      setCampaignsList([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "var(--color-primary)";
      case "Scheduled":
        return "var(--color-secondary)";
      case "Ended":
        return "var(--text-tertiary)";
      default:
        return "var(--text-tertiary)";
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "Discount":
        return "var(--color-primary)";
      case "Product Launch":
        return "var(--color-secondary)";
      case "Flash Sale":
        return "var(--color-tertiary)";
      case "Loyalty":
        return "var(--color-primary)";
      case "Seasonal":
        return "var(--color-tertiary)";
      default:
        return "var(--text-tertiary)";
    }
  };

  const handleEdit = (campaign) => {
    setEditingCampaign(campaign._id);
    setFormData({
      name: campaign.name || "",
      type: campaign.type || "Discount",
      status: campaign.status || "Scheduled",
      startDate: toDateInput(campaign.startDate),
      endDate: toDateInput(campaign.endDate),
      discount: (campaign.discount != null ? campaign.discount : "").toString(),
      targetAudience: campaign.targetAudience || "All Customers",
    });
    setShowForm(true);
  };

  const handleDelete = async (campaign) => {
    if (!window.confirm(`Are you sure you want to delete "${campaign?.name}"?`)) return;
    const result = await deleteCampaign(campaign._id);
    if (result.success) {
      setCampaignsList((prev) => prev.filter((c) => c._id !== campaign._id));
      toast.success(`"${campaign?.name}" deleted successfully`);
    } else {
      toast.error(result.message || "Failed to delete campaign");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const payload = {
      name: formData.name.trim(),
      type: formData.type,
      status: formData.status,
      startDate: formData.startDate,
      endDate: formData.endDate,
      discount: formData.discount ? parseFloat(formData.discount) : 0,
      targetAudience: formData.targetAudience,
    };

    if (editingCampaign) {
      const result = await updateCampaign(editingCampaign, payload);
      if (result.success && result.campaign) {
        setCampaignsList((prev) => prev.map((c) => (c._id === editingCampaign ? result.campaign : c)));
        toast.success(`"${formData.name}" updated successfully`);
        handleCancel();
      } else {
        toast.error(result.message || "Failed to update campaign");
      }
    } else {
      const result = await createCampaign(payload);
      if (result.success && result.campaign) {
        setCampaignsList((prev) => [result.campaign, ...prev]);
        toast.success(`"${formData.name}" created successfully`);
        handleCancel();
      } else {
        toast.error(result.message || "Failed to create campaign");
      }
    }
    setSubmitting(false);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingCampaign(null);
    setFormData({
      name: "",
      type: "Discount",
      status: "Scheduled",
      startDate: "",
      endDate: "",
      discount: "",
      targetAudience: "All Customers",
    });
  };

  if (loading) {
    return (
      <div
        className="p-6 rounded-lg flex items-center justify-center min-h-[200px]"
        style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-secondary)" }}
      >
        Loading campaigns…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
          Marketing Campaigns
        </h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setEditingCampaign(null);
            setFormData({
              name: "",
              type: "Discount",
              status: "Scheduled",
              startDate: "",
              endDate: "",
              discount: "",
              targetAudience: "All Customers",
            });
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 text-white font-semibold rounded-lg"
          style={{ backgroundColor: "var(--color-primary)" }}
        >
          <FiPlus size={18} />
          Create Campaign
        </motion.button>
      </div>

      {/* Add/Edit Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="p-6 rounded-lg space-y-4"
            style={{ backgroundColor: "var(--bg-secondary)" }}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                {editingCampaign ? "Edit Campaign" : "Create New Campaign"}
              </h3>
              <motion.button
                type="button"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleCancel}
                className="p-2 rounded-lg"
                style={{ color: "var(--text-secondary)" }}
              >
                <FiX size={20} />
              </motion.button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                    Campaign Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-4 py-3 border-2 rounded-lg outline-none"
                    style={{
                      borderColor: "var(--border-primary)",
                      backgroundColor: "var(--bg-primary)",
                      color: "var(--text-primary)",
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                    Campaign Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    required
                    className="w-full px-4 py-3 border-2 rounded-lg outline-none"
                    style={{
                      borderColor: "var(--border-primary)",
                      backgroundColor: "var(--bg-primary)",
                      color: "var(--text-primary)",
                    }}
                  >
                    <option value="Discount">Discount</option>
                    <option value="Product Launch">Product Launch</option>
                    <option value="Flash Sale">Flash Sale</option>
                    <option value="Loyalty">Loyalty</option>
                    <option value="Seasonal">Seasonal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                    Status *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    required
                    className="w-full px-4 py-3 border-2 rounded-lg outline-none"
                    style={{
                      borderColor: "var(--border-primary)",
                      backgroundColor: "var(--bg-primary)",
                      color: "var(--text-primary)",
                    }}
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="Active">Active</option>
                    <option value="Ended">Ended</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                    Discount (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                    className="w-full px-4 py-3 border-2 rounded-lg outline-none"
                    style={{
                      borderColor: "var(--border-primary)",
                      backgroundColor: "var(--bg-primary)",
                      color: "var(--text-primary)",
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                    className="w-full px-4 py-3 border-2 rounded-lg outline-none"
                    style={{
                      borderColor: "var(--border-primary)",
                      backgroundColor: "var(--bg-primary)",
                      color: "var(--text-primary)",
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                    End Date *
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    required
                    className="w-full px-4 py-3 border-2 rounded-lg outline-none"
                    style={{
                      borderColor: "var(--border-primary)",
                      backgroundColor: "var(--bg-primary)",
                      color: "var(--text-primary)",
                    }}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                    Target Audience *
                  </label>
                  <select
                    value={formData.targetAudience}
                    onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                    required
                    className="w-full px-4 py-3 border-2 rounded-lg outline-none"
                    style={{
                      borderColor: "var(--border-primary)",
                      backgroundColor: "var(--bg-primary)",
                      color: "var(--text-primary)",
                    }}
                  >
                    <option value="All Customers">All Customers</option>
                    <option value="Premium Members">Premium Members</option>
                    <option value="VIP Members">VIP Members</option>
                    <option value="New Customers">New Customers</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <motion.button
                  type="submit"
                  disabled={submitting}
                  whileHover={!submitting ? { scale: 1.02 } : {}}
                  whileTap={!submitting ? { scale: 0.98 } : {}}
                  className="flex items-center gap-2 px-6 py-3 text-white font-semibold rounded-lg disabled:opacity-60"
                  style={{ backgroundColor: "var(--color-primary)" }}
                >
                  <FiSave size={18} />
                  {submitting ? "Saving…" : editingCampaign ? "Update Campaign" : "Create Campaign"}
                </motion.button>
                <motion.button
                  type="button"
                  onClick={handleCancel}
                  disabled={submitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 px-6 py-3 border-2 rounded-lg font-semibold"
                  style={{
                    borderColor: "var(--border-primary)",
                    color: "var(--text-primary)",
                  }}
                >
                  <FiX size={18} />
                  Cancel
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Campaigns Grid */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={staggerContainer}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {campaignsList.length === 0 && !showForm && (
          <div className="col-span-full">
            <EmptyState
              icon={FiCalendar}
              title="No campaigns yet"
              description="Create your first marketing campaign above"
            />
          </div>
        )}
        {campaignsList.map((campaign, index) => (
          <motion.div
            key={campaign._id}
            variants={fadeInUp}
            className="p-6 rounded-lg space-y-4"
            style={{ backgroundColor: "var(--bg-secondary)" }}
            whileHover={{ scale: 1.02, y: -4 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="px-2 py-1 text-xs font-semibold rounded"
                    style={{
                      backgroundColor: getTypeColor(campaign.type) + "20",
                      color: getTypeColor(campaign.type),
                    }}
                  >
                    {campaign.type}
                  </span>
                  <span
                    className="px-2 py-1 text-xs font-semibold rounded"
                    style={{
                      backgroundColor: getStatusColor(campaign.status) + "20",
                      color: getStatusColor(campaign.status),
                    }}
                  >
                    {campaign.status}
                  </span>
                </div>
                <h3 className="text-lg font-bold mb-2" style={{ color: "var(--text-primary)" }}>
                  {campaign.name}
                </h3>
              </div>
              <div className="flex gap-2">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleEdit(campaign)}
                  className="p-2 rounded-lg transition-colors"
                  style={{ color: "var(--color-primary)" }}
                >
                  <FiEdit size={18} />
                </motion.button>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleDelete(campaign)}
                  className="p-2 rounded-lg transition-colors"
                  style={{ color: "var(--color-tertiary)" }}
                >
                  <FiTrash2 size={18} />
                </motion.button>
              </div>
            </div>
            <div className="space-y-3 pt-4 border-t" style={{ borderColor: "var(--border-primary)" }}>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <FiCalendar size={14} style={{ color: "var(--text-tertiary)" }} />
                  <span style={{ color: "var(--text-secondary)" }}>
                    {campaign.startDate ? new Date(campaign.startDate).toLocaleDateString() : "—"} -{" "}
                    {campaign.endDate ? new Date(campaign.endDate).toLocaleDateString() : "—"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <FiUsers size={14} style={{ color: "var(--text-tertiary)" }} />
                <span style={{ color: "var(--text-secondary)" }}>{campaign.targetAudience}</span>
              </div>
              {(campaign.discount || 0) > 0 && (
                <div className="text-sm">
                  <span className="font-semibold" style={{ color: "var(--color-primary)" }}>
                    {campaign.discount}% OFF
                  </span>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 pt-3 border-t" style={{ borderColor: "var(--border-primary)" }}>
                <div>
                  <p className="text-xs mb-1" style={{ color: "var(--text-tertiary)" }}>
                    Conversions
                  </p>
                  <p className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                    {campaign.conversions ?? 0}
                  </p>
                </div>
                <div>
                  <p className="text-xs mb-1" style={{ color: "var(--text-tertiary)" }}>
                    Revenue
                  </p>
                  <p className="text-lg font-bold" style={{ color: "var(--color-primary)" }}>
                    ৳{(campaign.revenue ?? 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default Campaigns;
