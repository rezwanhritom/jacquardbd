import { useState } from "react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiHeart, 
  FiShoppingBag, 
  FiTrash2, 
  FiShare2,
  FiCheck,
  FiAlertCircle
} from "react-icons/fi";
import { Container } from "../../components";
import { productsData } from "../../data/products";
import { fadeInUp, staggerContainer } from "../../utils/animations";
import { getDisplayCategory } from "../../utils/productUtils";
import toast from "react-hot-toast";

// Mock wishlist data - simulating items saved by user
const initialWishlistIds = [1, 3, 4, 5, 7];

const Wishlist = () => {
  const [wishlistIds, setWishlistIds] = useState(initialWishlistIds);
  const [removingId, setRemovingId] = useState(null);

  // Get full product details for wishlist items
  const wishlistItems = productsData.filter((p) => wishlistIds.includes(p.id));

  const handleRemoveItem = (productId) => {
    const product = productsData.find((p) => p.id === productId);
    setRemovingId(productId);
    
    // Simulate removal with animation delay
    setTimeout(() => {
      setWishlistIds((prev) => prev.filter((id) => id !== productId));
      setRemovingId(null);
      toast.success(
        <span>
          <strong>{product?.name}</strong> removed from wishlist
        </span>,
        { icon: <FiTrash2 className="text-red-500" /> }
      );
    }, 300);
  };

  const handleMoveToCart = (product) => {
    toast.success(
      <span>
        <strong>{product.name}</strong> added to cart!
      </span>,
      { icon: <FiCheck className="text-green-500" /> }
    );
  };

  const handleShare = () => {
    // Simulate sharing wishlist
    navigator.clipboard?.writeText(window.location.href);
    toast.success("Wishlist link copied to clipboard!");
  };

  const handleClearAll = () => {
    setWishlistIds([]);
    toast.success("Wishlist cleared");
  };

  // Calculate total savings
  const totalSavings = wishlistItems.reduce((acc, item) => {
    if (item.originalPrice) {
      return acc + (item.originalPrice - item.price);
    }
    return acc;
  }, 0);

  return (
    <div className="min-h-screen py-12 md:py-16">
      <Container>
        <motion.div
          initial="initial"
          animate="animate"
          variants={fadeInUp}
          className="space-y-8"
        >
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <motion.div 
                className="flex items-center gap-3 mb-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div 
                  className="p-3 rounded-full"
                  style={{ backgroundColor: "var(--bg-secondary)" }}
                >
                  <FiHeart 
                    size={28} 
                    style={{ color: "var(--color-primary)" }} 
                  />
                </div>
                <div>
                  <h1 
                    className="text-3xl md:text-4xl font-bold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    My Wishlist
                  </h1>
                  <p 
                    className="text-sm mt-1"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {wishlistItems.length} {wishlistItems.length === 1 ? "item" : "items"} saved
                    {totalSavings > 0 && (
                      <span style={{ color: "var(--color-tertiary)" }}>
                        {" "}• Save ${totalSavings.toFixed(2)} on these items
                      </span>
                    )}
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Header Actions */}
            {wishlistItems.length > 0 && (
              <motion.div 
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleShare}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors"
                  style={{
                    backgroundColor: "var(--bg-secondary)",
                    color: "var(--text-primary)",
                  }}
                >
                  <FiShare2 size={16} />
                  Share
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleClearAll}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors"
                  style={{
                    backgroundColor: "transparent",
                    color: "var(--color-tertiary)",
                    border: "1px solid var(--border-primary)",
                  }}
                >
                  <FiTrash2 size={16} />
                  Clear All
                </motion.button>
              </motion.div>
            )}
          </div>

          {/* Wishlist Content */}
          {wishlistItems.length > 0 ? (
            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              <AnimatePresence mode="popLayout">
                {wishlistItems.map((product, index) => (
                  <WishlistCard
                    key={product.id}
                    product={product}
                    index={index}
                    isRemoving={removingId === product.id}
                    onRemove={handleRemoveItem}
                    onMoveToCart={handleMoveToCart}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <EmptyWishlist />
          )}

          {/* Continue Shopping */}
          {wishlistItems.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-center pt-8"
            >
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm uppercase tracking-wide transition-colors"
                style={{
                  border: "2px solid var(--border-primary)",
                  color: "var(--text-primary)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--color-primary)";
                  e.currentTarget.style.backgroundColor = "var(--color-primary)";
                  e.currentTarget.style.color = "white";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border-primary)";
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "var(--text-primary)";
                }}
              >
                Continue Shopping
              </Link>
            </motion.div>
          )}
        </motion.div>
      </Container>
    </div>
  );
};

