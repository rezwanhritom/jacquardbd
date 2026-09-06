import { useState, useRef } from "react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiHeart,
  FiShoppingBag,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import toast from "react-hot-toast";
import { useWishlist } from "../../context/WishlistContext";
import { useCart } from "../../context/CartContext";
import { hasDiscount } from "../../utils/productUtils";

const ProductCard = ({ product, index = 0, viewMode = "grid", brickSlot = null }) => {
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { addToCart, isInCart } = useCart();
  const inWishlist = isInWishlist(product);
  const inCart = isInCart(product);
  const outOfStock = (product?.stockQuantity ?? 1) <= 0;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const touchStartXRef = useRef(null);
  const touchEndXRef = useRef(null);

  const images = Array.isArray(product?.images) ? product.images : [];
  const imageCount = images.length;

  const MIN_SWIPE = 50;
  /** Horizontal swipe — left = next, right = previous (wraps). */
  const onImageTouchStart = (e) => {
    touchStartXRef.current = e.targetTouches[0].clientX;
    touchEndXRef.current = e.targetTouches[0].clientX;
  };
  const onImageTouchMove = (e) => {
    touchEndXRef.current = e.targetTouches[0].clientX;
  };
  const onImageTouchEnd = () => {
    const start = touchStartXRef.current;
    const end = touchEndXRef.current;
    touchStartXRef.current = null;
    touchEndXRef.current = null;
    if (start == null || end == null || imageCount <= 1) return;
    const delta = start - end;
    if (delta > MIN_SWIPE) setCurrentImageIndex((prev) => (prev + 1) % imageCount);
    else if (delta < -MIN_SWIPE) setCurrentImageIndex((prev) => (prev - 1 + imageCount) % imageCount);
  };

  const nextImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % imageCount);
  };

  const prevImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + imageCount) % imageCount);
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (inWishlist) {
      const { success } = await removeFromWishlist(product);
      if (success) toast.success("Removed from wishlist");
    } else {
      const { success, message } = await addToWishlist(product);
      if (success) toast.success(message === "Already in wishlist" ? message : "Added to wishlist!");
    }
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock) return;
    if (inCart) {
      toast.error("Product already in cart");
      return;
    }
    const { success, message } = await addToCart(product, 1);
    if (success) toast.success("Added to cart!");
    else if (message) toast.error(message);
  };

  if (viewMode === "list") {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
        className="group min-w-0 max-w-full w-full"
      >
        <Link
          to={`/product/${product.slug != null && product.slug !== "" ? product.slug : product.id}`}
          className="block min-w-0 max-w-full w-full"
          aria-label={`View ${product.name} details`}
        >
          <div
            className="flex flex-col sm:flex-row gap-4 sm:gap-6 p-3 sm:p-6 rounded-lg min-w-0 max-w-full w-full overflow-hidden"
            style={{ backgroundColor: "var(--bg-secondary)" }}
          >
            <div
              className="relative overflow-hidden w-full max-w-[11rem] h-52 sm:max-w-none sm:w-48 sm:h-64 flex-shrink-0 rounded-lg touch-none select-none mx-auto sm:mx-0"
              style={{ backgroundColor: "var(--bg-tertiary)" }}
              onTouchStart={onImageTouchStart}
              onTouchMove={onImageTouchMove}
              onTouchEnd={onImageTouchEnd}
              role="group"
              aria-label="Product photos, swipe left or right to browse"
            >
              {imageCount > 0 ? (
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentImageIndex}
                    src={images[currentImageIndex]}
                    alt={`${product.name} — photo ${currentImageIndex + 1} of ${imageCount}`}
                    className="w-full h-full object-cover pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  />
                </AnimatePresence>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs" style={{ color: "var(--text-tertiary)" }}>
                  No image
                </div>
              )}
              {imageCount > 1 && (
                <>
                  <button
                    type="button"
                    onClick={prevImage}
                    className="absolute left-0.5 top-1/2 -translate-y-1/2 z-10 p-1 sm:p-1.5 border-0 outline-none focus:outline-none focus:ring-0 bg-transparent opacity-85 hover:opacity-100"
                    style={{ color: "#fff", filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.85))" }}
                    aria-label="Previous photo"
                  >
                    <FiChevronLeft size={22} strokeWidth={2.5} />
                  </button>
                  <button
                    type="button"
                    onClick={nextImage}
                    className="absolute right-0.5 top-1/2 -translate-y-1/2 z-10 p-1 sm:p-1.5 border-0 outline-none focus:outline-none focus:ring-0 bg-transparent opacity-85 hover:opacity-100"
                    style={{ color: "#fff", filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.85))" }}
                    aria-label="Next photo"
                  >
                    <FiChevronRight size={22} strokeWidth={2.5} />
                  </button>
                  <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                    {images.map((_, idx) => (
                      <div
                        key={idx}
                        className={`h-1 rounded-full transition-all ${idx === currentImageIndex ? "w-3.5" : "w-1"}`}
                        style={{
                          backgroundColor:
                            idx === currentImageIndex ? "var(--color-primary)" : "rgba(255,255,255,0.55)",
                        }}
                        aria-hidden
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
            <div className="min-w-0 flex-1 space-y-2 sm:space-y-3 w-full max-w-full overflow-hidden">
              <div className="min-w-0">
                <h3
                  className="text-sm sm:text-base font-medium mb-1 sm:mb-1.5 group-hover:underline break-words [word-break:break-word] leading-snug"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {product.name}
                </h3>
                {product.description && (
                  <p
                    className="text-xs sm:text-sm line-clamp-2 break-words [word-break:break-word]"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {product.description}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-0.5 min-w-0">
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap min-w-0">
                  <span
                    className="text-base sm:text-lg font-semibold tabular-nums shrink-0"
                    style={{ color: "var(--color-primary)" }}
                  >
                    ৳{(product.price ?? 0).toFixed(2)}
                  </span>
                  {hasDiscount(product) && product.discount != null && product.discount > 0 && (
                    <span className="text-xs sm:text-sm font-semibold px-2 py-0.5 rounded shrink-0" style={{ backgroundColor: "var(--color-tertiary)", color: "white" }}>
                      -{product.discount}%
                    </span>
                  )}
                </div>
                {hasDiscount(product) && product.originalPrice != null && (
                  <span className="text-sm sm:text-lg line-through tabular-nums" style={{ color: "var(--text-tertiary)" }}>
                    ৳{product.originalPrice.toFixed(2)}
                  </span>
                )}
                {product.campaignName && (
                  <span
                    className="text-xs font-medium break-words line-clamp-2 block"
                    style={{ color: "var(--color-primary)" }}
                  >
                    {product.campaignName}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2 sm:gap-3 pt-1 sm:pt-2 min-w-0">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleWishlist}
                  className="px-3 py-2 sm:px-6 sm:py-2.5 border-2 rounded-lg text-xs sm:text-sm font-semibold uppercase tracking-wider transition-colors max-w-full"
                  style={{
                    borderColor: inWishlist ? "var(--color-primary)" : "var(--border-primary)",
                    color: inWishlist ? "var(--color-primary)" : "var(--text-primary)",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.outline = "2px solid var(--color-primary)";
                    e.currentTarget.style.outlineOffset = "2px";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.outline = "none";
                  }}
                  aria-label={inWishlist ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
                >
                  <FiHeart size={16} className={`inline mr-2 ${inWishlist ? "fill-current" : ""}`} />
                  {inWishlist ? "In Wishlist" : "Wishlist"}
                </motion.button>
                <motion.button
                  whileHover={outOfStock || inCart ? 1 : { scale: 1.05 }}
                  whileTap={outOfStock || inCart ? 1 : { scale: 0.95 }}
                  onClick={handleAddToCart}
                  disabled={outOfStock || inCart}
                  className="px-3 py-2 sm:px-6 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold uppercase tracking-wider text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed max-w-full"
                  style={{
                    backgroundColor:
                      outOfStock ? "var(--bg-tertiary)" : inCart ? "var(--bg-tertiary)" : "var(--color-primary)",
                  }}
                  onFocus={(e) => {
                    if (!outOfStock && !inCart) {
                      e.currentTarget.style.outline = "2px solid var(--color-primary)";
                      e.currentTarget.style.outlineOffset = "2px";
                    }
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.outline = "none";
                  }}
                  aria-label={
                    outOfStock ? "Out of stock" : inCart ? "Already in cart" : `Add ${product.name} to cart`
                  }
                >
                  <FiShoppingBag size={16} className="inline mr-2" />
                  {outOfStock ? "Out of Stock" : inCart ? "Already in Cart" : "Add to Cart"}
                </motion.button>
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  const isBrickHalf = brickSlot === "half";
  const isBrickFull = brickSlot === "full";
  const isBrick = isBrickHalf || isBrickFull;

  return (
    <motion.div
      initial={{ opacity: 0, y: isBrick ? 8 : 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="group"
    >
      <Link
        to={`/product/${product.slug != null && product.slug !== "" ? product.slug : product.id}`}
        className="block"
        aria-label={`View ${product.name} details`}
      >
        <div className={isBrickFull ? "space-y-3 sm:space-y-4" : "space-y-4"}>
          {/* Image Container: horizontal swipe (left/right) for image change */}
          <div
            className={`relative overflow-hidden touch-none ${
              isBrickFull
                ? "aspect-[3/4] min-h-[min(88vw,420px)] sm:min-h-[min(75vh,720px)] sm:aspect-auto sm:h-[min(75vh,720px)] md:h-[min(78vh,820px)] rounded-none"
                : isBrickHalf
                  ? "aspect-[4/5] sm:aspect-[3/4] rounded-none"
                  : "aspect-[3/4] rounded-lg"
            }`}
            style={{ backgroundColor: "var(--bg-tertiary)" }}
            onTouchStart={onImageTouchStart}
            onTouchMove={onImageTouchMove}
            onTouchEnd={onImageTouchEnd}
          >
            {imageCount > 0 ? (
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentImageIndex}
                  src={images[currentImageIndex]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ scale: 1.05 }}
                />
              </AnimatePresence>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-sm" style={{ color: "var(--text-tertiary)" }}>
                No image
              </div>
            )}

            {/* No tags/badges above image per design */}

            {hasDiscount(product) && product.discount != null && product.discount > 0 && (
              <motion.span
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute top-4 right-4 px-3 py-1 text-xs font-bold text-white rounded-full z-10"
                style={{ backgroundColor: "var(--color-tertiary)" }}
              >
                -{product.discount}%
              </motion.span>
            )}

            {/* Image navigation: left/right arrows — visible on any image */}
            {imageCount > 1 && (
              <>
                <button
                  type="button"
                  onClick={prevImage}
                  className="absolute left-1 top-1/2 -translate-y-1/2 z-10 p-1 border-0 outline-none focus:outline-none focus:ring-0 bg-transparent opacity-80 hover:opacity-100 transition-opacity"
                  style={{ color: "#fff", filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.85))" }}
                  aria-label="Previous image"
                >
                  <FiChevronLeft size={24} strokeWidth={2.5} />
                </button>
                <button
                  type="button"
                  onClick={nextImage}
                  className="absolute right-1 top-1/2 -translate-y-1/2 z-10 p-1 border-0 outline-none focus:outline-none focus:ring-0 bg-transparent opacity-80 hover:opacity-100 transition-opacity"
                  style={{ color: "#fff", filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.85))" }}
                  aria-label="Next image"
                >
                  <FiChevronRight size={24} strokeWidth={2.5} />
                </button>
              </>
            )}

            {/* Image indicators (dots) */}
            {imageCount > 1 && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1.5 z-10">
                {images.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1.5 rounded-full transition-all ${
                      idx === currentImageIndex ? "w-4" : "w-1.5"
                    }`}
                    style={{
                      backgroundColor:
                        idx === currentImageIndex
                          ? "var(--color-primary)"
                          : "rgba(255, 255, 255, 0.5)",
                    }}
                    aria-hidden="true"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Wishlist & Cart: below image on smaller screens only (desktop: use navbar / product page) */}
          <div
            className={`flex lg:hidden items-center justify-center gap-2 py-2 ${isBrickFull ? "px-4 sm:px-8" : isBrickHalf ? "px-2" : ""}`}
          >
            <motion.button
              type="button"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleWishlist(e);
              }}
              className="p-2.5 rounded-full border transition-colors"
              style={{
                borderColor: inWishlist ? "var(--color-primary)" : "var(--border-primary)",
                color: inWishlist ? "var(--color-primary)" : "var(--text-primary)",
                backgroundColor: "var(--bg-primary)",
              }}
              aria-label={inWishlist ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
            >
              <FiHeart size={18} className={inWishlist ? "fill-current" : ""} />
            </motion.button>
            <motion.button
              type="button"
              whileHover={outOfStock || inCart ? 1 : { scale: 1.1 }}
              whileTap={outOfStock || inCart ? 1 : { scale: 0.95 }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleAddToCart(e);
              }}
              disabled={outOfStock || inCart}
              className="p-2.5 rounded-full border transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                borderColor: inCart ? "var(--color-primary)" : "var(--border-primary)",
                color: inCart ? "var(--color-primary)" : "var(--text-primary)",
                backgroundColor: "var(--bg-primary)",
              }}
              aria-label={
                outOfStock ? "Out of stock" : inCart ? "Already in cart" : `Add ${product.name} to cart`
              }
            >
              <FiShoppingBag size={18} />
            </motion.button>
          </div>

          {/* Product Info — centered below image; lighter than category headings */}
          <div
            className={`space-y-1.5 text-center max-w-full mx-auto ${isBrickFull ? "px-4 sm:px-10 pb-6 sm:pb-8 max-w-2xl" : isBrickHalf ? "px-2 sm:px-3 pb-4" : "px-1"}`}
          >
            <h3
              className={`font-medium group-hover:underline transition-all leading-snug ${isBrickFull ? "text-base sm:text-lg md:text-xl" : "text-sm sm:text-base"}`}
              style={{ color: "var(--text-secondary)" }}
            >
              {product.name}
            </h3>
            <div className="flex flex-col gap-0.5 items-center">
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <span className="text-base sm:text-lg font-semibold tabular-nums" style={{ color: "var(--color-primary)" }}>
                  ৳{(product.price ?? 0).toFixed(2)}
                </span>
                {hasDiscount(product) && product.discount != null && product.discount > 0 && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded" style={{ backgroundColor: "var(--color-tertiary)", color: "white" }}>
                    -{product.discount}%
                  </span>
                )}
              </div>
              {hasDiscount(product) && product.originalPrice != null && (
                <span className="text-xs sm:text-sm line-through tabular-nums" style={{ color: "var(--text-tertiary)" }}>
                  ৳{product.originalPrice.toFixed(2)}
                </span>
              )}
              {product.campaignName && (
                <span className="text-[11px] sm:text-xs font-normal" style={{ color: "var(--text-tertiary)" }}>
                  {product.campaignName}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
