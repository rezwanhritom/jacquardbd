import { Link } from "react-router";
import { FiArrowRight } from "react-icons/fi";
import ProductCard from "../ProductCard";
import ProductCardSkeleton from "../Skeleton/ProductCardSkeleton";
import { mapApiProduct } from "../../utils/productUtils";

/**
 * Homepage product grid: 2 columns on phones, 4 on desktop — like a modern storefront.
 */
const HomeProductRail = ({
  title,
  subtitle,
  products = [],
  viewAllTo,
  viewAllLabel = "View all",
  loading = false,
  emptyHint,
}) => {
  const mapped = (products || []).map(mapApiProduct);
  const showGrid = loading || mapped.length > 0;

  if (!loading && mapped.length === 0 && !emptyHint) return null;

  return (
    <section className="py-10 sm:py-14 md:py-16" style={{ backgroundColor: "var(--bg-primary)" }}>
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4 mb-6 sm:mb-8">
          <div className="min-w-0">
            <h2
              className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight"
              style={{ color: "var(--text-primary)" }}
            >
              {title}
            </h2>
            {subtitle && (
              <p className="mt-1.5 text-sm sm:text-base" style={{ color: "var(--text-secondary)" }}>
                {subtitle}
              </p>
            )}
          </div>
          {viewAllTo && (
            <Link
              to={viewAllTo}
              className="shrink-0 inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold uppercase tracking-wider"
              style={{ color: "var(--color-primary)" }}
            >
              {viewAllLabel}
              <FiArrowRight size={16} />
            </Link>
          )}
        </div>

        {!showGrid ? (
          <p className="text-sm py-8" style={{ color: "var(--text-tertiary)" }}>
            {emptyHint}
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-8 sm:gap-x-5 sm:gap-y-10">
            {loading
              ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : mapped.map((product, index) => (
                  <ProductCard key={product.id || product._id || index} product={product} index={index} />
                ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default HomeProductRail;
