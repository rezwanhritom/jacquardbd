import { Link } from "react-router";
import { FiChevronRight, FiTruck, FiRefreshCw, FiStar } from "react-icons/fi";

/**
 * Bar variants:
 * - motto: full-width bar with site motto (centered)
 * - section: bar with section name (e.g. "New Arrivals", "Best Sellers")
 * - viewMore: bar with "View More" link
 */
const SectionBar = ({ variant = "section", title, text, link, className = "", centered }) => {
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
        <p className="text-sm uppercase tracking-widest" style={{ color: "var(--color-primary)", fontWeight: 600 }}>
          <span style={{ fontWeight: 600 }}>Elevating </span>
          <span style={{ fontWeight: 700 }}>Style </span>
          <span style={{ fontWeight: 800 }}>Since </span>
          <span style={{ fontWeight: 900 }}>2026</span>
        </p>
      </div>
    );
  }

  if (variant === "promo") {
    return (
      <div
        className={`${baseClass} py-4 ${className}`}
        style={{ ...style, backgroundColor: "var(--color-primary)", borderColor: "transparent" }}
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-center gap-4 md:gap-12 text-white text-center md:text-left">
          <div className="flex items-center gap-2">
            <FiTruck size={20} />
            <span className="text-sm font-medium">Free shipping</span>
          </div>
          <div className="flex items-center gap-2">
            <FiRefreshCw size={20} />
            <span className="text-sm font-medium">15 day return policy</span>
          </div>
          <div className="flex items-center gap-2">
            <FiStar size={20} />
            <span className="text-sm font-medium">Exclusive member rewards</span>
          </div>
        </div>
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
      <div className={`max-w-7xl mx-auto ${centered ? "text-center" : ""}`}>
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold uppercase tracking-wide" style={{ color: "var(--color-primary)" }}>
          {title}
        </h2>
      </div>
    </div>
  );
};

export default SectionBar;
