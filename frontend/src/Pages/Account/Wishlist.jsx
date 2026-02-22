import { useState } from "react";
import { Link } from "react-router";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "../../utils/animations";
import { FiHeart, FiShoppingBag, FiTrash2, FiEye } from "react-icons/fi";
import { EmptyState } from "../../components";
import toast from "react-hot-toast";
import { getDisplayCategory } from "../../utils/productUtils";
import { useAuth } from "../../context/AuthContext";
import { useWishlist } from "../../context/WishlistContext";
import Loading from "../../components/Loading";

const Wishlist = () => {
  const { isAuthenticated } = useAuth();
  const { wishlistItems, loading, removeFromWishlist } = useWishlist();
  const [removingId, setRemovingId] = useState(null);

  const handleRemove = async (productId) => {
    const item = wishlistItems.find((p) => (p._id || p.id) === productId);
    const name = item?.name || "Item";
    setRemovingId(productId);
    const { success, message } = await removeFromWishlist(productId);
    setRemovingId(null);
    if (success) toast.success(`${name} removed from wishlist`);
    else if (message) toast.error(message);
  };

  if (!isAuthenticated) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-lg text-center"
        style={{ backgroundColor: "var(--bg-secondary)" }}
      >
        <p className="text-lg" style={{ color: "var(--text-secondary)" }}>
          Please log in to view your wishlist.
        </p>
        <Link
          to="/login"
          className="inline-block mt-4 px-6 py-3 rounded-lg font-semibold text-white"
          style={{ backgroundColor: "var(--color-primary)" }}
        >
          Log in
        </Link>
      </motion.div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loading />
      </div>
    );
  }

  const wishlistProducts = wishlistItems || [];

  return (
    <div className="space-y-6">
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeInUp}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <FiHeart size={24} style={{ color: "var(--color-primary)" }} />
          <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            My Wishlist
          </h2>
          <span className="px-3 py-1 text-sm font-semibold rounded-lg" style={{ backgroundColor: "var(--bg-tertiary)", color: "var(--text-secondary)" }}>
            {wishlistProducts.length} items
          </span>
        </div>
        {wishlistProducts.length > 0 && (
          <Link
            to="/"
            className="px-4 py-2 border-2 rounded-lg font-semibold text-sm transition-colors"
            style={{
              borderColor: "var(--border-primary)",
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
        )}
      </motion.div>

      {wishlistProducts.length > 0 ? (
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerContainer}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {wishlistProducts.map((product, index) => {
            const id = product._id || product.id;
            const slug = product.slug || id;
            const imageUrl = Array.isArray(product.images) && product.images.length > 0
              ? product.images[0]
              : "/images/product-placeholder.png";
            const price = product.finalPrice ?? product.price ?? 0;
            const isRemoving = removingId === id;

            return (
              <motion.div
                key={id}
                variants={fadeInUp}
                className="group relative"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="absolute top-4 right-4 z-10 flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 15 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleRemove(id)}
                    disabled={isRemoving}
                    className="p-2 rounded-full backdrop-blur-sm transition-colors disabled:opacity-60"
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                      color: "var(--color-tertiary)",
                    }}
                  >
                    <FiTrash2 size={18} />
                  </motion.button>
                </div>
                <Link to={`/product/${slug}`}>
                  <div className="relative overflow-hidden aspect-[3/4] mb-4 rounded-lg" style={{ backgroundColor: "var(--bg-tertiary)" }}>
                    <img
                      src={imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {product.badge && (
                      <span
                        className="absolute top-4 left-4 px-3 py-1 text-xs font-semibold uppercase text-white z-10"
                        style={{ backgroundColor: "var(--color-primary)" }}
                      >
                        {product.badge}
                      </span>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <motion.div className="flex gap-3">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          className="p-3 rounded-full text-white backdrop-blur-sm"
                          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
                        >
                          <FiEye size={20} />
                        </motion.button>
                        <Link
                          to={`/product/${slug}`}
                          className="p-3 rounded-full text-white"
                          style={{ backgroundColor: "var(--color-primary)" }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <FiShoppingBag size={20} />
                        </Link>
                      </motion.div>
                    </div>
                  </div>
                  <div className="p-4 space-y-2">
                    <p className="text-xs uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
                      {getDisplayCategory(product)}
                    </p>
                    <h3 className="font-semibold group-hover:underline transition-all" style={{ color: "var(--text-primary)" }}>
                      {product.name}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold" style={{ color: "var(--color-primary)" }}>
                        ৳{Number(price).toFixed(2)}
                      </span>
                      {product.originalPrice != null && product.originalPrice > price && (
                        <span className="text-sm line-through" style={{ color: "var(--text-tertiary)" }}>
                          ৳{Number(product.originalPrice).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      ) : (
        <EmptyState
          icon={FiHeart}
          title="Your wishlist is empty"
          description="Start adding items you love to your wishlist"
          actionLabel="Start Shopping"
          actionPath="/"
        />
      )}
    </div>
  );
};

export default Wishlist;
