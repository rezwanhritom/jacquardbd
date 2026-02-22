import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "../../utils/animations";
import { FiSettings, FiSave, FiStore, FiTruck, FiCreditCard, FiBell } from "react-icons/fi";
import { adminSettings } from "../../data/adminData";
import { getShippingOptions, updateShippingOptions } from "../../services/shipping.service";
import toast from "react-hot-toast";
import Loading from "../../components/Loading";

const Settings = () => {
  const [settings, setSettings] = useState(adminSettings);
  const [saved, setSaved] = useState(false);
  const [shippingOptions, setShippingOptions] = useState([]);
  const [shippingLoading, setShippingLoading] = useState(true);
  const [shippingSaving, setShippingSaving] = useState(false);

  useEffect(() => {
    getShippingOptions()
      .then(({ success, options }) => {
        if (success && Array.isArray(options)) setShippingOptions(options);
      })
      .finally(() => setShippingLoading(false));
  }, []);

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

  const handleShippingOptionChange = (index, field, value) => {
    setShippingOptions((prev) => {
      const next = prev.map((o, i) => (i === index ? { ...o, [field]: value } : o));
      return next;
    });
  };

  const handleSave = () => {
    setSaved(true);
    toast.success("Settings saved successfully!");
    setTimeout(() => setSaved(false), 3000);
  };

  const handleSaveShipping = () => {
    setShippingSaving(true);
    updateShippingOptions(shippingOptions)
      .then(({ success, options, message }) => {
        if (success) {
          setShippingOptions(options || shippingOptions);
          toast.success("Shipping options saved.");
        } else {
          toast.error(message || "Failed to save shipping options");
        }
      })
      .catch(() => toast.error("Failed to save shipping options"))
      .finally(() => setShippingSaving(false));
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

        {/* Shipping Settings (DB-synced) */}
        <motion.div
          variants={fadeInUp}
          className="p-6 rounded-lg space-y-6"
          style={{ backgroundColor: "var(--bg-secondary)" }}
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <FiTruck size={24} style={{ color: "var(--color-primary)" }} />
              <h3 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                Shipping Settings
              </h3>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSaveShipping}
              disabled={shippingLoading || shippingSaving}
              className="flex items-center gap-2 px-4 py-2 text-white font-semibold rounded-lg disabled:opacity-60"
              style={{ backgroundColor: "var(--color-primary)" }}
            >
              <FiSave size={18} />
              {shippingSaving ? "Saving…" : "Save Shipping"}
            </motion.button>
          </div>
          {shippingLoading ? (
            <div className="flex justify-center py-8">
              <Loading />
            </div>
          ) : (
            <div className="space-y-4">
              {shippingOptions.map((option, index) => (
                <div
                  key={option.id}
                  className="p-4 rounded-lg border-2 grid grid-cols-1 md:grid-cols-2 gap-4"
                  style={{ borderColor: "var(--border-primary)", backgroundColor: "var(--bg-primary)" }}
                >
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                      Name
                    </label>
                    <input
                      type="text"
                      value={option.name || ""}
                      onChange={(e) => handleShippingOptionChange(index, "name", e.target.value)}
                      className="w-full px-4 py-2 border-2 rounded-lg outline-none"
                      style={{
                        borderColor: "var(--border-primary)",
                        backgroundColor: "var(--bg-secondary)",
                        color: "var(--text-primary)",
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                      Description (e.g. 5-7 business days, Only available in Dhaka)
                    </label>
                    <input
                      type="text"
                      value={option.description || ""}
                      onChange={(e) => handleShippingOptionChange(index, "description", e.target.value)}
                      className="w-full px-4 py-2 border-2 rounded-lg outline-none"
                      style={{
                        borderColor: "var(--border-primary)",
                        backgroundColor: "var(--bg-secondary)",
                        color: "var(--text-primary)",
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                      Price (৳) — leave empty for &quot;Based on distance&quot;
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={option.price ?? ""}
                      onChange={(e) => {
                        const v = e.target.value;
                        handleShippingOptionChange(index, "price", v === "" ? null : parseFloat(v));
                      }}
                      placeholder="Empty = based on distance"
                      className="w-full px-4 py-2 border-2 rounded-lg outline-none"
                      style={{
                        borderColor: "var(--border-primary)",
                        backgroundColor: "var(--bg-secondary)",
                        color: "var(--text-primary)",
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                      Price label when no fixed price (e.g. Based on distance)
                    </label>
                    <input
                      type="text"
                      value={option.priceLabel || ""}
                      onChange={(e) => handleShippingOptionChange(index, "priceLabel", e.target.value)}
                      placeholder="Based on distance"
                      className="w-full px-4 py-2 border-2 rounded-lg outline-none"
                      style={{
                        borderColor: "var(--border-primary)",
                        backgroundColor: "var(--bg-secondary)",
                        color: "var(--text-primary)",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
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
