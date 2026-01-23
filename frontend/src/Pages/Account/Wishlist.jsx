import { useState } from "react";
import { Link } from "react-router";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "../../utils/animations";
import { FiHeart, FiShoppingBag, FiTrash2, FiEye } from "react-icons/fi";
import { productsData } from "../../data/products";

// Fake wishlist data
const wishlistItems = [1, 2, 5, 7, 8, 10];

const Wishlist = () => {
  const [wishlist, setWishlist] = useState(wishlistItems);
  const wishlistProducts = productsData.filter((p) => wishlist.includes(p.id));

  const handleRemove = (productId) => {
    setWishlist(wishlist.filter((id) => id !== productId));
  };

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
          {wishlistProducts.map((product, index) => (
            <motion.div
              key={product.id}
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
                  onClick={() => handleRemove(product.id)}
                  className="p-2 rounded-full backdrop-blur-sm transition-colors"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    color: "var(--color-tertiary)",
                  }}
                >
                  <FiTrash2 size={18} />
                </motion.button>
              </div>
              <Link to={`/product/${product.id}`}>
                <div className="relative overflow-hidden aspect-[3/4] mb-4 rounded-lg" style={{ backgroundColor: "var(--bg-tertiary)" }}>
                  <img
                    src={product.images[0]}
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
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        className="p-3 rounded-full text-white"
                        style={{ backgroundColor: "var(--color-primary)" }}
                      >
                        <FiShoppingBag size={20} />
                      </motion.button>
                    </motion.div>
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  <p className="text-xs uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
                    {product.category}
                  </p>
                  <h3 className="font-semibold group-hover:underline transition-all" style={{ color: "var(--text-primary)" }}>
                    {product.name}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold" style={{ color: "var(--color-primary)" }}>
                      ${product.price.toFixed(2)}
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm line-through" style={{ color: "var(--text-tertiary)" }}>
                        ${product.originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          initial="initial"
          animate="animate"
          variants={fadeInUp}
          className="text-center py-16 space-y-6"
        >
          <FiHeart size={64} className="mx-auto" style={{ color: "var(--text-tertiary)" }} />
          <div>
            <p className="text-lg font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
              Your wishlist is empty
            </p>
            <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
              Start adding items you love to your wishlist
            </p>
          </div>
          <Link
            to="/"
            className="inline-block px-8 py-4 text-white font-semibold uppercase tracking-wider rounded-lg"
            style={{ backgroundColor: "var(--color-primary)" }}
          >
            Start Shopping
          </Link>
        </motion.div>
      )}
    </div>
  );
};

export default Wishlist;
