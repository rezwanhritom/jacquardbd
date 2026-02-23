import { useState, useRef } from "react";
import { Link } from "react-router";
import { FiChevronUp, FiChevronDown } from "react-icons/fi";

/**
 * Product block: all images swipeable up/down; name (big bold) + description centered, only when on main (first) photo.
 */
const ProductBlock = ({ product }) => {
  const productId = product.slug || product._id;
  const images = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : ["https://via.placeholder.com/600x800?text=No+image"];
  const [imageIndex, setImageIndex] = useState(0);
  const touchStartY = useRef(null);

  const description = product.shortDescription || product.description || "Discover this piece from our collection.";
  const showNameDesc = imageIndex === 0;

  const onTouchStart = (e) => {
    touchStartY.current = e.targetTouches[0].clientY;
  };
  const onTouchEnd = (e) => {
    if (touchStartY.current == null) return;
    const endY = e.changedTouches[0].clientY;
    const delta = touchStartY.current - endY;
    const minSwipe = 40;
    if (delta > minSwipe) {
      setImageIndex((i) => (i + 1) % images.length);
    } else if (delta < -minSwipe) {
      setImageIndex((i) => (i - 1 + images.length) % images.length);
    }
    touchStartY.current = null;
  };

  const goPrev = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setImageIndex((i) => (i - 1 + images.length) % images.length);
  };
  const goNext = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setImageIndex((i) => (i + 1) % images.length);
  };

  return (
    <Link
      to={`/product/${productId}`}
      className="block relative overflow-hidden bg-neutral-100 group"
    >
      <div className="aspect-[3/4] md:aspect-[4/5] relative flex flex-col">
        {/* Name + description: centered in the middle, only on main photo */}
        {showNameDesc && (
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
        )}
        {/* Image area: touch swipe (touch-none so mobile gets swipe) + arrow buttons */}
        <div
          className="absolute inset-0 touch-none select-none"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <img
            key={imageIndex}
            src={images[imageIndex]}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
        {/* Up/down arrows: always visible, low opacity, no scale so they stay in place */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={goPrev}
              className="absolute left-1/2 top-2 -translate-x-1/2 p-2 rounded-full z-20 pointer-events-auto opacity-40 hover:opacity-70 transition-opacity"
              style={{ backgroundColor: "rgba(255,255,255,0.9)" }}
              aria-label="Previous image"
            >
              <FiChevronUp size={18} style={{ color: "var(--text-primary)" }} />
            </button>
            <button
              type="button"
              onClick={goNext}
              className="absolute left-1/2 bottom-2 -translate-x-1/2 p-2 rounded-full z-20 pointer-events-auto opacity-40 hover:opacity-70 transition-opacity"
              style={{ backgroundColor: "rgba(255,255,255,0.9)" }}
              aria-label="Next image"
            >
              <FiChevronDown size={18} style={{ color: "var(--text-primary)" }} />
            </button>
          </>
        )}
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
