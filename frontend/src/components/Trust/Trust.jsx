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
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900 border-y border-gray-200 dark:border-gray-700 transition-colors duration-300">
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
                  className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full mb-4 group-hover:bg-gray-900 dark:group-hover:bg-white transition-colors"
                >
                  <Icon
                    size={28}
                    className="text-gray-900 dark:text-white group-hover:text-white dark:group-hover:text-gray-900 transition-colors"
                  />
                </motion.div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">{item.description}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default Trust;
