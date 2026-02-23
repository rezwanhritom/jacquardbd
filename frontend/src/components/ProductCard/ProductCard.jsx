import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { FiHeart, FiShoppingBag, FiChevronUp, FiChevronDown } from "react-icons/fi";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { useWishlist } from "../../context/WishlistContext";
import { useCart } from "../../context/CartContext";
import { hasDiscount } from "../../utils/productUtils";

const ProductCard = ({ product, index = 0, viewMode = "grid" }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { addToCart, isInCart } = useCart();
  const inWishlist = isInWishlist(product);
  const inCart = isInCart(product);
  const outOfStock = (product?.stockQuantity ?? 1) <= 0;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [touchStartY, setTouchStartY] = useState(null);
  const [touchEndY, setTouchEndY] = useState(null);

  const MIN_SWIPE = 50;
  const onImageTouchStart = (e) => setTouchStartY(e.targetTouches[0].clientY);
  const onImageTouchMove = (e) => setTouchEndY(e.targetTouches[0].clientY);
  const onImageTouchEnd = () => {
    if (touchStartY == null || touchEndY == null || product.images.length <= 1) {
      setTouchStartY(null);
      setTouchEndY(null);
      return;
    }
    const delta = touchStartY - touchEndY;
    if (delta > MIN_SWIPE) setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
    else if (delta < -MIN_SWIPE) setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
    setTouchStartY(null);
    setTouchEndY(null);
  };

  const nextImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
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
    if (!isAuthenticated) {
      toast.error("Please login to add items to cart");
      navigate("/login");
      return;
    }
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
        className="group"
      >
        <Link
          to={`/product/${product.slug != null && product.slug !== "" ? product.slug : product.id}`}
          className="block"
          aria-label={`View ${product.name} details`}
        >
          <div className="flex gap-6 p-6 rounded-lg" style={{ backgroundColor: "var(--bg-secondary)" }}>
            <div className="relative overflow-hidden w-48 h-64 flex-shrink-0 rounded-lg" style={{ backgroundColor: "var(--bg-tertiary)" }}>
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentImageIndex}
                  src={product.images[currentImageIndex]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </AnimatePresence>
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <h3 className="text-2xl font-semibold mb-2 group-hover:underline" style={{ color: "var(--text-primary)" }}>
                  {product.name}
                </h3>
                {product.description && (
                  <p className="text-sm line-clamp-2" style={{ color: "var(--text-secondary)" }}>
                    {product.description}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-2xl font-bold" style={{ color: "var(--color-primary)" }}>
                    ৳{(product.price ?? 0).toFixed(2)}
                  </span>
                  {hasDiscount(product) && product.discount != null && product.discount > 0 && (
                    <span className="text-sm font-semibold px-2 py-0.5 rounded" style={{ backgroundColor: "var(--color-tertiary)", color: "white" }}>
                      -{product.discount}%
                    </span>
                  )}
                </div>
                {hasDiscount(product) && product.originalPrice != null && (
                  <span className="text-lg line-through" style={{ color: "var(--text-tertiary)" }}>
                    ৳{product.originalPrice.toFixed(2)}
                  </span>
                )}
                {product.campaignName && (
                  <span className="text-xs font-medium" style={{ color: "var(--color-primary)" }}>
                    {product.campaignName}
                  </span>
                )}
              </div>
              <div className="flex gap-3 pt-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleWishlist}
                  className="px-6 py-2.5 border-2 rounded-lg text-sm font-semibold uppercase tracking-wider transition-colors"
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
                  className="px-6 py-2.5 rounded-lg text-sm font-semibold uppercase tracking-wider text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group"
    >
      <Link
        to={`/product/${product.slug != null && product.slug !== "" ? product.slug : product.id}`}
        className="block"
        aria-label={`View ${product.name} details`}
      >
        <div className="space-y-4">
          {/* Image Container: vertical swipe (up/down) for image change */}
          <div
            className="relative overflow-hidden aspect-[3/4] rounded-lg touch-none"
            style={{ backgroundColor: "var(--bg-tertiary)" }}
            onTouchStart={onImageTouchStart}
            onTouchMove={onImageTouchMove}
            onTouchEnd={onImageTouchEnd}
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={currentImageIndex}
                src={product.images[currentImageIndex]}
                alt={product.name}
                className="w-full h-full object-cover"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={{ scale: 1.05 }}
              />
            </AnimatePresence>

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

            {/* Image navigation: up/down arrows for vertical swipe */}
            {product.images.length > 1 && (
              <>
                <motion.button
                  type="button"
                  onClick={prevImage}
                  className="absolute left-1/2 top-2 -translate-x-1/2 p-2 rounded-full backdrop-blur-sm z-10 transition-all"
                  style={{ backgroundColor: "rgba(255, 255, 255, 0.9)" }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onFocus={(e) => {
                    e.currentTarget.style.outline = "2px solid var(--color-primary)";
                    e.currentTarget.style.outlineOffset = "2px";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.outline = "none";
                  }}
                  aria-label="Previous image"
                >
                  <FiChevronUp size={18} style={{ color: "var(--text-primary)" }} />
                </motion.button>
                <motion.button
                  type="button"
                  onClick={nextImage}
                  className="absolute left-1/2 bottom-8 -translate-x-1/2 p-2 rounded-full backdrop-blur-sm z-10 transition-all"
                  style={{ backgroundColor: "rgba(255, 255, 255, 0.9)" }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onFocus={(e) => {
                    e.currentTarget.style.outline = "2px solid var(--color-primary)";
                    e.currentTarget.style.outlineOffset = "2px";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.outline = "none";
                  }}
                  aria-label="Next image"
                >
                  <FiChevronDown size={18} style={{ color: "var(--text-primary)" }} />
                </motion.button>
              </>
            )}

            {/* Image indicators (dots) */}
            {product.images.length > 1 && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1.5 z-10">
                {product.images.map((_, idx) => (
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

          {/* Wishlist & Cart icons: below image, above product name */}
          <div className="flex items-center justify-center gap-2 py-2">
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

          {/* Product Info */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg group-hover:underline transition-all" style={{ color: "var(--text-primary)" }}>
              {product.name}
            </h3>
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-xl font-bold" style={{ color: "var(--color-primary)" }}>
                  ৳{(product.price ?? 0).toFixed(2)}
                </span>
                {hasDiscount(product) && product.discount != null && product.discount > 0 && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded" style={{ backgroundColor: "var(--color-tertiary)", color: "white" }}>
                    -{product.discount}%
                  </span>
                )}
              </div>
              {hasDiscount(product) && product.originalPrice != null && (
                <span className="text-sm line-through" style={{ color: "var(--text-tertiary)" }}>
                  ৳{product.originalPrice.toFixed(2)}
                </span>
              )}
              {product.campaignName && (
                <span className="text-xs font-medium" style={{ color: "var(--color-primary)" }}>
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
