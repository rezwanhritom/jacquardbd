import { motion } from "framer-motion";
import { fadeInUp } from "../../utils/animations";
import { FiSettings } from "react-icons/fi";
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
          Preferences
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
    </div>
  );
};

export default Settings;
