import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronDown, FiX } from "react-icons/fi";

const ProductFilters = ({ filters, onFilterChange, onClearFilters, variant = "sidebar" }) => {
  const isDropdown = variant === "dropdown";
  const [openSections, setOpenSections] = useState({
    price: !isDropdown,
    size: !isDropdown,
    color: !isDropdown,
  });

  const toggleSection = (section) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handlePriceChange = (min, max) => {
    onFilterChange({
      ...filters,
      priceRange: {
        min: min === "" || min == null ? "" : Number(min),
        max: max === "" || max == null ? "" : Number(max),
      },
    });
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

  /** Sizes match admin Add Product category (ProductCreate). */
  const sizes = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];
  /** Colors match admin Add Product preset colors (ProductCreate). */
  const colors = [
    { name: "Black", value: "#000000" },
    { name: "White", value: "#FFFFFF" },
    { name: "Navy", value: "#1e3a5f" },
    { name: "Red", value: "#c41e3a" },
    { name: "Burgundy", value: "#800020" },
    { name: "Gray", value: "#6b7280" },
    { name: "Charcoal", value: "#36454f" },
    { name: "Beige", value: "#f5f5dc" },
    { name: "Brown", value: "#8b4513" },
    { name: "Olive", value: "#808000" },
    { name: "Blue", value: "#2563eb" },
    { name: "Sky Blue", value: "#0ea5e9" },
    { name: "Green", value: "#16a34a" },
    { name: "Mustard", value: "#e4a853" },
    { name: "Pink", value: "#ec4899" },
    { name: "Purple", value: "#7c3aed" },
    { name: "Orange", value: "#ea580c" },
    { name: "Yellow", value: "#eab308" },
  ];

  const hasPriceFilter =
    filters.priceRange &&
    ((filters.priceRange.min !== "" && filters.priceRange.min != null) ||
      (filters.priceRange.max !== "" && filters.priceRange.max != null));
  const hasActiveFilters =
    (filters.sizes && filters.sizes.length > 0) ||
    (filters.colors && filters.colors.length > 0) ||
    hasPriceFilter;

  const content = (
    <>
      <div className={`flex items-center justify-between ${isDropdown ? "mb-4" : "mb-6"}`}>
        {!isDropdown && (
          <h3 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
            Filters
          </h3>
        )}
        {hasActiveFilters && (
          <motion.button
            type="button"
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
      <div className={isDropdown ? "border-b py-3" : "border-b pb-6"} style={{ borderColor: "var(--border-primary)" }}>
        <button
          type="button"
          onClick={() => toggleSection("price")}
          className={`w-full flex items-center justify-between transition-colors ${isDropdown ? "py-1" : "mb-4"}`}
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
          <h4 className="font-semibold text-left" style={{ color: "var(--text-primary)" }}>
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
              id="price-filter-section"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className={isDropdown ? "space-y-3 pt-3" : "space-y-4"}>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    min={0}
                    placeholder="Min"
                    value={filters.priceRange?.min === "" || filters.priceRange?.min == null ? "" : filters.priceRange.min}
                    onChange={(e) => {
                      const v = e.target.value;
                      handlePriceChange(v === "" ? "" : parseFloat(v), filters.priceRange?.max ?? "");
                    }}
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
                    min={0}
                    placeholder="Max"
                    value={filters.priceRange?.max === "" || filters.priceRange?.max == null ? "" : filters.priceRange.max}
                    onChange={(e) => {
                      const v = e.target.value;
                      handlePriceChange(filters.priceRange?.min ?? "", v === "" ? "" : parseFloat(v));
                    }}
                    className="w-full px-4 py-2 border rounded-lg outline-none transition-colors"
                    style={{
                      borderColor: "var(--border-primary)",
                      backgroundColor: "var(--bg-primary)",
                      color: "var(--text-primary)",
                    }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Size */}
      <div className={isDropdown ? "border-b py-3" : "border-b pb-6"} style={{ borderColor: "var(--border-primary)" }}>
        <button
          type="button"
          onClick={() => toggleSection("size")}
          className={`w-full flex items-center justify-between transition-colors ${isDropdown ? "py-1" : "mb-4"}`}
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
          <h4 className="font-semibold text-left" style={{ color: "var(--text-primary)" }}>
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
              <div className={`flex flex-wrap gap-2 ${isDropdown ? "pt-3" : ""}`}>
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
      <div className={isDropdown ? "py-3" : "border-b pb-6"} style={!isDropdown ? { borderColor: "var(--border-primary)" } : undefined}>
        <button
          type="button"
          onClick={() => toggleSection("color")}
          className={`w-full flex items-center justify-between transition-colors ${isDropdown ? "py-1" : "mb-4"}`}
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
          <h4 className="font-semibold text-left" style={{ color: "var(--text-primary)" }}>
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
              <div className={`flex flex-wrap gap-3 ${isDropdown ? "pt-3" : ""}`}>
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
    </>
  );

  if (isDropdown) {
    return <div className="min-w-[280px] max-w-[320px]">{content}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6 p-6 rounded-lg"
      style={{ backgroundColor: "var(--bg-secondary)" }}
    >
      {content}
    </motion.div>
  );
};

export default ProductFilters;
