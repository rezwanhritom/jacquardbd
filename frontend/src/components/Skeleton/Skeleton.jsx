import { motion } from "framer-motion";

const Skeleton = ({ className = "", width, height, rounded = "rounded" }) => {
  return (
    <motion.div
      className={`${rounded} ${className}`}
      style={{
        width: width || "100%",
        height: height || "1rem",
        backgroundColor: "var(--bg-tertiary)",
      }}
      animate={{
        opacity: [0.5, 1, 0.5],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
};

export default Skeleton;
