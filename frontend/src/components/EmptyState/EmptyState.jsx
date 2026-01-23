import { motion } from "framer-motion";
import { fadeInUp } from "../../utils/animations";
import { Link } from "react-router";

const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionPath,
  onAction,
  className = "",
}) => {
  const ActionButton = actionPath ? Link : motion.button;

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={fadeInUp}
      className={`text-center py-16 space-y-6 ${className}`}
    >
      {Icon && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="flex justify-center"
        >
          <div className="p-6 rounded-full" style={{ backgroundColor: "var(--bg-secondary)" }}>
            <Icon size={64} style={{ color: "var(--text-tertiary)" }} />
          </div>
        </motion.div>
      )}
      <div className="space-y-2">
        <h3 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
          {title}
        </h3>
        {description && (
          <p className="text-sm max-w-md mx-auto" style={{ color: "var(--text-secondary)" }}>
            {description}
          </p>
        )}
      </div>
      {(actionLabel && actionPath) || (actionLabel && onAction) ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {actionPath ? (
            <Link
              to={actionPath}
              className="inline-block px-8 py-4 text-white font-semibold uppercase tracking-wider rounded-lg transition-colors"
              style={{ backgroundColor: "var(--color-primary)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--active-color)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "var(--color-primary)";
              }}
              onFocus={(e) => {
                e.currentTarget.style.outline = "2px solid var(--color-primary)";
                e.currentTarget.style.outlineOffset = "2px";
              }}
              onBlur={(e) => {
                e.currentTarget.style.outline = "none";
              }}
            >
              {actionLabel}
            </Link>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onAction}
              className="px-8 py-4 text-white font-semibold uppercase tracking-wider rounded-lg"
              style={{ backgroundColor: "var(--color-primary)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--active-color)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "var(--color-primary)";
              }}
              onFocus={(e) => {
                e.currentTarget.style.outline = "2px solid var(--color-primary)";
                e.currentTarget.style.outlineOffset = "2px";
              }}
              onBlur={(e) => {
                e.currentTarget.style.outline = "none";
              }}
            >
              {actionLabel}
            </motion.button>
          )}
        </motion.div>
      ) : null}
    </motion.div>
  );
};

export default EmptyState;
