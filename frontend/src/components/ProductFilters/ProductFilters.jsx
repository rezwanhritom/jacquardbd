import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronDown, FiX } from "react-icons/fi";

const ProductFilters = ({ filters, onFilterChange, onClearFilters }) => {
  const [openSections, setOpenSections] = useState({
    price: true,
    size: true,
    color: true,
  });

  const toggleSection = (section) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handlePriceChange = (min, max) => {
    onFilterChange({ ...filters, priceRange: { min, max } });
  };

  const handleSizeToggle = (size) => {
    const sizes = filters.sizes || [];
    const newSizes = sizes.includes(size)
      ? sizes.filter((s) => s !== size)
      : [...sizes, size];
    onFilterChange({ ...filters, sizes: newSizes });
  };

  const handleColorToggle = (color) => {
    const colors = filters.colors || [];
    const newColors = colors.includes(color)
      ? colors.filter((c) => c !== color)
      : [...colors, color];
    onFilterChange({ ...filters, colors: newColors });
  };

  const sizes = ["XS", "S", "M", "L", "XL", "XXL"];
  const colors = [
    { name: "Black", value: "#000000" },
    { name: "White", value: "#FFFFFF" },
    { name: "Gray", value: "#808080" },
    { name: "Navy", value: "#000080" },
    { name: "Beige", value: "#F5F5DC" },
    { name: "Brown", value: "#8B4513" },
  ];

  const hasActiveFilters =
    (filters.sizes && filters.sizes.length > 0) ||
    (filters.colors && filters.colors.length > 0) ||
    (filters.priceRange && (filters.priceRange.min > 0 || filters.priceRange.max < 1000));

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6 p-6 rounded-lg"
      style={{ backgroundColor: "var(--bg-secondary)" }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
          Filters
        </h3>
        {hasActiveFilters && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClearFilters}
            className="text-sm flex items-center gap-2"
            style={{ color: "var(--color-primary)" }}
          >
            <FiX size={16} />
            Clear All
          </motion.button>
        )}
      </div>

      {/* Price Range */}
      <div className="border-b pb-6" style={{ borderColor: "var(--border-primary)" }}>
        <button
          onClick={() => toggleSection("price")}
          className="w-full flex items-center justify-between mb-4 transition-colors"
          onFocus={(e) => {
            e.currentTarget.style.outline = "2px solid var(--color-primary)";
            e.currentTarget.style.outlineOffset = "2px";
          }}
          onBlur={(e) => {
            e.currentTarget.style.outline = "none";
          }}
          aria-expanded={openSections.price}
          aria-controls="price-filter-section"
        >
          <h4 className="font-semibold" style={{ color: "var(--text-primary)" }}>
            Price
          </h4>
          <motion.div
            animate={{ rotate: openSections.price ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <FiChevronDown size={18} style={{ color: "var(--text-secondary)" }} />
          </motion.div>
        </button>
        <AnimatePresence>
          {openSections.price && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.priceRange?.min || ""}
                    onChange={(e) =>
                      handlePriceChange(
                        parseFloat(e.target.value) || 0,
                        filters.priceRange?.max || 1000
                      )
                    }
                    className="w-full px-4 py-2 border rounded-lg outline-none transition-colors"
                    style={{
                      borderColor: "var(--border-primary)",
                      backgroundColor: "var(--bg-primary)",
                      color: "var(--text-primary)",
                    }}
                  />
                  <span style={{ color: "var(--text-secondary)" }}>to</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.priceRange?.max || ""}
                    onChange={(e) =>
                      handlePriceChange(
                        filters.priceRange?.min || 0,
                        parseFloat(e.target.value) || 1000
                      )
                    }
                    className="w-full px-4 py-2 border rounded-lg outline-none transition-colors"
                    style={{
                      borderColor: "var(--border-primary)",
                      backgroundColor: "var(--bg-primary)",
                      color: "var(--text-primary)",
                    }}
                  />
                </div>
                <div className="flex gap-2">
                  {[
                    { label: "৳0-৳50", min: 0, max: 50 },
                    { label: "৳50-৳100", min: 50, max: 100 },
                    { label: "৳100-৳200", min: 100, max: 200 },
                    { label: "৳200+", min: 200, max: 1000 },
                  ].map((range) => (
                    <motion.button
                      key={range.label}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handlePriceChange(range.min, range.max)}
                      className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                        filters.priceRange?.min === range.min &&
                        filters.priceRange?.max === range.max
                          ? "text-white"
                          : ""
                      }`}
                      style={{
                        backgroundColor:
                          filters.priceRange?.min === range.min &&
                          filters.priceRange?.max === range.max
                            ? "var(--color-primary)"
                            : "var(--bg-secondary)",
                        color:
                          filters.priceRange?.min === range.min &&
                          filters.priceRange?.max === range.max
                            ? "white"
                            : "var(--text-secondary)",
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.outline = "2px solid var(--color-primary)";
                        e.currentTarget.style.outlineOffset = "2px";
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.outline = "none";
                      }}
                      aria-pressed={
                        filters.priceRange?.min === range.min &&
                        filters.priceRange?.max === range.max
                      }
                    >
                      {range.label}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Size */}
      <div className="border-b pb-6" style={{ borderColor: "var(--border-primary)" }}>
        <button
          onClick={() => toggleSection("size")}
          className="w-full flex items-center justify-between mb-4 transition-colors"
          onFocus={(e) => {
            e.currentTarget.style.outline = "2px solid var(--color-primary)";
            e.currentTarget.style.outlineOffset = "2px";
          }}
          onBlur={(e) => {
            e.currentTarget.style.outline = "none";
          }}
          aria-expanded={openSections.size}
          aria-controls="size-filter-section"
        >
          <h4 className="font-semibold" style={{ color: "var(--text-primary)" }}>
            Size
          </h4>
          <motion.div
            animate={{ rotate: openSections.size ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <FiChevronDown size={18} style={{ color: "var(--text-secondary)" }} />
          </motion.div>
        </button>
        <AnimatePresence>
          {openSections.size && (
            <motion.div
              id="size-filter-section"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => {
                  const isSelected = filters.sizes?.includes(size);
                  return (
                    <motion.button
                      key={size}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleSizeToggle(size)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isSelected ? "text-white" : ""
                      }`}
                      style={{
                        backgroundColor: isSelected
                          ? "var(--color-primary)"
                          : "var(--bg-secondary)",
                        color: isSelected ? "white" : "var(--text-secondary)",
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.outline = "2px solid var(--color-primary)";
                        e.currentTarget.style.outlineOffset = "2px";
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.outline = "none";
                      }}
                      aria-pressed={isSelected}
                      aria-label={`Filter by size ${size}`}
                    >
                      {size}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Color */}
      <div className="border-b pb-6" style={{ borderColor: "var(--border-primary)" }}>
        <button
          onClick={() => toggleSection("color")}
          className="w-full flex items-center justify-between mb-4 transition-colors"
          onFocus={(e) => {
            e.currentTarget.style.outline = "2px solid var(--color-primary)";
            e.currentTarget.style.outlineOffset = "2px";
          }}
          onBlur={(e) => {
            e.currentTarget.style.outline = "none";
          }}
          aria-expanded={openSections.color}
          aria-controls="color-filter-section"
        >
          <h4 className="font-semibold" style={{ color: "var(--text-primary)" }}>
            Color
          </h4>
          <motion.div
            animate={{ rotate: openSections.color ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <FiChevronDown size={18} style={{ color: "var(--text-secondary)" }} />
          </motion.div>
        </button>
        <AnimatePresence>
          {openSections.color && (
            <motion.div
              id="color-filter-section"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="flex flex-wrap gap-3">
                {colors.map((color) => {
                  const isSelected = filters.colors?.includes(color.name);
                  return (
                    <motion.button
                      key={color.name}
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleColorToggle(color.name)}
                      className="relative"
                      title={color.name}
                      onFocus={(e) => {
                        e.currentTarget.style.outline = "2px solid var(--color-primary)";
                        e.currentTarget.style.outlineOffset = "2px";
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.outline = "none";
                      }}
                      aria-pressed={isSelected}
                      aria-label={`Filter by color ${color.name}`}
                    >
                      <div
                        className="w-10 h-10 rounded-full border-2 transition-all"
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default ProductFilters;
