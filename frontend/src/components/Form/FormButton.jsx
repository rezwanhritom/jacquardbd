import { motion } from "framer-motion";

const FormButton = ({
  children,
  type = "button",
  onClick,
  disabled,
  loading,
  variant = "primary",
  fullWidth = true,
  icon: Icon,
}) => {
  const variants = {
    primary: {
      backgroundColor: "var(--color-primary)",
      color: "white",
      hoverBg: "var(--active-color)",
    },
    secondary: {
      backgroundColor: "var(--bg-secondary)",
      color: "var(--text-primary)",
      hoverBg: "var(--bg-tertiary)",
    },
    outline: {
      backgroundColor: "transparent",
      color: "var(--color-primary)",
      border: "2px solid var(--color-primary)",
      hoverBg: "var(--bg-secondary)",
    },
  };

  const style = variants[variant];

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`relative px-8 py-4 rounded-lg font-semibold text-sm tracking-wide transition-all ${
        fullWidth ? "w-full" : ""
      } ${disabled || loading ? "opacity-60 cursor-not-allowed" : ""}`}
      style={{
        backgroundColor: style.backgroundColor,
        color: style.color,
        border: style.border || "none",
      }}
      whileHover={!disabled && !loading ? { scale: 1.02, backgroundColor: style.hoverBg } : {}}
      whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
      onFocus={(e) => {
        e.currentTarget.style.outline = "2px solid var(--color-primary)";
        e.currentTarget.style.outlineOffset = "2px";
      }}
      onBlur={(e) => {
        e.currentTarget.style.outline = "none";
      }}
    >
      <span className={`flex items-center justify-center gap-2 ${loading ? "opacity-0" : ""}`}>
        {Icon && <Icon size={18} />}
        {children}
      </span>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
      )}
    </motion.button>
  );
};

export default FormButton;
