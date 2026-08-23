import { Link } from "react-router";
import { homeQuickLinks } from "../../data/homeQuickLinks";

/**
 * Horizontal shop shortcuts so customers can jump to a category in one tap.
 */
const ShopQuickNav = () => {
  return (
    <nav
      aria-label="Shop shortcuts"
      className="border-b"
      style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-primary)" }}
    >
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <ul className="flex items-center gap-2 sm:gap-3 overflow-x-auto scrollbar-hide py-3 sm:py-4 -mx-4 px-4 sm:mx-0 sm:px-0">
          {homeQuickLinks.map((item) => (
            <li key={item.id} className="shrink-0">
              <Link
                to={item.path}
                className="shop-quick-chip inline-flex items-center rounded-full border px-4 py-2 text-xs sm:text-sm font-medium whitespace-nowrap transition-colors"
                style={{
                  borderColor: "var(--border-primary)",
                  color: "var(--text-primary)",
                  backgroundColor: "var(--bg-secondary)",
                }}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default ShopQuickNav;
