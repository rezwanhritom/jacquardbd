import { useState } from "react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { FiHeart, FiShoppingBag, FiChevronLeft, FiChevronRight, FiEye } from "react-icons/fi";
import toast from "react-hot-toast";
import { getDisplayCategory } from "../../utils/productUtils";

const ProductCard = ({ product, index = 0, viewMode = "grid", onQuickView }) => {
  const displayCategory = getDisplayCategory(product);
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

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toast.success("Added to wishlist!");
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toast.success("Added to cart!");
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
        <Link
          to={`/product/${product.slug != null && product.slug !== "" ? product.slug : product.id}`}
          className="block"
          aria-label={`View ${product.name} details`}
        >
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
                  {displayCategory}
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
              <div className="flex items-center gap-4 flex-wrap">
                <span className="text-2xl font-bold" style={{ color: "var(--color-primary)" }}>
                  ${(product.price ?? 0).toFixed(2)}
                </span>
                {product.originalPrice != null && product.originalPrice > (product.price ?? 0) && (
                  <span className="text-lg line-through" style={{ color: "var(--text-tertiary)" }}>
                    ${product.originalPrice.toFixed(2)}
                  </span>
                )}
                {product.discount != null && product.discount > 0 && (
                  <span className="text-sm font-semibold px-2 py-0.5 rounded" style={{ backgroundColor: "var(--color-tertiary)", color: "white" }}>
                    -{product.discount}%
                  </span>
                )}
              </div>
              <div className="flex gap-3 pt-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleWishlist}
                  className="px-6 py-2.5 border-2 rounded-lg text-sm font-semibold uppercase tracking-wider transition-colors"
                  style={{
                    borderColor: "var(--border-primary)",
                    color: "var(--text-primary)",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.outline = "2px solid var(--color-primary)";
                    e.currentTarget.style.outlineOffset = "2px";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.outline = "none";
                  }}
                  aria-label={`Add ${product.name} to wishlist`}
                >
                  <FiHeart size={16} className="inline mr-2" />
                  Wishlist
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAddToCart}
                  className="px-6 py-2.5 rounded-lg text-sm font-semibold uppercase tracking-wider text-white transition-colors"
                  style={{ backgroundColor: "var(--color-primary)" }}
                  onFocus={(e) => {
                    e.currentTarget.style.outline = "2px solid var(--color-primary)";
                    e.currentTarget.style.outlineOffset = "2px";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.outline = "none";
                  }}
                  aria-label={`Add ${product.name} to cart`}
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
      <Link
        to={`/product/${product.slug != null && product.slug !== "" ? product.slug : product.id}`}
        className="block"
        aria-label={`View ${product.name} details`}
      >
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
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full backdrop-blur-sm z-10 transition-all"
                      style={{ backgroundColor: "rgba(255, 255, 255, 0.9)" }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onFocus={(e) => {
                        e.currentTarget.style.outline = "2px solid var(--color-primary)";
                        e.currentTarget.style.outlineOffset = "2px";
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.outline = "none";
                      }}
                      aria-label="Previous image"
                    >
                      <FiChevronLeft size={18} style={{ color: "var(--text-primary)" }} />
                    </motion.button>
                    <motion.button
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full backdrop-blur-sm z-10 transition-all"
                      style={{ backgroundColor: "rgba(255, 255, 255, 0.9)" }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onFocus={(e) => {
                        e.currentTarget.style.outline = "2px solid var(--color-primary)";
                        e.currentTarget.style.outlineOffset = "2px";
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.outline = "none";
                      }}
                      aria-label="Next image"
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
                    aria-hidden="true"
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
                      className="p-3 rounded-full shadow-lg backdrop-blur-sm transition-all"
                      style={{ backgroundColor: "rgba(255, 255, 255, 0.9)" }}
                      onFocus={(e) => {
                        e.currentTarget.style.outline = "2px solid var(--color-primary)";
                        e.currentTarget.style.outlineOffset = "2px";
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.outline = "none";
                      }}
                      aria-label={`Quick view ${product.name}`}
                      title="Quick View"
                    >
                      <FiEye size={18} style={{ color: "var(--color-primary)" }} />
                    </motion.button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleWishlist}
                    className="p-3 rounded-full shadow-lg backdrop-blur-sm transition-all"
                    style={{ backgroundColor: "rgba(255, 255, 255, 0.9)" }}
                    onFocus={(e) => {
                      e.currentTarget.style.outline = "2px solid var(--color-primary)";
                      e.currentTarget.style.outlineOffset = "2px";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.outline = "none";
                    }}
                    aria-label={`Add ${product.name} to wishlist`}
                    title="Add to Wishlist"
                  >
                    <FiHeart size={18} style={{ color: "var(--color-primary)" }} />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAddToCart}
                    className="p-3 rounded-full shadow-lg text-white transition-all"
                    style={{ backgroundColor: "var(--color-primary)" }}
                    onFocus={(e) => {
                      e.currentTarget.style.outline = "2px solid white";
                      e.currentTarget.style.outlineOffset = "2px";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.outline = "none";
                    }}
                    aria-label={`Add ${product.name} to cart`}
                    title="Add to Cart"
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
              {displayCategory}
            </p>
            <h3 className="font-semibold text-lg group-hover:underline transition-all" style={{ color: "var(--text-primary)" }}>
              {product.name}
            </h3>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xl font-bold" style={{ color: "var(--color-primary)" }}>
                ${(product.price ?? 0).toFixed(2)}
              </span>
              {product.originalPrice != null && product.originalPrice > (product.price ?? 0) && (
                <span className="text-sm line-through" style={{ color: "var(--text-tertiary)" }}>
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
              {product.discount != null && product.discount > 0 && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded" style={{ backgroundColor: "var(--color-tertiary)", color: "white" }}>
                  -{product.discount}%
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
