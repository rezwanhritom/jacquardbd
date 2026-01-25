import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiEye, FiEyeOff, FiAlertCircle, FiCheck } from "react-icons/fi";

const FormInput = ({
  label,
  type = "text",
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  success,
  disabled,
  icon: Icon,
  required,
  autoComplete,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  const handleFocus = () => setIsFocused(true);
  const handleBlur = (e) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  return (
    <div className="space-y-2">
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium"
          style={{ color: "var(--text-primary)" }}
        >
          {label}
          {required && <span style={{ color: "var(--color-tertiary)" }}> *</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div
            className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors"
            style={{ color: isFocused ? "var(--color-primary)" : "var(--text-tertiary)" }}
          >
            <Icon size={18} />
          </div>
        )}
        <motion.input
          id={name}
          name={name}
          type={inputType}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={autoComplete}
          className={`w-full px-4 py-3.5 border-2 rounded-lg outline-none transition-all text-sm ${
            Icon ? "pl-11" : ""
          } ${isPassword ? "pr-12" : ""} ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
          style={{
            borderColor: error
              ? "var(--color-tertiary)"
              : success
              ? "var(--color-secondary)"
              : isFocused
              ? "var(--color-primary)"
              : "var(--border-primary)",
            backgroundColor: "var(--bg-primary)",
            color: "var(--text-primary)",
          }}
          whileFocus={{ scale: 1.01 }}
          transition={{ duration: 0.2 }}
        />
        {isPassword && (
          <motion.button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded transition-colors"
            style={{ color: "var(--text-tertiary)" }}
            whileHover={{ scale: 1.1, color: "var(--color-primary)" }}
            whileTap={{ scale: 0.9 }}
            tabIndex={-1}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
          </motion.button>
        )}
        {/* Success/Error indicators */}
        <AnimatePresence>
          {(error || success) && !isPassword && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="absolute right-4 top-1/2 -translate-y-1/2"
            >
              {error ? (
                <FiAlertCircle size={18} style={{ color: "var(--color-tertiary)" }} />
              ) : (
                <FiCheck size={18} style={{ color: "var(--color-secondary)" }} />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="text-xs flex items-center gap-1"
            style={{ color: "var(--color-tertiary)" }}
          >
            <FiAlertCircle size={12} />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FormInput;
