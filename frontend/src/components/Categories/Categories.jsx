import { motion } from "framer-motion";
import { categoriesData } from "../../data/categories";
import { fadeInUp, staggerContainer, scaleOnHover } from "../../utils/animations";

const Categories = () => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.h2
            variants={fadeInUp}
            className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4"
          >
            Shop by Category
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
          >
            Discover our curated collections designed for every occasion
          </motion.p>
        </motion.div>

        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {categoriesData.map((category) => (
            <motion.div
              key={category.id}
              variants={fadeInUp}
              whileHover={scaleOnHover}
              className="relative group cursor-pointer overflow-hidden rounded-lg"
            >
              <div className="relative h-80 bg-gray-200 dark:bg-gray-800 overflow-hidden">
                <motion.img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                {category.badge && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0 }}
                    whileHover={{ opacity: 1, scale: 1 }}
                    className="absolute top-4 right-4 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-3 py-1 text-xs font-semibold uppercase tracking-wider"
                  >
                    {category.badge}
                  </motion.span>
                )}

                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <motion.h3
                    className="text-2xl font-bold mb-2"
                    whileHover={{ x: 5 }}
                  >
                    {category.name}
                  </motion.h3>
                  <p className="text-sm text-white/90 mb-4">
                    {category.description}
                  </p>
                  <motion.a
                    href={category.link}
                    className="inline-block text-sm font-medium uppercase tracking-wider underline hover:no-underline"
                    whileHover={{ x: 5 }}
                  >
                    Explore
                  </motion.a>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Categories;
