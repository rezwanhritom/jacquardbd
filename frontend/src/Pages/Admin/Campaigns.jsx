import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fadeInUp, staggerContainer } from "../../utils/animations";
import { FiPlus, FiEdit, FiTrash2, FiX, FiSave, FiTrendingUp, FiCalendar, FiUsers } from "react-icons/fi";
import { campaigns } from "../../data/adminData";

const Campaigns = () => {
  const [campaignsList, setCampaignsList] = useState(campaigns);
  const [showForm, setShowForm] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "Discount",
    status: "Scheduled",
    startDate: "",
    endDate: "",
    discount: "",
    targetAudience: "All Customers",
  });

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
      default:
        return "var(--text-tertiary)";
    }
  };

  const handleEdit = (campaign) => {
    setEditingCampaign(campaign.id);
    setFormData({
      name: campaign.name,
      type: campaign.type,
      status: campaign.status,
      startDate: campaign.startDate,
      endDate: campaign.endDate,
      discount: campaign.discount.toString(),
      targetAudience: campaign.targetAudience,
    });
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this campaign?")) {
      setCampaignsList(campaignsList.filter((c) => c.id !== id));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingCampaign) {
      setCampaignsList(
        campaignsList.map((c) =>
          c.id === editingCampaign
            ? {
                ...c,
                ...formData,
                discount: parseFloat(formData.discount),
                conversions: c.conversions,
                revenue: c.revenue,
              }
            : c
        )
      );
    } else {
      setCampaignsList([
        ...campaignsList,
        {
          id: campaignsList.length + 1,
          ...formData,
          discount: parseFloat(formData.discount),
          conversions: 0,
          revenue: 0,
        },
      ]);
    }
    handleCancel();
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
            setShowForm(true);
            setEditingCampaign(null);
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
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 px-6 py-3 text-white font-semibold rounded-lg"
                  style={{ backgroundColor: "var(--color-primary)" }}
                >
                  <FiSave size={18} />
                  {editingCampaign ? "Update Campaign" : "Create Campaign"}
                </motion.button>
                <motion.button
                  type="button"
                  onClick={handleCancel}
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
        {campaignsList.map((campaign, index) => (
          <motion.div
            key={campaign.id}
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
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleEdit(campaign)}
                  className="p-2 rounded-lg transition-colors"
                  style={{ color: "var(--color-primary)" }}
                >
                  <FiEdit size={18} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleDelete(campaign.id)}
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
                    {new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <FiUsers size={14} style={{ color: "var(--text-tertiary)" }} />
                <span style={{ color: "var(--text-secondary)" }}>{campaign.targetAudience}</span>
              </div>
              {campaign.discount > 0 && (
                <div className="text-sm">
                  <span className="font-semibold" style={{ color: "var(--color-primary)" }}>
                    {campaign.discount}% OFF
                  </span>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 pt-3 border-t" style={{ borderColor: "var(--border-primary)" }}>
                <div>
                  <p className="text-xs mb-1" style={{ color: "var(--text-tertiary)" }}>Conversions</p>
                  <p className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                    {campaign.conversions}
                  </p>
                </div>
                <div>
                  <p className="text-xs mb-1" style={{ color: "var(--text-tertiary)" }}>Revenue</p>
                  <p className="text-lg font-bold" style={{ color: "var(--color-primary)" }}>
                    ${campaign.revenue.toLocaleString()}
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
