import { motion } from "framer-motion";
import { FiCheck, FiX } from "react-icons/fi";

const PasswordStrength = ({ password }) => {
  const requirements = [
    { label: "At least 8 characters", test: (p) => p.length >= 8 },
    { label: "One uppercase letter", test: (p) => /[A-Z]/.test(p) },
    { label: "One lowercase letter", test: (p) => /[a-z]/.test(p) },
    { label: "One number", test: (p) => /\d/.test(p) },
    { label: "One special character", test: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
  ];

  const passedCount = requirements.filter((req) => req.test(password)).length;
  const strength = passedCount === 0 ? 0 : passedCount <= 2 ? 1 : passedCount <= 4 ? 2 : 3;
  const strengthLabels = ["", "Weak", "Medium", "Strong"];
  const strengthColors = [
    "var(--bg-tertiary)",
    "var(--color-tertiary)",
    "var(--color-secondary)",
    "var(--color-primary)",
  ];

  if (!password) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="space-y-3 pt-2"
    >
      {/* Strength bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>
            Password strength
          </span>
          <span
            className="text-xs font-medium"
            style={{ color: strengthColors[strength] }}
          >
            {strengthLabels[strength]}
          </span>
        </div>
        <div className="flex gap-1">
          {[1, 2, 3].map((level) => (
            <motion.div
              key={level}
              className="h-1.5 flex-1 rounded-full transition-colors"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              style={{
                backgroundColor: level <= strength ? strengthColors[strength] : "var(--bg-tertiary)",
                transformOrigin: "left",
              }}
              transition={{ delay: level * 0.1, duration: 0.3 }}
            />
          ))}
        </div>
      </div>

      {/* Requirements list */}
      <div className="space-y-1.5">
        {requirements.map((req, index) => {
          const passed = req.test(password);
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-2 text-xs"
              style={{ color: passed ? "var(--color-primary)" : "var(--text-tertiary)" }}
            >
              <motion.div
                initial={false}
                animate={{ scale: passed ? [1, 1.2, 1] : 1 }}
                transition={{ duration: 0.2 }}
              >
                {passed ? <FiCheck size={12} /> : <FiX size={12} />}
              </motion.div>
              {req.label}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default PasswordStrength;
