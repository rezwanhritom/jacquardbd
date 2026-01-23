import { motion } from "framer-motion";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className="flex items-center justify-center gap-2">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          backgroundColor: currentPage === 1 ? "transparent" : "var(--bg-secondary)",
          color: "var(--text-secondary)",
        }}
        onFocus={(e) => {
          if (!e.currentTarget.disabled) {
            e.currentTarget.style.outline = "2px solid var(--color-primary)";
            e.currentTarget.style.outlineOffset = "2px";
          }
        }}
        onBlur={(e) => {
          e.currentTarget.style.outline = "none";
        }}
        aria-label="Previous page"
      >
        <FiChevronLeft size={20} />
      </motion.button>

      {pages.map((page, index) => {
        if (page === "...") {
          return (
            <span
              key={`ellipsis-${index}`}
              className="px-2"
              style={{ color: "var(--text-tertiary)" }}
            >
              ...
            </span>
          );
        }

        const isActive = page === currentPage;
        return (
          <motion.button
            key={page}
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onPageChange(page)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive ? "text-white" : ""
            }`}
            style={{
              backgroundColor: isActive
                ? "var(--color-primary)"
                : "var(--bg-secondary)",
              color: isActive ? "white" : "var(--text-secondary)",
            }}
            onFocus={(e) => {
              e.currentTarget.style.outline = "2px solid var(--color-primary)";
              e.currentTarget.style.outlineOffset = "2px";
            }}
            onBlur={(e) => {
              e.currentTarget.style.outline = "none";
            }}
            aria-label={`Go to page ${page}`}
            aria-current={isActive ? "page" : undefined}
          >
            {page}
          </motion.button>
        );
      })}

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          backgroundColor: currentPage === totalPages ? "transparent" : "var(--bg-secondary)",
          color: "var(--text-secondary)",
        }}
        onFocus={(e) => {
          if (!e.currentTarget.disabled) {
            e.currentTarget.style.outline = "2px solid var(--color-primary)";
            e.currentTarget.style.outlineOffset = "2px";
          }
        }}
        onBlur={(e) => {
          e.currentTarget.style.outline = "none";
        }}
        aria-label="Next page"
      >
        <FiChevronRight size={20} />
      </motion.button>
    </div>
  );
};

export default Pagination;
