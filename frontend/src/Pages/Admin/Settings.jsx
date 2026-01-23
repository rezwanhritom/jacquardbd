import { useState } from "react";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "../../utils/animations";
import { FiSettings, FiSave, FiStore, FiTruck, FiCreditCard, FiBell } from "react-icons/fi";
import { adminSettings } from "../../data/adminData";
import toast from "react-hot-toast";

const Settings = () => {
  const [settings, setSettings] = useState(adminSettings);
  const [saved, setSaved] = useState(false);

  const handleChange = (section, key, value) => {
    setSettings({
      ...settings,
      [section]: {
        ...settings[section],
        [key]: value,
      },
    });
    setSaved(false);
  };

  const handleSave = () => {
    // In real app, this would save to backend
    setSaved(true);
    toast.success("Settings saved successfully!");
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FiSettings size={24} style={{ color: "var(--color-primary)" }} />
          <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            Admin Settings
          </h2>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-3 text-white font-semibold rounded-lg"
          style={{ backgroundColor: "var(--color-primary)" }}
        >
          <FiSave size={18} />
          Save All Settings
        </motion.button>
      </div>

      <motion.div
        initial="initial"
        animate="animate"
        variants={staggerContainer}
        className="space-y-6"
      >
        {/* Store Settings */}
        <motion.div
          variants={fadeInUp}
          className="p-6 rounded-lg space-y-6"
          style={{ backgroundColor: "var(--bg-secondary)" }}
        >
          <div className="flex items-center gap-3 mb-4">
            <FiStore size={24} style={{ color: "var(--color-primary)" }} />
            <h3 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
              Store Information
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                Store Name *
              </label>
              <input
                type="text"
                value={settings.store.name}
                onChange={(e) => handleChange("store", "name", e.target.value)}
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
                Store Email *
              </label>
              <input
                type="email"
                value={settings.store.email}
                onChange={(e) => handleChange("store", "email", e.target.value)}
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
                Store Phone *
              </label>
              <input
                type="tel"
                value={settings.store.phone}
                onChange={(e) => handleChange("store", "phone", e.target.value)}
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
                Currency *
              </label>
              <select
                value={settings.store.currency}
                onChange={(e) => handleChange("store", "currency", e.target.value)}
                className="w-full px-4 py-3 border-2 rounded-lg outline-none"
                style={{
                  borderColor: "var(--border-primary)",
                  backgroundColor: "var(--bg-primary)",
                  color: "var(--text-primary)",
                }}
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="BDT">BDT (৳)</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                Store Address *
              </label>
              <input
                type="text"
                value={settings.store.address}
                onChange={(e) => handleChange("store", "address", e.target.value)}
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
                Timezone *
              </label>
              <select
                value={settings.store.timezone}
                onChange={(e) => handleChange("store", "timezone", e.target.value)}
                className="w-full px-4 py-3 border-2 rounded-lg outline-none"
                style={{
                  borderColor: "var(--border-primary)",
                  backgroundColor: "var(--bg-primary)",
                  color: "var(--text-primary)",
                }}
              >
                <option value="Asia/Dhaka">Asia/Dhaka (GMT+6)</option>
                <option value="America/New_York">America/New_York (GMT-5)</option>
                <option value="Europe/London">Europe/London (GMT+0)</option>
                <option value="Asia/Dubai">Asia/Dubai (GMT+4)</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Shipping Settings */}
        <motion.div
          variants={fadeInUp}
          className="p-6 rounded-lg space-y-6"
          style={{ backgroundColor: "var(--bg-secondary)" }}
        >
          <div className="flex items-center gap-3 mb-4">
            <FiTruck size={24} style={{ color: "var(--color-primary)" }} />
            <h3 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
              Shipping Settings
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                Standard Shipping ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={settings.shipping.standard}
                onChange={(e) => handleChange("shipping", "standard", parseFloat(e.target.value))}
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
                Express Shipping ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={settings.shipping.express}
                onChange={(e) => handleChange("shipping", "express", parseFloat(e.target.value))}
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
                Overnight Shipping ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={settings.shipping.overnight}
                onChange={(e) => handleChange("shipping", "overnight", parseFloat(e.target.value))}
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
                Free Shipping Threshold ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={settings.shipping.freeShippingThreshold}
                onChange={(e) => handleChange("shipping", "freeShippingThreshold", parseFloat(e.target.value))}
                className="w-full px-4 py-3 border-2 rounded-lg outline-none"
                style={{
                  borderColor: "var(--border-primary)",
                  backgroundColor: "var(--bg-primary)",
                  color: "var(--text-primary)",
                }}
              />
            </div>
          </div>
        </motion.div>

        {/* Payment Settings */}
        <motion.div
          variants={fadeInUp}
          className="p-6 rounded-lg space-y-6"
          style={{ backgroundColor: "var(--bg-secondary)" }}
        >
          <div className="flex items-center gap-3 mb-4">
            <FiCreditCard size={24} style={{ color: "var(--color-primary)" }} />
            <h3 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
              Payment Methods
            </h3>
          </div>
          <div className="space-y-3">
            {Object.entries(settings.payment).map(([method, enabled]) => (
              <div key={method} className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: "var(--bg-primary)" }}>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) => handleChange("payment", method, e.target.checked)}
                    className="w-5 h-5"
                    style={{ accentColor: "var(--color-primary)" }}
                  />
                  <span className="font-semibold capitalize" style={{ color: "var(--text-primary)" }}>
                    {method.replace(/([A-Z])/g, " $1").trim()}
                  </span>
                </label>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Notification Settings */}
        <motion.div
          variants={fadeInUp}
          className="p-6 rounded-lg space-y-6"
          style={{ backgroundColor: "var(--bg-secondary)" }}
        >
          <div className="flex items-center gap-3 mb-4">
            <FiBell size={24} style={{ color: "var(--color-primary)" }} />
            <h3 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
              Notification Preferences
            </h3>
          </div>
          <div className="space-y-3">
            {Object.entries(settings.notifications).map(([notification, enabled]) => (
              <div key={notification} className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: "var(--bg-primary)" }}>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) => handleChange("notifications", notification, e.target.checked)}
                    className="w-5 h-5"
                    style={{ accentColor: "var(--color-primary)" }}
                  />
                  <span className="font-semibold capitalize" style={{ color: "var(--text-primary)" }}>
                    {notification.replace(/([A-Z])/g, " $1").trim()}
                  </span>
                </label>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* Save Confirmation */}
      <AnimatePresence>
        {saved && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed bottom-6 right-6 px-6 py-4 rounded-lg shadow-lg"
            style={{ backgroundColor: "var(--color-primary)", color: "white" }}
          >
            <div className="flex items-center gap-2">
              <FiSave size={20} />
              <span className="font-semibold">Settings saved successfully!</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Settings;
