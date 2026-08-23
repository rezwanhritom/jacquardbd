import { Link } from "react-router";

/**
 * Split editorial banner — Nike-style story block with a clear shop path.
 */
const FeaturedBanner = () => {
  return (
    <section className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3" aria-label="Brand story">
      <div
        className="grid grid-cols-1 lg:grid-cols-2 overflow-hidden"
        style={{ backgroundColor: "var(--bg-secondary)" }}
      >
        <div className="relative h-[52vw] min-h-[240px] max-h-[360px] lg:h-auto lg:min-h-[480px] lg:max-h-none order-1 lg:order-none">
          <img
            src="https://images.unsplash.com/photo-1445205170230-053b83016050?w=1400&q=80"
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
        <div className="flex flex-col justify-center px-6 py-10 sm:px-10 sm:py-14 lg:px-16 lg:py-20">
          <p
            className="text-[10px] sm:text-xs uppercase tracking-[0.25em] mb-3"
            style={{ color: "var(--color-tertiary)" }}
          >
            Jacquard
          </p>
          <h2
            className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold leading-tight mb-4"
            style={{ color: "var(--text-primary)" }}
          >
            Crafted for everyday elegance
          </h2>
          <p className="text-sm sm:text-base leading-relaxed mb-8 max-w-md" style={{ color: "var(--text-secondary)" }}>
            Timeless cuts, considered fabrics, and pieces you can find in seconds — from new drops to wardrobe staples.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/new-arrivals"
              className="inline-flex items-center justify-center px-6 py-3.5 text-sm font-semibold text-white"
              style={{ backgroundColor: "var(--color-primary)" }}
            >
              Shop new arrivals
            </Link>
            <Link
              to="/about"
              className="inline-flex items-center justify-center px-6 py-3.5 text-sm font-semibold border"
              style={{ borderColor: "var(--border-primary)", color: "var(--text-primary)" }}
            >
              Our story
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedBanner;
