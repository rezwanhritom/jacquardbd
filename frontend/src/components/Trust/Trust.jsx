import { motion } from "framer-motion";
import { trustData } from "../../data/trust";
import { fadeInUp, staggerContainer } from "../../utils/animations";
import {
  FiTruck,
  FiRotateCcw,
  FiShield,
  FiHeadphones,
} from "react-icons/fi";

const Trust = () => {
  const getIcon = (iconName) => {
    const icons = {
      truck: FiTruck,
      return: FiRotateCcw,
      shield: FiShield,
      support: FiHeadphones,
    };
    return icons[iconName] || FiShield;
  };

  return (
    <section 
      className="py-20 px-4 sm:px-6 lg:px-8 border-y transition-colors duration-300"
      style={{ 
        backgroundColor: "var(--bg-primary)",
        borderColor: "var(--border-primary)"
      }}
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {trustData.map((item) => {
            const Icon = getIcon(item.icon);
            return (
              <motion.div
                key={item.id}
                variants={fadeInUp}
                className="text-center group"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 transition-colors"
                  style={{ backgroundColor: "var(--bg-tertiary)" }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "var(--color-primary)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "var(--bg-tertiary)";
                  }}
                >
                  <Icon
                    size={28}
                    style={{ color: "var(--color-primary)" }}
                    className="transition-colors"
                  />
                </motion.div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--color-primary)" }}>
                  {item.title}
                </h3>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{item.description}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default Trust;
