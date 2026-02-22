import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiInfo, FiX } from "react-icons/fi";

/** Admin preset colors (name → hex) for resolving variant colorHex. */
const PRESET_COLOR_HEX = {
  Black: "#000000",
  White: "#FFFFFF",
  Navy: "#1e3a5f",
  Red: "#c41e3a",
  Burgundy: "#800020",
  Gray: "#6b7280",
  Charcoal: "#36454f",
  Beige: "#f5f5dc",
  Brown: "#8b4513",
  Olive: "#808000",
  Blue: "#2563eb",
  "Sky Blue": "#0ea5e9",
  Green: "#16a34a",
  Mustard: "#e4a853",
  Pink: "#ec4899",
  Purple: "#7c3aed",
  Orange: "#ea580c",
  Yellow: "#eab308",
};

const ProductVariants = ({ product, selectedSize, selectedColor, onSizeChange, onColorChange }) => {
  const { sizes: sizeList, colors: colorList } = useMemo(() => {
    const matrix = product?.variantMatrix || [];
    const variantSizes = product?.variants?.size?.length
      ? product.variants.size
      : [...new Set(matrix.map((v) => v.size).filter(Boolean))];
    const variantColors = product?.variants?.color?.length
      ? product.variants.color
      : [...new Set(matrix.map((v) => v.color).filter(Boolean))];
    const sizes = variantSizes.length > 0 ? variantSizes : ["XS", "S", "M", "L", "XL", "XXL", "3XL"];
    const colorMap = new Map();
    (matrix || []).forEach((v) => {
      if (v.color) {
        const hex = v.colorHex || PRESET_COLOR_HEX[v.color] || "#808080";
        if (!colorMap.get(v.color)) colorMap.set(v.color, hex);
      }
    });
    const colors =
      variantColors.length > 0
        ? variantColors.map((name) => ({
            name,
            value: colorMap.get(name) || PRESET_COLOR_HEX[name] || "#808080",
          }))
        : [{ name: "Default", value: "#808080" }];
    return { sizes, colors };
  }, [product]);

  const [showSizeGuide, setShowSizeGuide] = useState(false);

  const stockBySizeColor = useMemo(() => {
    const matrix = product?.variantMatrix || [];
    const map = new Map();
    matrix.forEach((v) => {
      if (v.size) {
        const key = [v.size, (v.color || "").trim()].join("|");
        map.set(key, (map.get(key) || 0) + (Number(v.stock) || 0));
      }
    });
    return map;
  }, [product]);

  const isSizeAvailable = (size) => {
    if (!product?.variantMatrix?.length) return true;
    if (selectedColor) {
      return (stockBySizeColor.get(`${size}|${selectedColor}`) ?? 0) > 0;
    }
    for (const [key, stock] of stockBySizeColor) {
      if (key.startsWith(`${size}|`) && stock > 0) return true;
    }
    return false;
  };

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
            <FiInfo size={14} />
            Size Guide
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {sizeList.map((size) => {
            const isSelected = selectedSize === size;
            const isAvailable = isSizeAvailable(size);
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
          {colorList.map((color) => {
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

      {/* Size Guide Modal: only shows sizes available for this product when product is provided */}
      {showSizeGuide && (
        <SizeGuideModal
          availableSizes={product ? sizeList : null}
          onClose={() => setShowSizeGuide(false)}
        />
      )}
    </div>
  );
};

/** Full size guide table (matches admin sizes: XS–3XL). */
const FULL_SIZE_GUIDE = [
  { size: "XS", chest: "34-36", waist: "28-30", length: "26" },
  { size: "S", chest: "36-38", waist: "30-32", length: "27" },
  { size: "M", chest: "38-40", waist: "32-34", length: "28" },
  { size: "L", chest: "40-42", waist: "34-36", length: "29" },
  { size: "XL", chest: "42-44", waist: "36-38", length: "30" },
  { size: "XXL", chest: "44-46", waist: "38-40", length: "31" },
  { size: "3XL", chest: "46-48", waist: "40-42", length: "32" },
];

const SizeGuideModal = ({ availableSizes, onClose }) => {
  const sizeGuideData =
    Array.isArray(availableSizes) && availableSizes.length > 0
      ? FULL_SIZE_GUIDE.filter((row) => availableSizes.includes(row.size))
      : FULL_SIZE_GUIDE;

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
