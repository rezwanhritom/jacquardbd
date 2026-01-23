import { useState } from "react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { FiHeart, FiShoppingBag, FiChevronLeft, FiChevronRight, FiEye } from "react-icons/fi";

const ProductCard = ({ product, index = 0, viewMode = "grid", onQuickView }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const nextImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onQuickView) {
      onQuickView(product);
    }
  };

  if (viewMode === "list") {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
        className="group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Link to={`/product/${product.id}`}>
          <div className="flex gap-6 p-6 rounded-lg" style={{ backgroundColor: "var(--bg-secondary)" }}>
            <div className="relative overflow-hidden w-48 h-64 flex-shrink-0 rounded-lg" style={{ backgroundColor: "var(--bg-tertiary)" }}>
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentImageIndex}
                  src={product.images[currentImageIndex]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </AnimatePresence>
              {product.badge && (
                <motion.span
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute top-4 left-4 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white z-10"
                  style={{ backgroundColor: "var(--color-primary)" }}
                >
                  {product.badge}
                </motion.span>
              )}
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <p className="text-xs uppercase tracking-wider mb-1" style={{ color: "var(--text-tertiary)" }}>
                  {product.category}
                </p>
                <h3 className="text-2xl font-semibold mb-2 group-hover:underline" style={{ color: "var(--text-primary)" }}>
                  {product.name}
                </h3>
                {product.description && (
                  <p className="text-sm line-clamp-2" style={{ color: "var(--text-secondary)" }}>
                    {product.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-4">
                <span className="text-2xl font-bold" style={{ color: "var(--color-primary)" }}>
                  ${product.price.toFixed(2)}
                </span>
                {product.originalPrice && (
                  <span className="text-lg line-through" style={{ color: "var(--text-tertiary)" }}>
                    ${product.originalPrice.toFixed(2)}
                  </span>
                )}
              </div>
              <div className="flex gap-3 pt-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  className="px-6 py-2.5 border rounded-lg text-sm font-semibold uppercase tracking-wider"
                  style={{
                    borderColor: "var(--border-primary)",
                    color: "var(--text-primary)",
                  }}
                >
                  <FiHeart size={16} className="inline mr-2" />
                  Wishlist
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  className="px-6 py-2.5 rounded-lg text-sm font-semibold uppercase tracking-wider text-white"
                  style={{ backgroundColor: "var(--color-primary)" }}
                >
                  <FiShoppingBag size={16} className="inline mr-2" />
                  Add to Cart
                </motion.button>
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/product/${product.id}`}>
        <div className="space-y-4">
          {/* Image Container */}
          <div className="relative overflow-hidden aspect-[3/4] rounded-lg" style={{ backgroundColor: "var(--bg-tertiary)" }}>
            <AnimatePresence mode="wait">
              <motion.img
                key={currentImageIndex}
                src={product.images[currentImageIndex]}
                alt={product.name}
                className="w-full h-full object-cover"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={{ scale: 1.05 }}
              />
            </AnimatePresence>

            {/* Badges */}
            {product.badge && (
              <motion.span
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute top-4 left-4 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white z-10"
                style={{ backgroundColor: "var(--color-primary)" }}
              >
                {product.badge}
              </motion.span>
            )}

            {product.discount && (
              <motion.span
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute top-4 right-4 px-3 py-1 text-xs font-bold text-white rounded-full z-10"
                style={{ backgroundColor: "var(--color-tertiary)" }}
              >
                -{product.discount}%
              </motion.span>
            )}

            {/* Image Navigation (visible on hover) */}
            {product.images.length > 1 && (
              <AnimatePresence>
                {isHovered && (
                  <>
                    <motion.button
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full backdrop-blur-sm z-10"
                      style={{ backgroundColor: "rgba(255, 255, 255, 0.9)" }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <FiChevronLeft size={18} style={{ color: "var(--text-primary)" }} />
                    </motion.button>
                    <motion.button
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full backdrop-blur-sm z-10"
                      style={{ backgroundColor: "rgba(255, 255, 255, 0.9)" }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <FiChevronRight size={18} style={{ color: "var(--text-primary)" }} />
                    </motion.button>
                  </>
                )}
              </AnimatePresence>
            )}

            {/* Image Indicators */}
            {product.images.length > 1 && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                {product.images.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1.5 rounded-full transition-all ${
                      idx === currentImageIndex ? "w-4" : "w-1.5"
                    }`}
                    style={{
                      backgroundColor:
                        idx === currentImageIndex
                          ? "var(--color-primary)"
                          : "rgba(255, 255, 255, 0.5)",
                    }}
                  />
                ))}
              </div>
            )}

            {/* Quick Actions (visible on hover) */}
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ delay: 0.1 }}
                  className="absolute bottom-12 left-0 right-0 flex justify-center gap-3 px-4"
                >
                  {onQuickView && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleQuickView}
                      className="p-3 rounded-full shadow-lg backdrop-blur-sm"
                      style={{ backgroundColor: "rgba(255, 255, 255, 0.9)" }}
                      title="Quick View"
                    >
                      <FiEye size={18} style={{ color: "var(--color-primary)" }} />
                    </motion.button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    className="p-3 rounded-full shadow-lg backdrop-blur-sm"
                    style={{ backgroundColor: "rgba(255, 255, 255, 0.9)" }}
                  >
                    <FiHeart size={18} style={{ color: "var(--color-primary)" }} />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    className="p-3 rounded-full shadow-lg text-white"
                    style={{ backgroundColor: "var(--color-primary)" }}
                  >
                    <FiShoppingBag size={18} />
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Product Info */}
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
              {product.category}
            </p>
            <h3 className="font-semibold text-lg group-hover:underline transition-all" style={{ color: "var(--text-primary)" }}>
              {product.name}
            </h3>
            <div className="flex items-center gap-3">
              <span className="text-xl font-bold" style={{ color: "var(--color-primary)" }}>
                ${product.price.toFixed(2)}
              </span>
              {product.originalPrice && (
                <span className="text-sm line-through" style={{ color: "var(--text-tertiary)" }}>
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
