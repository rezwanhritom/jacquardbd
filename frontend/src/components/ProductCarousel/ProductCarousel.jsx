import { useState, useRef } from "react";
import { Link } from "react-router";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "../../utils/animations";
import { FiChevronLeft, FiChevronRight, FiShoppingBag, FiHeart } from "react-icons/fi";
import { hasDiscount } from "../../utils/productUtils";

const ProductCarousel = ({ title, subtitle, products, showViewAll = true, compact = false }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef(null);

  const scroll = (direction) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = 400;
    const newIndex = direction === "next" 
      ? Math.min(currentIndex + 1, products.length - 1)
      : Math.max(currentIndex - 1, 0);
    
    container.scrollTo({
      left: newIndex * scrollAmount,
      behavior: "smooth",
    });
    setCurrentIndex(newIndex);
  };

  const canScrollPrev = currentIndex > 0;
  const canScrollNext = currentIndex < products.length - 3;

  return (
    <section
      className={`px-4 sm:px-6 lg:px-8 transition-colors duration-300 ${compact ? "py-6" : "py-20"}`}
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      <div className="max-w-7xl mx-auto">
        {!compact && (
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
            className="flex items-center justify-between mb-12"
          >
            <motion.div variants={fadeInUp}>
              <h2 className="text-4xl md:text-5xl font-bold mb-3" style={{ color: "var(--color-primary)" }}>
                {title}
              </h2>
              {subtitle && (
                <p className="text-lg" style={{ color: "var(--text-secondary)" }}>
                  {subtitle}
                </p>
              )}
            </motion.div>
            {showViewAll && (
              <motion.div variants={fadeInUp}>
                <Link
                  to="/collection/new-arrivals"
                  className="text-sm uppercase tracking-wider font-semibold flex items-center gap-2 transition-colors"
                  style={{ color: "var(--color-primary)" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "var(--active-color)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "var(--color-primary)";
                  }}
                >
                  View All
                  <FiChevronRight size={16} />
                </Link>
              </motion.div>
            )}
          </motion.div>
        )}

        <div className="relative">
          {/* Navigation Buttons */}
          {canScrollPrev && (
            <button
              type="button"
              onClick={() => scroll("prev")}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-10 w-10 h-10 flex items-center justify-center border-0 outline-none focus:outline-none focus:ring-0 bg-transparent opacity-50 hover:opacity-90 transition-opacity"
              style={{
                color: "var(--text-primary)",
                filter: "drop-shadow(0 1px 2px rgba(255,255,255,0.6)) drop-shadow(0 1px 3px rgba(0,0,0,0.4))",
              }}
              aria-label="Previous"
            >
              <FiChevronLeft size={20} />
            </button>
          )}

          {canScrollNext && (
            <button
              type="button"
              onClick={() => scroll("next")}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-10 w-10 h-10 flex items-center justify-center border-0 outline-none focus:outline-none focus:ring-0 bg-transparent opacity-50 hover:opacity-90 transition-opacity"
              style={{
                color: "var(--text-primary)",
                filter: "drop-shadow(0 1px 2px rgba(255,255,255,0.6)) drop-shadow(0 1px 3px rgba(0,0,0,0.4))",
              }}
              aria-label="Next"
            >
              <FiChevronRight size={20} />
            </button>
          )}

          {/* Product Grid */}
          <div
            ref={scrollContainerRef}
            className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex-shrink-0 w-72 group snap-start"
              >
                <Link to={`/product/${product.id}`}>
                  <div className="space-y-4">
                    <div className="relative overflow-hidden aspect-[3/4] rounded-lg" style={{ backgroundColor: "var(--bg-tertiary)" }}>
                      <motion.img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.4 }}
                      />
                      {product.badge && (
                        <motion.span
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="absolute top-4 left-4 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white"
                          style={{ backgroundColor: "var(--color-primary)" }}
                        >
                          {product.badge}
                        </motion.span>
                      )}
                      {hasDiscount(product) && (
                        <motion.span
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="absolute top-4 right-4 px-3 py-1 text-xs font-bold text-white rounded-full"
                          style={{ backgroundColor: "var(--color-tertiary)" }}
                        >
                          -{product.discount}%
                        </motion.span>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="flex gap-3">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-3 rounded-full text-white backdrop-blur-sm"
                            style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                          >
                            <FiHeart size={18} />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-3 rounded-full text-white"
                            style={{ backgroundColor: "var(--color-primary)" }}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                          >
                            <FiShoppingBag size={18} />
                          </motion.button>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg" style={{ color: "var(--text-primary)" }}>
                        {product.name}
                      </h3>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xl font-bold" style={{ color: "var(--color-primary)" }}>
                          ৳{(product.price ?? 0).toFixed(2)}
                        </span>
                        {hasDiscount(product) && product.originalPrice != null && (
                          <span className="text-sm line-through" style={{ color: "var(--text-tertiary)" }}>
                            ৳{product.originalPrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductCarousel;
