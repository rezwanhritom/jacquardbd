import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { productsData } from "../../data/products";
import { fadeInUp, staggerContainer } from "../../utils/animations";
import { FiHeart, FiShoppingBag, FiChevronLeft, FiChevronRight } from "react-icons/fi";

const Products = () => {
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [imageIndices, setImageIndices] = useState({});

  const handleNextImage = (productId, totalImages, e) => {
    e.stopPropagation();
    setImageIndices((prev) => ({
      ...prev,
      [productId]: ((prev[productId] || 0) + 1) % totalImages,
    }));
  };

  const handlePrevImage = (productId, totalImages, e) => {
    e.stopPropagation();
    setImageIndices((prev) => ({
      ...prev,
      [productId]: ((prev[productId] || 0) - 1 + totalImages) % totalImages,
    }));
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
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
            Featured Products
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
          >
            Discover our handpicked selection of premium fashion pieces
          </motion.p>
        </motion.div>

        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {productsData.map((product) => {
            const currentImageIndex = imageIndices[product.id] || 0;
            const currentImage = product.images[currentImageIndex];

            return (
              <motion.div
                key={product.id}
                variants={fadeInUp}
                className="bg-white dark:bg-gray-900 group cursor-pointer"
                onMouseEnter={() => setHoveredProduct(product.id)}
                onMouseLeave={() => setHoveredProduct(null)}
              >
                <div className="relative overflow-hidden aspect-[3/4] bg-gray-100 dark:bg-gray-800">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={currentImageIndex}
                      src={currentImage}
                      alt={`${product.name} - Image ${currentImageIndex + 1}`}
                      className="w-full h-full object-cover"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    />
                  </AnimatePresence>

                  {/* Image Navigation Arrows */}
                  <div className="absolute inset-0 flex items-center justify-between px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <motion.button
                      onClick={(e) => handlePrevImage(product.id, product.images.length, e)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="bg-white/80 dark:bg-gray-900/80 hover:bg-white dark:hover:bg-gray-900 p-2 rounded-full shadow-lg backdrop-blur-sm transition-colors z-10"
                      aria-label="Previous image"
                    >
                      <FiChevronLeft size={20} className="text-gray-900 dark:text-white" />
                    </motion.button>
                    <motion.button
                      onClick={(e) => handleNextImage(product.id, product.images.length, e)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="bg-white/80 dark:bg-gray-900/80 hover:bg-white dark:hover:bg-gray-900 p-2 rounded-full shadow-lg backdrop-blur-sm transition-colors z-10"
                      aria-label="Next image"
                    >
                      <FiChevronRight size={20} className="text-gray-900 dark:text-white" />
                    </motion.button>
                  </div>

                  {/* Image Indicators */}
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    {product.images.map((_, idx) => (
                      <div
                        key={idx}
                        className={`h-1.5 rounded-full transition-all ${
                          idx === currentImageIndex
                            ? "w-4 bg-white"
                            : "w-1.5 bg-white/50"
                        }`}
                      />
                    ))}
                  </div>

                  {product.badge && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{
                        opacity: 1,
                        x: 0,
                      }}
                      className="absolute top-4 left-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-3 py-1 text-xs font-semibold uppercase tracking-wider z-10"
                    >
                      {product.badge}
                    </motion.span>
                  )}

                  {product.discount && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{
                        opacity: 1,
                        scale: 1,
                      }}
                      className="absolute top-4 right-4 bg-red-600 text-white px-2 py-1 text-xs font-bold rounded-full z-10"
                    >
                      -{product.discount}%
                    </motion.span>
                  )}

                  {/* Quick Actions */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{
                      opacity: hoveredProduct === product.id ? 1 : 0,
                      y: hoveredProduct === product.id ? 0 : 10,
                    }}
                    transition={{ duration: 0.3 }}
                    className="absolute bottom-12 left-0 right-0 flex justify-center space-x-3 px-4"
                  >
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-white dark:bg-gray-900 p-3 rounded-full shadow-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      aria-label="Add to wishlist"
                    >
                      <FiHeart size={18} className="text-gray-900 dark:text-white" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 p-3 rounded-full shadow-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                      aria-label="Quick add to cart"
                    >
                      <FiShoppingBag size={18} />
                    </motion.button>
                  </motion.div>
                </div>

                <div className="p-4 space-y-2">
                  <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    {product.category}
                  </p>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{product.name}</h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      ${product.price.toFixed(2)}
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                        ${product.originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default Products;
