import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronDown } from "react-icons/fi";

const sortOptions = [
  { value: "default", label: "Default" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "name-asc", label: "Name: A to Z" },
  { value: "name-desc", label: "Name: Z to A" },
  { value: "newest", label: "Newest First" },
];

const ProductSort = ({ onSortChange, currentSort = "default" }) => {
  const [isOpen, setIsOpen] = useState(false);

  const currentOption =
    sortOptions.find((opt) => opt.value === currentSort) || sortOptions[0];

  const handleSort = (value) => {
    onSortChange(value);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 border-2 rounded-lg transition-colors"
        style={{
          borderColor: "var(--border-primary)",
          backgroundColor: "var(--bg-primary)",
          color: "var(--text-primary)",
        }}
        onFocus={(e) => {
          e.currentTarget.style.outline = "2px solid var(--color-primary)";
          e.currentTarget.style.outlineOffset = "2px";
        }}
        onBlur={(e) => {
          e.currentTarget.style.outline = "none";
        }}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="Sort products"
      >
        <span className="text-sm font-medium">Sort: {currentOption.label}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <FiChevronDown size={18} />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full right-0 mt-2 w-56 rounded-lg shadow-xl z-20 overflow-hidden"
              style={{
                backgroundColor: "var(--bg-primary)",
                border: "1px solid var(--border-primary)",
              }}
              role="listbox"
              aria-label="Sort options"
            >
              {sortOptions.map((option) => (
                <motion.button
                  key={option.value}
                  whileHover={{ backgroundColor: "var(--bg-secondary)" }}
                  onClick={() => handleSort(option.value)}
                  className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                    currentSort === option.value ? "font-semibold" : ""
                  }`}
                  style={{
                    color:
                      currentSort === option.value
                        ? "var(--color-primary)"
                        : "var(--text-secondary)",
                    backgroundColor:
                      currentSort === option.value
                        ? "var(--bg-secondary)"
                        : "transparent",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.outline =
                      "2px solid var(--color-primary)";
                    e.currentTarget.style.outlineOffset = "2px";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.outline = "none";
                  }}
                  aria-selected={currentSort === option.value}
                  role="option"
                >
                  {option.label}
                </motion.button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductSort;
