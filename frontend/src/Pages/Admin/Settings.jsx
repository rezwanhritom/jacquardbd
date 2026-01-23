import { Container } from "../../components";
import { motion } from "framer-motion";
import { fadeInUp } from "../../utils/animations";
import { FiSettings, FiSave } from "react-icons/fi";

const Settings = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <FiSettings size={24} style={{ color: "var(--color-primary)" }} />
        <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
          Admin Settings
        </h2>
      </div>

      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeInUp}
        className="p-6 rounded-lg space-y-6"
        style={{ backgroundColor: "var(--bg-secondary)" }}
      >
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
            Store Name
          </label>
          <input
            type="text"
            defaultValue="Jacquard"
            className="w-full px-4 py-3 border rounded-lg outline-none transition-colors"
            style={{
              borderColor: "var(--border-primary)",
              backgroundColor: "var(--bg-primary)",
              color: "var(--text-primary)",
            }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
            Store Email
          </label>
          <input
            type="email"
            defaultValue="contact@jacquard.com"
            className="w-full px-4 py-3 border rounded-lg outline-none transition-colors"
            style={{
              borderColor: "var(--border-primary)",
              backgroundColor: "var(--bg-primary)",
              color: "var(--text-primary)",
            }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
            Currency
          </label>
          <select
            className="w-full px-4 py-3 border rounded-lg outline-none transition-colors"
            style={{
              borderColor: "var(--border-primary)",
              backgroundColor: "var(--bg-primary)",
              color: "var(--text-primary)",
            }}
          >
            <option>USD ($)</option>
            <option>EUR (€)</option>
            <option>GBP (£)</option>
          </select>
        </div>
        <button
          className="px-6 py-3 text-white font-semibold uppercase tracking-wider rounded-lg flex items-center space-x-2"
          style={{ backgroundColor: "var(--color-primary)" }}
        >
          <FiSave size={20} />
          <span>Save Settings</span>
        </button>
      </motion.div>
    </div>
  );
};

export default Settings;
