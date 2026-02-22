import { Link } from "react-router";
import { FiChevronRight } from "react-icons/fi";

/**
 * Bar variants:
 * - motto: full-width bar with site motto (centered)
 * - section: bar with section name (e.g. "New Arrivals", "Best Sellers")
 * - viewMore: bar with "View More" link
 */
const SectionBar = ({ variant = "section", title, text, link, className = "" }) => {
  const baseClass = "w-full py-3 px-4 sm:px-6 lg:px-8 transition-colors duration-300";
  const style = {
    backgroundColor: "var(--bg-secondary)",
    borderColor: "var(--border-primary)",
    color: "var(--text-primary)",
  };

  if (variant === "motto") {
    return (
      <div
        className={`${baseClass} text-center border-y ${className}`}
        style={{ ...style, borderColor: "var(--border-primary)" }}
      >
        <p className="text-sm uppercase tracking-widest font-medium" style={{ color: "var(--color-primary)" }}>
          {text}
        </p>
      </div>
    );
  }

  if (variant === "viewMore") {
    return (
      <div
        className={`${baseClass} border-b ${className}`}
        style={{ ...style, borderColor: "var(--border-primary)" }}
      >
        <div className="max-w-7xl mx-auto flex justify-center">
          <Link
            to={link || "#"}
            className="text-sm uppercase tracking-wider font-semibold flex items-center gap-2 transition-colors"
            style={{ color: "var(--color-primary)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--active-color)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--color-primary)";
            }}
          >
            View More
            <FiChevronRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  // section
  return (
    <div
      className={`${baseClass} border-b ${className}`}
      style={{ ...style, borderColor: "var(--border-primary)" }}
    >
      <div className="max-w-7xl mx-auto">
        <h2 className="text-xl md:text-2xl font-bold uppercase tracking-wide" style={{ color: "var(--color-primary)" }}>
          {title}
        </h2>
      </div>
    </div>
  );
};

export default SectionBar;
