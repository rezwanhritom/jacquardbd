import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiRuler, FiX } from "react-icons/fi";

const ProductVariants = ({ selectedSize, selectedColor, onSizeChange, onColorChange }) => {
  const sizes = ["XS", "S", "M", "L", "XL", "XXL"];
  const colors = [
    { name: "Black", value: "#000000" },
    { name: "White", value: "#FFFFFF" },
    { name: "Navy", value: "#000080" },
    { name: "Gray", value: "#808080" },
    { name: "Beige", value: "#F5F5DC" },
  ];

  const [showSizeGuide, setShowSizeGuide] = useState(false);

  return (
    <div className="space-y-6">
      {/* Size Selection */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--text-primary)" }}>
            Size
          </label>
          <button
            onClick={() => setShowSizeGuide(!showSizeGuide)}
            className="text-xs flex items-center gap-1 transition-colors"
            style={{ color: "var(--color-primary)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--active-color)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--color-primary)";
            }}
          >
            <FiRuler size={14} />
            Size Guide
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {sizes.map((size) => {
            const isSelected = selectedSize === size;
            const isAvailable = true; // In real app, check product.stock[size]
            return (
              <motion.button
                key={size}
                whileHover={{ scale: isAvailable ? 1.05 : 1 }}
                whileTap={{ scale: isAvailable ? 0.95 : 1 }}
                onClick={() => isAvailable && onSizeChange(size)}
                disabled={!isAvailable}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isSelected ? "text-white" : ""
                } ${!isAvailable ? "opacity-50 cursor-not-allowed" : ""}`}
                style={{
                  backgroundColor: isSelected
                    ? "var(--color-primary)"
                    : "var(--bg-secondary)",
                  color: isSelected
                    ? "white"
                    : "var(--text-secondary)",
                  border: isSelected
                    ? "2px solid var(--color-primary)"
                    : "2px solid transparent",
                }}
                onFocus={(e) => {
                  if (isAvailable) {
                    e.currentTarget.style.outline = "2px solid var(--color-primary)";
                    e.currentTarget.style.outlineOffset = "2px";
                  }
                }}
                onBlur={(e) => {
                  e.currentTarget.style.outline = "none";
                }}
                aria-label={`Select size ${size}`}
                aria-pressed={isSelected}
              >
                {size}
              </motion.button>
            );
          })}
        </div>
        {!selectedSize && (
          <p className="text-xs mt-2" style={{ color: "var(--text-tertiary)" }}>
            Please select a size
          </p>
        )}
      </div>

      {/* Color Selection */}
      <div>
        <label className="text-sm font-semibold uppercase tracking-wider mb-3 block" style={{ color: "var(--text-primary)" }}>
          Color
        </label>
        <div className="flex flex-wrap gap-3">
          {colors.map((color) => {
            const isSelected = selectedColor === color.name;
            return (
              <motion.button
                key={color.name}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onColorChange(color.name)}
                className="relative"
                title={color.name}
                onFocus={(e) => {
                  e.currentTarget.style.outline = "2px solid var(--color-primary)";
                  e.currentTarget.style.outlineOffset = "2px";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.outline = "none";
                }}
                aria-label={`Select color ${color.name}`}
                aria-pressed={isSelected}
              >
                <div
                  className="w-12 h-12 rounded-full border-2 transition-all"
                  style={{
                    backgroundColor: color.value,
                    borderColor: isSelected
                      ? "var(--color-primary)"
                      : "var(--border-primary)",
                    borderWidth: isSelected ? "3px" : "2px",
                  }}
                />
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <div className="w-4 h-4 rounded-full bg-white" />
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Size Guide Modal */}
      {showSizeGuide && (
        <SizeGuideModal onClose={() => setShowSizeGuide(false)} />
      )}
    </div>
  );
};

const SizeGuideModal = ({ onClose }) => {
  const sizeGuideData = [
    { size: "XS", chest: "34-36", waist: "28-30", length: "26" },
    { size: "S", chest: "36-38", waist: "30-32", length: "27" },
    { size: "M", chest: "38-40", waist: "32-34", length: "28" },
    { size: "L", chest: "40-42", waist: "34-36", length: "29" },
    { size: "XL", chest: "42-44", waist: "36-38", length: "30" },
    { size: "XXL", chest: "44-46", waist: "38-40", length: "31" },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-2xl rounded-xl p-6 z-10"
          style={{ backgroundColor: "var(--bg-primary)" }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
              Size Guide
            </h3>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 rounded-lg"
              style={{ color: "var(--text-secondary)" }}
            >
              <FiX size={24} />
            </motion.button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b" style={{ borderColor: "var(--border-primary)" }}>
                  <th className="text-left py-3 px-4 font-semibold" style={{ color: "var(--text-primary)" }}>Size</th>
                  <th className="text-left py-3 px-4 font-semibold" style={{ color: "var(--text-primary)" }}>Chest (inches)</th>
                  <th className="text-left py-3 px-4 font-semibold" style={{ color: "var(--text-primary)" }}>Waist (inches)</th>
                  <th className="text-left py-3 px-4 font-semibold" style={{ color: "var(--text-primary)" }}>Length (inches)</th>
                </tr>
              </thead>
              <tbody>
                {sizeGuideData.map((row) => (
                  <tr key={row.size} className="border-b" style={{ borderColor: "var(--border-primary)" }}>
                    <td className="py-3 px-4 font-semibold" style={{ color: "var(--text-primary)" }}>{row.size}</td>
                    <td className="py-3 px-4" style={{ color: "var(--text-secondary)" }}>{row.chest}</td>
                    <td className="py-3 px-4" style={{ color: "var(--text-secondary)" }}>{row.waist}</td>
                    <td className="py-3 px-4" style={{ color: "var(--text-secondary)" }}>{row.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ProductVariants;
