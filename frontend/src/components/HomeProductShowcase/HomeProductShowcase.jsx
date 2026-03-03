import { Link } from "react-router";

/**
 * Product block: all images swipeable up/down; name (big bold) + description centered, only when on main (first) photo.
 */
/**
 * Home page: show only the first image per product; name and description overlay on that image.
 */
const ProductBlock = ({ product }) => {
  const productId = product.slug || product._id;
  const images = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : ["https://via.placeholder.com/600x800?text=No+image"];
  const firstImage = images[0];

  const description = product.shortDescription || product.description || "Discover this piece from our collection.";

  return (
    <Link
      to={`/product/${productId}`}
      className="block relative overflow-hidden bg-neutral-100 group"
    >
      <div className="aspect-[3/4] md:aspect-[4/5] relative flex flex-col">
        {/* Name + description: centered on the single image */}
        <div className="absolute inset-0 z-10 flex items-center justify-center px-4 text-center pointer-events-none">
          <div className="max-w-md">
            <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-white leading-tight drop-shadow-lg mb-2">
              {product.name}
            </h3>
            <p className="text-sm md:text-base text-white/95 leading-relaxed drop-shadow-md line-clamp-3">
              {description}
            </p>
          </div>
        </div>
        {/* Single image — first picture only */}
        <div className="absolute inset-0 touch-none select-none">
          <img
            src={firstImage}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </Link>
  );
};

/**
 * Mobile: single column (one by one). Desktop: New Arrivals 2x2, Best Sellers 2 in a row.
 */
const HomeProductShowcase = ({ products }) => {
  if (!products?.length) return null;
  return (
    <div
      className={`grid gap-px transition-colors duration-300 grid-cols-1 md:grid-cols-2`}
      style={{ backgroundColor: "var(--border-primary)" }}
    >
      {products.map((product) => (
        <ProductBlock key={product._id || product.id} product={product} />
      ))}
    </div>
  );
};

export default HomeProductShowcase;
