import { motion } from "framer-motion";
import { FiCheck } from "react-icons/fi";

const FormCheckbox = ({ label, checked, onChange, name, disabled, error }) => {
  return (
    <div className="space-y-1">
      <label className={`flex items-start gap-3 cursor-pointer ${disabled ? "opacity-60" : ""}`}>
        <div className="relative mt-0.5">
          <input
            type="checkbox"
            name={name}
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            className="sr-only"
          />
          <motion.div
            className="w-5 h-5 rounded border-2 flex items-center justify-center transition-colors"
            style={{
              borderColor: error
                ? "var(--color-tertiary)"
                : checked
                ? "var(--color-primary)"
                : "var(--border-primary)",
              backgroundColor: checked ? "var(--color-primary)" : "transparent",
            }}
            whileTap={{ scale: 0.9 }}
          >
            <motion.div
              initial={false}
              animate={{ scale: checked ? 1 : 0, opacity: checked ? 1 : 0 }}
              transition={{ duration: 0.15 }}
            >
              <FiCheck size={14} color="white" strokeWidth={3} />
            </motion.div>
          </motion.div>
        </div>
        <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
          {label}
        </span>
      </label>
      {error && (
        <p className="text-xs" style={{ color: "var(--color-tertiary)" }}>
          {error}
        </p>
      )}
    </div>
  );
};

export default FormCheckbox;