// Wishlist Item Card Component
const WishlistCard = ({ product, index, isRemoving, onRemove, onMoveToCart }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ 
        opacity: isRemoving ? 0 : 1, 
        y: 0, 
        scale: isRemoving ? 0.8 : 1,
        transition: { delay: index * 0.05 }
      }}
      exit={{ opacity: 0, scale: 0.8, y: -20 }}
      transition={{ duration: 0.3 }}
      className="group relative rounded-xl overflow-hidden"
      style={{ backgroundColor: "var(--bg-secondary)" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Remove Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.1, rotate: 10 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => onRemove(product.id)}
        className="absolute top-3 right-3 z-20 p-2.5 rounded-full shadow-lg transition-colors"
        style={{
          backgroundColor: "var(--bg-primary)",
          color: "var(--color-tertiary)",
        }}
        aria-label={`Remove ${product.name} from wishlist`}
      >
        <FiTrash2 size={16} />
      </motion.button>

      {/* Product Image */}
      <Link to={`/product/${product.id}`}>
        <div 
          className="relative aspect-[3/4] overflow-hidden"
          style={{ backgroundColor: "var(--bg-tertiary)" }}
        >
          {/* Loading skeleton */}
          {!imageLoaded && (
            <div 
              className="absolute inset-0 animate-pulse"
              style={{ backgroundColor: "var(--bg-tertiary)" }}
            />
          )}
          
          <motion.img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: imageLoaded ? 1 : 0,
              scale: isHovered ? 1.08 : 1 
            }}
            transition={{ duration: 0.4 }}
            onLoad={() => setImageLoaded(true)}
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
            {product.badge && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white rounded"
                style={{ backgroundColor: "var(--color-primary)" }}
              >
                {product.badge}
              </motion.span>
            )}
            {product.discount && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="px-3 py-1 text-xs font-bold text-white rounded"
                style={{ backgroundColor: "var(--color-tertiary)" }}
              >
                -{product.discount}%
              </motion.span>
            )}
          </div>

          {/* Stock Status */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            className="absolute bottom-3 left-3 z-10"
          >
            <span
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full backdrop-blur-sm"
              style={{
                backgroundColor: product.inStock 
                  ? "rgba(34, 197, 94, 0.9)" 
                  : "rgba(239, 68, 68, 0.9)",
                color: "white",
              }}
            >
              {product.inStock ? (
                <>
                  <FiCheck size={12} />
                  In Stock
                </>
              ) : (
                <>
                  <FiAlertCircle size={12} />
                  Out of Stock
                </>
              )}
            </span>
          </motion.div>

          {/* Hover Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"
          />
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-4 space-y-3">
        <div>
          <p 
            className="text-xs uppercase tracking-wider mb-1"
            style={{ color: "var(--text-tertiary)" }}
          >
            {getDisplayCategory(product)}
          </p>
          <Link to={`/product/${product.id}`}>
            <h3 
              className="font-semibold text-base line-clamp-1 hover:underline transition-all"
              style={{ color: "var(--text-primary)" }}
            >
              {product.name}
            </h3>
          </Link>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2">
          <span 
            className="text-lg font-bold"
            style={{ color: "var(--color-primary)" }}
          >
            ${product.price.toFixed(2)}
          </span>
          {product.originalPrice && (
            <span 
              className="text-sm line-through"
              style={{ color: "var(--text-tertiary)" }}
            >
              ${product.originalPrice.toFixed(2)}
            </span>
          )}
        </div>

        {/* Move to Cart Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onMoveToCart(product)}
          disabled={!product.inStock}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-sm uppercase tracking-wide transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: product.inStock ? "var(--color-primary)" : "var(--bg-tertiary)",
            color: product.inStock ? "white" : "var(--text-tertiary)",
          }}
          onMouseEnter={(e) => {
            if (product.inStock) {
              e.currentTarget.style.backgroundColor = "var(--active-color)";
            }
          }}
          onMouseLeave={(e) => {
            if (product.inStock) {
              e.currentTarget.style.backgroundColor = "var(--color-primary)";
            }
          }}
        >
          <FiShoppingBag size={16} />
          {product.inStock ? "Move to Cart" : "Out of Stock"}
        </motion.button>
      </div>
    </motion.div>
  );
};

// Empty Wishlist Component
const EmptyWishlist = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="text-center py-16 md:py-24"
    >
      {/* Empty State Illustration */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
        className="flex justify-center mb-8"
      >
        <div 
          className="relative p-8 rounded-full"
          style={{ backgroundColor: "var(--bg-secondary)" }}
        >
          <FiHeart 
            size={80} 
            style={{ color: "var(--text-tertiary)" }}
            className="opacity-50"
          />
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
            className="absolute -bottom-2 -right-2 p-3 rounded-full"
            style={{ backgroundColor: "var(--bg-primary)" }}
          >
            <FiAlertCircle 
              size={24} 
              style={{ color: "var(--text-tertiary)" }}
            />
          </motion.div>
        </div>
      </motion.div>

      {/* Empty State Text */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-3 mb-8"
      >
        <h2 
          className="text-2xl md:text-3xl font-bold"
          style={{ color: "var(--text-primary)" }}
        >
          Your wishlist is empty
        </h2>
        <p 
          className="text-base max-w-md mx-auto"
          style={{ color: "var(--text-secondary)" }}
        >
          Start adding items you love to your wishlist. Tap the heart icon on any product to save it for later.
        </p>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex flex-col sm:flex-row items-center justify-center gap-4"
      >
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-lg font-semibold text-sm uppercase tracking-wide text-white transition-colors"
          style={{ backgroundColor: "var(--color-primary)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--active-color)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "var(--color-primary)";
          }}
        >
          <FiShoppingBag size={18} />
          Browse Products
        </Link>
        <Link
          to="/category/women"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-lg font-semibold text-sm uppercase tracking-wide transition-colors"
          style={{
            border: "2px solid var(--border-primary)",
            color: "var(--text-primary)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--color-primary)";
            e.currentTarget.style.color = "var(--color-primary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--border-primary)";
            e.currentTarget.style.color = "var(--text-primary)";
          }}
        >
          Explore Collections
        </Link>
      </motion.div>

      {/* Feature Highlights */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto"
      >
        {[
          { icon: FiHeart, title: "Save favorites", desc: "Keep track of items you love" },
          { icon: FiShoppingBag, title: "Easy checkout", desc: "Move items to cart anytime" },
          { icon: FiShare2, title: "Share list", desc: "Send your wishlist to friends" },
        ].map((feature, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 + idx * 0.1 }}
            className="text-center p-4"
          >
            <feature.icon 
              size={24} 
              className="mx-auto mb-2"
              style={{ color: "var(--color-primary)" }}
            />
            <h4 
              className="font-semibold text-sm mb-1"
              style={{ color: "var(--text-primary)" }}
            >
              {feature.title}
            </h4>
            <p 
              className="text-xs"
              style={{ color: "var(--text-tertiary)" }}
            >
              {feature.desc}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default Wishlist;
