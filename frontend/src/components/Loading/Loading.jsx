import { motion } from "framer-motion";

const Loading = () => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center space-y-4">
        <motion.div
          className="w-16 h-16 border-4 border-t-transparent rounded-full mx-auto"
          style={{ borderColor: "var(--color-primary)" }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <p className="text-lg" style={{ color: "var(--text-secondary)" }}>
          Loading...
        </p>
      </div>
    </div>
  );
};

export default Loading;
