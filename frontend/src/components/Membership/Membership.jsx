import { Link } from "react-router";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "../../utils/animations";
import { FiStar, FiGift, FiShield } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";

const Membership = () => {
  const { user, isAuthenticated } = useAuth();

  const role = user?.role ?? "user";
  if (role === "premium" || role === "admin") {
    return null;
  }

  const benefits = [
    { icon: FiStar, title: "Exclusive Access", description: "Early access to new collections and limited editions" },
    { icon: FiGift, title: "Special Offers", description: "Members-only discounts and birthday rewards" },
    { icon: FiShield, title: "VIP Support", description: "Priority customer service and dedicated support" },
  ];

  const becomeMemberTo = isAuthenticated ? "/account" : "/login";

  return (
    <section className="py-8 md:py-10 px-4 sm:px-6 lg:px-8 transition-colors duration-300 relative overflow-hidden" style={{ backgroundColor: "var(--bg-secondary)" }}>
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full" style={{ backgroundColor: "var(--color-primary)", filter: "blur(80px)" }} />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full" style={{ backgroundColor: "var(--color-secondary)", filter: "blur(80px)" }} />
      </div>

      <div className="relative max-w-4xl mx-auto">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
          className="text-center mb-6"
        >
          <motion.h2
            variants={fadeInUp}
            className="text-2xl md:text-3xl font-bold mb-2"
            style={{ color: "var(--color-primary)" }}
          >
            Join exclusive membership
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="text-sm md:text-base max-w-xl mx-auto"
            style={{ color: "var(--text-secondary)" }}
          >
            Unlock premium benefits and elevate your shopping experience with our exclusive membership program.
          </motion.p>
        </motion.div>

        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
        >
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ y: -3, scale: 1.01 }}
                className="p-4 rounded-xl text-center transition-shadow duration-200"
                style={{ backgroundColor: "var(--bg-primary)" }}
              >
                <motion.div
                  className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-3"
                  style={{ backgroundColor: "var(--bg-tertiary)" }}
                  whileHover={{ rotate: 360, scale: 1.05 }}
                  transition={{ duration: 0.5 }}
                >
                  <Icon size={22} style={{ color: "var(--color-primary)" }} />
                </motion.div>
                <h3 className="text-base font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
                  {benefit.title}
                </h3>
                <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                  {benefit.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <Link to={becomeMemberTo}>
            <motion.button
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-2.5 tracking-wide text-sm font-semibold text-white rounded-lg"
              style={{ backgroundColor: "var(--color-primary)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--active-color)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "var(--color-primary)";
              }}
            >
              Become a Member
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default Membership;
