import { motion } from "framer-motion";
import { Link } from "react-router";
import { pageTransitionVariants, pageTransitionConfig } from "../../utils/animations";

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "var(--bg-primary)" }}>
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial="initial"
          animate="animate"
          exit="exit"
          variants={pageTransitionVariants}
          transition={pageTransitionConfig}
          className="w-full max-w-md space-y-8"
        >
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center"
          >
            <Link to="/" className="inline-flex items-center gap-3 group">
              <motion.img
                src="/images/logo.png"
                alt="Jacquard"
                className="h-12 w-auto object-contain"
                whileHover={{ rotate: [0, -5, 5, -5, 0] }}
                transition={{ duration: 0.5 }}
              />
              <span
                className="text-3xl font-bold tracking-wider"
                style={{ color: "var(--color-primary)" }}
              >
                JACQUARD
              </span>
            </Link>
          </motion.div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center space-y-2"
          >
            <h1
              className="text-3xl font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                {subtitle}
              </p>
            )}
          </motion.div>

          {/* Form content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {children}
          </motion.div>
        </motion.div>
      </div>

      {/* Right side - Decorative (hidden on mobile) */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex lg:flex-1 relative overflow-hidden"
        style={{ backgroundColor: "var(--color-primary)" }}
      >
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center p-12 text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center space-y-6 max-w-lg"
          >
            <h2 className="text-4xl font-bold">Welcome to Jacquard</h2>
            <p className="text-lg opacity-90">
              Discover premium fashion pieces curated for the modern individual.
              Experience luxury, quality, and style.
            </p>
            <div className="flex justify-center gap-8 pt-4">
              <div className="text-center">
                <div className="text-3xl font-bold">500+</div>
                <div className="text-sm opacity-80">Products</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">50K+</div>
                <div className="text-sm opacity-80">Customers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">4.9</div>
                <div className="text-sm opacity-80">Rating</div>
              </div>
            </div>
          </motion.div>

          {/* Decorative shapes */}
          <motion.div
            className="absolute top-20 right-20 w-32 h-32 rounded-full border-4 border-white/20"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute bottom-32 left-16 w-24 h-24 rounded-full border-4 border-white/10"
            animate={{ rotate: -360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute top-1/2 right-12 w-16 h-16 bg-white/10 rounded-lg"
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default AuthLayout;
