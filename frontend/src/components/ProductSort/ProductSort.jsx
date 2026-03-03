/**
 * Sort dropdown for product lists. Options: default, price, name, newest.
 * Renders dropdown in a portal so it overlays page content (desktop + mobile).
 * On mobile the full "Sort: [option]" is shown and may wrap to 2–3 lines.
 */
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { FiChevronDown } from "react-icons/fi";

const sortOptions = [
  { value: "default", label: "Default" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "name-asc", label: "Name: A to Z" },
  { value: "name-desc", label: "Name: Z to A" },
  { value: "newest", label: "Newest First" },
];

const DROPDOWN_WIDTH = 224;

const ProductSort = ({ onSortChange, currentSort = "default" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState(null);
  const triggerRef = useRef(null);

  const currentOption =
    sortOptions.find((opt) => opt.value === currentSort) || sortOptions[0];

  const updatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const padding = 16;
    let left = rect.left;
    if (left + DROPDOWN_WIDTH > window.innerWidth - padding) {
      left = window.innerWidth - DROPDOWN_WIDTH - padding;
    }
    if (left < padding) left = padding;
    setPosition({ top: rect.bottom + 8, left });
  };

  useEffect(() => {
    if (!isOpen) {
      setPosition(null);
      return;
    }
    updatePosition();
    const onScrollOrResize = () => updatePosition();
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [isOpen]);

  const handleSort = (value) => {
    onSortChange(value);
    setIsOpen(false);
  };

  const dropdownContent =
    isOpen && position
      ? createPortal(
          <>
            <div
              className="fixed inset-0 z-[100]"
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed w-56 max-w-[calc(100vw-2rem)] rounded-lg shadow-xl z-[110] overflow-hidden"
              style={{
                top: position.top,
                left: position.left,
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
          </>,
          document.body
        )
      : null;

  return (
    <div className="relative shrink-0">
      <motion.button
        ref={triggerRef}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 border-2 rounded-lg transition-colors text-left max-w-[min(100%,12rem)] sm:max-w-none"
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
        aria-label={`Sort: ${currentOption.label}`}
      >
        <span className="text-sm font-medium whitespace-normal break-words min-w-0">
          Sort: {currentOption.label}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0"
        >
          <FiChevronDown size={18} />
        </motion.div>
      </motion.button>

      {dropdownContent}
    </div>
  );
};

export default ProductSort;
