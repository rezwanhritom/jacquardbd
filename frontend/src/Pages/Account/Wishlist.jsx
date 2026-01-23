import { Link } from "react-router";
import { Container } from "../../components";
import { productsData } from "../../data/products";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "../../utils/animations";
import { FiHeart, FiShoppingBag, FiTrash2 } from "react-icons/fi";

// Fake wishlist data
const wishlistItems = [1, 2, 5, 7];

const Wishlist = () => {
  const wishlistProducts = productsData.filter((p) => wishlistItems.includes(p.id));

  return (
    <div className="space-y-6">
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeInUp}
        className="flex items-center space-x-3 mb-6"
      >
        <FiHeart size={24} style={{ color: "var(--color-primary)" }} />
        <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
          My Wishlist
        </h2>
      </motion.div>

      {wishlistProducts.length > 0 ? (
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerContainer}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {wishlistProducts.map((product) => (
            <motion.div
              key={product.id}
              variants={fadeInUp}
              className="group relative"
              style={{ backgroundColor: "var(--bg-primary)" }}
            >
              <button
                className="absolute top-4 right-4 z-10 p-2 rounded-full transition-colors"
                style={{ backgroundColor: "var(--bg-primary)", color: "var(--color-primary)" }}
              >
                <FiTrash2 size={20} />
              </button>
              <Link to={`/product/${product.id}`}>
                <div className="relative overflow-hidden aspect-[3/4] mb-4" style={{ backgroundColor: "var(--bg-tertiary)" }}>
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {product.badge && (
                    <span
                      className="absolute top-4 left-4 px-3 py-1 text-xs font-semibold uppercase text-white"
                      style={{ backgroundColor: "var(--color-primary)" }}
                    >
                      {product.badge}
                    </span>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-3 rounded-full text-white"
                      style={{ backgroundColor: "var(--color-primary)" }}
                    >
                      <FiShoppingBag size={20} />
                    </motion.div>
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  <p className="text-xs uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
                    {product.category}
                  </p>
                  <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>
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
        <div className="text-center py-12">
          <FiHeart size={48} className="mx-auto mb-4" style={{ color: "var(--text-tertiary)" }} />
          <p style={{ color: "var(--text-secondary)" }}>Your wishlist is empty</p>
          <Link
            to="/"
            className="inline-block mt-4 px-6 py-3 text-white font-semibold uppercase tracking-wider rounded-lg"
            style={{ backgroundColor: "var(--color-primary)" }}
          >
            Start Shopping
          </Link>
        </div>
      )}
    </div>
  );
};

export default Wishlist;
