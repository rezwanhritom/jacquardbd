import { motion } from "framer-motion";

const Loading = () => {
  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
      style={{ backgroundColor: "var(--bg-primary)" }}
      aria-label="Loading"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="flex flex-col items-center gap-4"
      >
        <img
          src="/images/logo.png"
          alt="JACQUARD"
          className="h-14 w-auto object-contain"
        />
        <span
          className="text-2xl font-bold tracking-wider"
          style={{ color: "var(--color-primary)" }}
        >
          JACQUARD
        </span>
        <motion.div
          className="w-8 h-8 border-2 border-t-transparent rounded-full"
          style={{ borderColor: "var(--color-primary)" }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </motion.div>
    </div>
  );
};

export default Loading;
