import { Container } from "../../components";
import { motion } from "framer-motion";
import { fadeInUp } from "../../utils/animations";
import { FiSettings, FiBell, FiLock, FiShield } from "react-icons/fi";
import { useDarkMode } from "../../context/DarkModeContext";

const Settings = () => {
  const { isDark, toggleDarkMode } = useDarkMode();

  return (
    <div className="space-y-6">
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeInUp}
        className="flex items-center space-x-3 mb-6"
      >
        <FiSettings size={24} style={{ color: "var(--color-primary)" }} />
        <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
          Settings
        </h2>
      </motion.div>

      {/* Appearance */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeInUp}
        className="p-6 rounded-lg space-y-4"
        style={{ backgroundColor: "var(--bg-secondary)" }}
      >
        <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
          Appearance
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium" style={{ color: "var(--text-primary)" }}>
              Dark Mode
            </p>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Toggle between light and dark theme
            </p>
          </div>
          <button
            onClick={toggleDarkMode}
            className={`relative w-14 h-8 rounded-full transition-colors ${
              isDark ? "bg-green-500" : "bg-gray-300"
            }`}
          >
            <span
              className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                isDark ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </motion.div>

      {/* Notifications */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeInUp}
        className="p-6 rounded-lg space-y-4"
        style={{ backgroundColor: "var(--bg-secondary)" }}
      >
        <div className="flex items-center space-x-3 mb-4">
          <FiBell size={20} style={{ color: "var(--color-primary)" }} />
          <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
            Notifications
          </h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium" style={{ color: "var(--text-primary)" }}>
                Email Notifications
              </p>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Receive updates about your orders
              </p>
            </div>
            <input type="checkbox" defaultChecked className="w-5 h-5" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium" style={{ color: "var(--text-primary)" }}>
                SMS Notifications
              </p>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Receive text messages about promotions
              </p>
            </div>
            <input type="checkbox" className="w-5 h-5" />
          </div>
        </div>
      </motion.div>

      {/* Security */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeInUp}
        className="p-6 rounded-lg space-y-4"
        style={{ backgroundColor: "var(--bg-secondary)" }}
      >
        <div className="flex items-center space-x-3 mb-4">
          <FiLock size={20} style={{ color: "var(--color-primary)" }} />
          <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
            Security
          </h3>
        </div>
        <div className="space-y-4">
          <button
            className="w-full px-4 py-3 border rounded-lg text-left transition-colors"
            style={{
              borderColor: "var(--border-primary)",
              color: "var(--text-primary)",
            }}
          >
            <p className="font-medium">Change Password</p>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Update your account password
            </p>
          </button>
          <button
            className="w-full px-4 py-3 border rounded-lg text-left transition-colors"
            style={{
              borderColor: "var(--border-primary)",
              color: "var(--text-primary)",
            }}
          >
            <p className="font-medium">Two-Factor Authentication</p>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Add an extra layer of security
            </p>
          </button>
        </div>
      </motion.div>

      {/* Privacy */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeInUp}
        className="p-6 rounded-lg space-y-4"
        style={{ backgroundColor: "var(--bg-secondary)" }}
      >
        <div className="flex items-center space-x-3 mb-4">
          <FiShield size={20} style={{ color: "var(--color-primary)" }} />
          <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
            Privacy
          </h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium" style={{ color: "var(--text-primary)" }}>
                Share Analytics
              </p>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Help us improve by sharing usage data
              </p>
            </div>
            <input type="checkbox" defaultChecked className="w-5 h-5" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium" style={{ color: "var(--text-primary)" }}>
                Marketing Emails
              </p>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Receive promotional emails and offers
              </p>
            </div>
            <input type="checkbox" className="w-5 h-5" />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Settings;
