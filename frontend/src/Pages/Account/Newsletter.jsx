import { useState } from "react";
import { motion } from "framer-motion";
import { fadeInUp } from "../../utils/animations";
import { FiMail, FiCheck, FiBell } from "react-icons/fi";
import { newsletterPreferences as initialPreferences } from "../../data/accountData";
import toast from "react-hot-toast";

const Newsletter = () => {
  const [preferences, setPreferences] = useState(initialPreferences);
  const [saved, setSaved] = useState(false);

  const handleToggle = (key) => {
    setPreferences({
      ...preferences,
      preferences: {
        ...preferences.preferences,
        [key]: !preferences.preferences[key],
      },
    });
    setSaved(false);
  };

  const handleSave = () => {
    // In real app, this would save to backend
    setSaved(true);
    toast.success("Newsletter preferences saved!");
    setTimeout(() => setSaved(false), 3000);
  };

  const preferenceLabels = {
    newArrivals: "New Arrivals",
    sales: "Sales & Promotions",
    exclusiveOffers: "Exclusive Offers",
    styleTips: "Style Tips & Trends",
    events: "Events & Workshops",
    birthdayOffers: "Birthday Offers",
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeInUp}
        className="p-6 rounded-lg space-y-6"
        style={{ backgroundColor: "var(--bg-secondary)" }}
      >
        <div className="flex items-center gap-3 mb-6">
          <FiMail size={24} style={{ color: "var(--color-primary)" }} />
          <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            Newsletter Preferences
          </h2>
        </div>

        {/* Email Subscription Status */}
        <div className="p-4 rounded-lg border-2" style={{ borderColor: "var(--border-primary)", backgroundColor: "var(--bg-primary)" }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
                Email Subscription
              </p>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                {preferences.email}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`px-4 py-2 text-sm font-semibold rounded-lg ${
                  preferences.subscribed ? "text-green-600" : "text-gray-500"
                }`}
                style={{
                  backgroundColor: preferences.subscribed ? "rgba(34, 197, 94, 0.1)" : "var(--bg-tertiary)",
                }}
              >
                {preferences.subscribed ? "Subscribed" : "Unsubscribed"}
              </span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              onClick={() => {
                const newStatus = !preferences.subscribed;
                setPreferences({ ...preferences, subscribed: newStatus });
                setSaved(false);
                toast.success(newStatus ? "Subscribed to newsletter!" : "Unsubscribed from newsletter");
              }}
                className="px-4 py-2 border-2 rounded-lg font-semibold text-sm transition-colors"
                style={{
                  borderColor: "var(--border-primary)",
                  color: "var(--text-primary)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--color-primary)";
                  e.currentTarget.style.backgroundColor = "var(--color-primary)";
                  e.currentTarget.style.color = "white";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border-primary)";
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "var(--text-primary)";
                }}
              >
                {preferences.subscribed ? "Unsubscribe" : "Subscribe"}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Email Preferences */}
        {preferences.subscribed && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <FiBell size={20} style={{ color: "var(--color-primary)" }} />
              <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                Email Preferences
              </h3>
            </div>
            <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
              Choose what types of emails you'd like to receive:
            </p>
            <div className="space-y-3">
              {Object.entries(preferenceLabels).map(([key, label]) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Object.keys(preferenceLabels).indexOf(key) * 0.05 }}
                  className="flex items-center justify-between p-4 rounded-lg border-2 transition-all"
                  style={{
                    borderColor: preferences.preferences[key] ? "var(--color-primary)" : "var(--border-primary)",
                    backgroundColor: "var(--bg-primary)",
                  }}
                  whileHover={{ scale: 1.01 }}
                >
                  <div>
                    <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
                      {label}
                    </p>
                    <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                      {key === "newArrivals" && "Get notified when new products arrive"}
                      {key === "sales" && "Receive updates about sales and special promotions"}
                      {key === "exclusiveOffers" && "Access to member-only deals and offers"}
                      {key === "styleTips" && "Fashion tips, trends, and styling advice"}
                      {key === "events" && "Invitations to events, workshops, and launches"}
                      {key === "birthdayOffers" && "Special offers and gifts on your birthday"}
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleToggle(key)}
                    className={`w-14 h-8 rounded-full p-1 transition-colors ${
                      preferences.preferences[key] ? "justify-end" : "justify-start"
                    } flex items-center`}
                    style={{
                      backgroundColor: preferences.preferences[key] ? "var(--color-primary)" : "var(--bg-tertiary)",
                    }}
                  >
                    <motion.div
                      layout
                      className="w-6 h-6 rounded-full bg-white shadow-md"
                    />
                  </motion.button>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Save Button */}
        {preferences.subscribed && (
          <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: "var(--border-primary)" }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: saved ? 1 : 0, scale: saved ? 1 : 0.8 }}
              className="flex items-center gap-2 text-sm"
              style={{ color: "var(--color-primary)" }}
            >
              <FiCheck size={18} />
              <span>Preferences saved!</span>
            </motion.div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              className="px-6 py-3 text-white font-semibold rounded-lg"
              style={{ backgroundColor: "var(--color-primary)" }}
            >
              Save Preferences
            </motion.button>
          </div>
        )}
      </motion.div>

      {/* Info Section */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeInUp}
        className="p-6 rounded-lg"
        style={{ backgroundColor: "var(--bg-secondary)" }}
      >
        <h3 className="font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
          Why Subscribe?
        </h3>
        <ul className="space-y-2 text-sm" style={{ color: "var(--text-secondary)" }}>
          <li className="flex items-start gap-2">
            <FiCheck size={16} className="mt-1 flex-shrink-0" style={{ color: "var(--color-primary)" }} />
            <span>Be the first to know about new arrivals and exclusive collections</span>
          </li>
          <li className="flex items-start gap-2">
            <FiCheck size={16} className="mt-1 flex-shrink-0" style={{ color: "var(--color-primary)" }} />
            <span>Get early access to sales and special promotions</span>
          </li>
          <li className="flex items-start gap-2">
            <FiCheck size={16} className="mt-1 flex-shrink-0" style={{ color: "var(--color-primary)" }} />
            <span>Receive style tips and fashion inspiration</span>
          </li>
          <li className="flex items-start gap-2">
            <FiCheck size={16} className="mt-1 flex-shrink-0" style={{ color: "var(--color-primary)" }} />
            <span>Unsubscribe anytime with one click</span>
          </li>
        </ul>
      </motion.div>
    </div>
  );
};

export default Newsletter;
