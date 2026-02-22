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
    <section className="py-20 px-4 sm:px-6 lg:px-8 transition-colors duration-300" style={{ backgroundColor: "var(--bg-secondary)" }}>
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
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{ color: "var(--color-primary)" }}
          >
            Featured Products
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="max-w-2xl mx-auto"
            style={{ color: "var(--text-secondary)" }}
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
                className="group cursor-pointer"
                style={{ backgroundColor: "var(--bg-primary)" }}
                onMouseEnter={() => setHoveredProduct(product.id)}
                onMouseLeave={() => setHoveredProduct(null)}
              >
                <div className="relative overflow-hidden aspect-[3/4]" style={{ backgroundColor: "var(--bg-tertiary)" }}>
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
                      className="p-2 rounded-full shadow-lg backdrop-blur-sm transition-colors z-10"
                      style={{ backgroundColor: "var(--bg-primary)", opacity: 0.8 }}
                      onMouseEnter={(e) => e.target.style.opacity = "1"}
                      onMouseLeave={(e) => e.target.style.opacity = "0.8"}
                      aria-label="Previous image"
                    >
                      <FiChevronLeft size={20} style={{ color: "var(--text-primary)" }} />
                    </motion.button>
                    <motion.button
                      onClick={(e) => handleNextImage(product.id, product.images.length, e)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 rounded-full shadow-lg backdrop-blur-sm transition-colors z-10"
                      style={{ backgroundColor: "var(--bg-primary)", opacity: 0.8 }}
                      onMouseEnter={(e) => e.target.style.opacity = "1"}
                      onMouseLeave={(e) => e.target.style.opacity = "0.8"}
                      aria-label="Next image"
                    >
                      <FiChevronRight size={20} style={{ color: "var(--text-primary)" }} />
                    </motion.button>
                  </div>

                  {/* Image Indicators */}
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    {product.images.map((_, idx) => (
                      <div
                        key={idx}
                        className={`h-1.5 rounded-full transition-all ${
                          idx === currentImageIndex ? "w-4" : "w-1.5"
                        }`}
                        style={{
                          backgroundColor: idx === currentImageIndex 
                            ? "var(--color-primary)" 
                            : "rgba(255, 255, 255, 0.5)"
                        }}
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
                      className="absolute top-4 left-4 px-3 py-1 text-xs font-semibold uppercase tracking-wider z-10 text-white"
                      style={{ backgroundColor: "var(--color-primary)" }}
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
                      className="absolute top-4 right-4 text-white px-2 py-1 text-xs font-bold rounded-full z-10"
                      style={{ backgroundColor: "var(--color-tertiary)" }}
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
                      className="p-3 rounded-full shadow-lg transition-colors"
                      style={{ backgroundColor: "var(--bg-primary)" }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = "var(--hover-bg)"}
                      onMouseLeave={(e) => e.target.style.backgroundColor = "var(--bg-primary)"}
                      aria-label="Add to wishlist"
                    >
                      <FiHeart size={18} style={{ color: "var(--color-primary)" }} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-3 rounded-full shadow-lg transition-colors text-white"
                      style={{ backgroundColor: "var(--color-primary)" }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = "var(--active-color)"}
                      onMouseLeave={(e) => e.target.style.backgroundColor = "var(--color-primary)"}
                      aria-label="Quick add to cart"
                    >
                      <FiShoppingBag size={18} />
                    </motion.button>
                  </motion.div>
                </div>

                <div className="p-4 space-y-2">
                  <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>{product.name}</h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold" style={{ color: "var(--color-primary)" }}>
                      ${product.price.toFixed(2)}
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm line-through" style={{ color: "var(--text-tertiary)" }}>
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
