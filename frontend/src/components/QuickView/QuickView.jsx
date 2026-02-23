import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiHeart, FiShoppingBag } from "react-icons/fi";
import ImageGallery from "../ImageGallery";
import ProductVariants from "../ProductVariants";
import toast from "react-hot-toast";
import { getDisplayCategory, hasDiscount } from "../../utils/productUtils";

const QuickView = ({ product, isOpen, onClose, onAddToCart, onAddToWishlist }) => {
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error("Please select a size");
      return;
    }
    onAddToCart({ product, size: selectedSize, color: selectedColor, quantity });
    toast.success(`${quantity} ${product.name} added to cart!`);
    onClose();
  };

  const handleAddToWishlist = () => {
    onAddToWishlist(product);
    toast.success("Added to wishlist!");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-6xl md:max-h-[90vh] z-50 overflow-hidden rounded-xl"
            style={{ backgroundColor: "var(--bg-primary)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col h-full max-h-[90vh]">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b flex-shrink-0" style={{ borderColor: "var(--border-primary)" }}>
                <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                  Quick View
                </h2>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-2 rounded-lg transition-colors"
                  style={{ color: "var(--text-secondary)" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--bg-secondary)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <FiX size={24} />
                </motion.button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
                  {/* Image Gallery */}
                  <div className="flex-shrink-0">
                    <ImageGallery images={product.images} productName={product.name} />
                  </div>

                  {/* Product Info */}
                  <div className="space-y-6">
                    <div>
                      <p className="text-sm uppercase tracking-wider mb-2" style={{ color: "var(--text-tertiary)" }}>
                        {getDisplayCategory(product)}
                      </p>
                      <h1 className="text-3xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>
                        {product.name}
                      </h1>
                      <div className="flex flex-col gap-1 mb-4">
                        <span className="text-3xl font-bold" style={{ color: "var(--color-primary)" }}>
                          ৳{(product.price ?? 0).toFixed(2)}
                        </span>
                        {hasDiscount(product) && product.originalPrice != null && (
                          <>
                            <span className="text-xl line-through" style={{ color: "var(--text-tertiary)" }}>
                              ৳{product.originalPrice.toFixed(2)}
                            </span>
                            <span className="px-3 py-1 text-sm font-semibold text-white rounded w-fit" style={{ backgroundColor: "var(--color-tertiary)" }}>
                              Save ৳{((product.originalPrice ?? 0) - (product.price ?? 0)).toFixed(2)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Variants */}
                    <ProductVariants
                      selectedSize={selectedSize}
                      selectedColor={selectedColor}
                      onSizeChange={setSelectedSize}
                      onColorChange={setSelectedColor}
                    />

                    {/* Quantity */}
                    <div>
                      <label className="block text-sm font-semibold mb-3 uppercase tracking-wider" style={{ color: "var(--text-primary)" }}>
                        Quantity
                      </label>
                      <div className="flex items-center gap-4">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="w-10 h-10 flex items-center justify-center border-2 rounded-lg transition-colors"
                          style={{ borderColor: "var(--border-primary)" }}
                        >
                          <span style={{ color: "var(--text-primary)" }}>-</span>
                        </motion.button>
                        <span className="text-lg font-semibold w-12 text-center" style={{ color: "var(--text-primary)" }}>
                          {quantity}
                        </span>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setQuantity(quantity + 1)}
                          className="w-10 h-10 flex items-center justify-center border-2 rounded-lg transition-colors"
                          style={{ borderColor: "var(--border-primary)" }}
                        >
                          <span style={{ color: "var(--text-primary)" }}>+</span>
                        </motion.button>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4 pt-4">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleAddToCart}
                        className="flex-1 px-8 py-4 text-white font-semibold uppercase tracking-wider rounded-lg flex items-center justify-center gap-2"
                        style={{ backgroundColor: "var(--color-primary)" }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "var(--active-color)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "var(--color-primary)";
                        }}
                      >
                        <FiShoppingBag size={20} />
                        Add to Cart
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handleAddToWishlist}
                        className="px-8 py-4 border-2 rounded-lg flex items-center justify-center"
                        style={{
                          borderColor: "var(--border-primary)",
                          color: "var(--text-primary)",
                        }}
                      >
                        <FiHeart size={20} />
                      </motion.button>
                    </div>

                    {/* Description */}
                    {product.description && (
                      <div className="pt-6 border-t" style={{ borderColor: "var(--border-primary)" }}>
                        <h3 className="text-lg font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
                          Description
                        </h3>
                        <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                          {product.description}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default QuickView;
