import { useState } from "react";
import { Container } from "../../components";
import { motion, AnimatePresence } from "framer-motion";
import { fadeInUp, staggerContainer } from "../../utils/animations";
import { FiTrash2, FiPlus, FiMinus, FiShoppingBag, FiShoppingCart } from "react-icons/fi";
import { Link } from "react-router";
import toast from "react-hot-toast";
import { useCart } from "../../context/CartContext";
import Loading from "../../components/Loading";
import { hasDiscount } from "../../utils/productUtils";

const Cart = () => {
  const { cartItems, loading, updateQuantity, removeFromCart, getCartTotal } = useCart();
  const [removingId, setRemovingId] = useState(null);

  const subtotal = getCartTotal();

  const handleUpdateQty = (item, newQty) => {
    const id = item.product?._id ?? item.product?.id;
    if (newQty < 1) return;
    const stock = item.product?.stockQuantity ?? 999;
    const qty = Math.min(newQty, Math.max(1, stock));
    updateQuantity(id, qty).then(({ success }) => {
      if (!success) toast.error("Failed to update quantity");
    });
  };

  const handleRemove = (item) => {
    const id = item.product?._id ?? item.product?.id;
    const name = item.product?.name;
    setRemovingId(id);
    removeFromCart(id).then(({ success }) => {
      setRemovingId(null);
      if (success) toast.success(`${name || "Item"} removed from cart`);
    });
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16">
      <Container>
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerContainer}
          className="space-y-8"
        >
          <motion.div variants={fadeInUp}>
            <h1 className="text-4xl md:text-5xl font-bold" style={{ color: "var(--text-primary)" }}>
              Shopping Cart
            </h1>
            <p className="text-sm mt-2" style={{ color: "var(--text-secondary)" }}>
              {cartItems.length} item{cartItems.length !== 1 ? "s" : ""} in your cart
            </p>
          </motion.div>

          {cartItems.length === 0 ? (
            <EmptyCart />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <AnimatePresence mode="popLayout">
                  {cartItems.map((item, index) => {
                    const product = item.product;
                    const id = product?._id ?? product?.id;
                    const slugOrId = product?.slug || id;
                    const imageUrl = Array.isArray(product?.images) && product.images.length > 0
                      ? product.images[0]
                      : "/images/product-placeholder.png";
                    const price = product?.finalPrice ?? product?.price ?? 0;
                    const isRemoving = removingId === id;

                    return (
                      <motion.div
                        key={id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: isRemoving ? 0 : 1, y: 0, x: isRemoving ? -100 : 0 }}
                        exit={{ opacity: 0, x: -100, scale: 0.8 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex flex-col sm:flex-row gap-4 p-6 rounded-lg"
                        style={{ backgroundColor: "var(--bg-secondary)" }}
                      >
                        <Link
                          to={`/product/${slugOrId}`}
                          className="w-full sm:w-32 h-32 flex-shrink-0 overflow-hidden rounded-lg"
                          style={{ backgroundColor: "var(--bg-tertiary)" }}
                        >
                          <motion.img
                            src={imageUrl}
                            alt={product?.name}
                            className="w-full h-full object-cover"
                            whileHover={{ scale: 1.1 }}
                            transition={{ duration: 0.3 }}
                          />
                        </Link>
                        <div className="flex-1 space-y-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <Link
                                to={`/product/${slugOrId}`}
                                className="font-semibold text-lg mb-1 block hover:underline transition-colors"
                                style={{ color: "var(--text-primary)" }}
                              >
                                {product?.name}
                              </Link>
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.1, rotate: 15 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleRemove(item)}
                              className="p-2 rounded-lg transition-colors"
                              style={{ color: "var(--color-tertiary)" }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.1)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = "transparent";
                              }}
                              aria-label={`Remove ${product?.name} from cart`}
                            >
                              <FiTrash2 size={20} />
                            </motion.button>
                          </div>
                          <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-3">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleUpdateQty(item, item.quantity - 1)}
                                className="w-10 h-10 flex items-center justify-center border-2 rounded-lg transition-colors"
                                style={{ borderColor: "var(--border-primary)" }}
                                aria-label="Decrease quantity"
                              >
                                <FiMinus size={16} style={{ color: "var(--text-primary)" }} />
                              </motion.button>
                              <span
                                className="w-12 text-center font-semibold text-lg"
                                style={{ color: "var(--text-primary)" }}
                              >
                                {item.quantity}
                              </span>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleUpdateQty(item, item.quantity + 1)}
                                className="w-10 h-10 flex items-center justify-center border-2 rounded-lg transition-colors"
                                style={{ borderColor: "var(--border-primary)" }}
                                aria-label="Increase quantity"
                              >
                                <FiPlus size={16} style={{ color: "var(--text-primary)" }} />
                              </motion.button>
                            </div>
                            <div className="text-right">
                              <span
                                className="text-xl font-bold block"
                                style={{ color: "var(--color-primary)" }}
                              >
                                ৳{(price * item.quantity).toFixed(2)}
                              </span>
                              {hasDiscount(product) && product?.originalPrice != null && (
                                <span
                                  className="text-sm line-through block"
                                  style={{ color: "var(--text-tertiary)" }}
                                >
                                  ৳{(product.originalPrice * item.quantity).toFixed(2)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              <div className="lg:col-span-1">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="sticky top-24 space-y-6"
                >
                  <div
                    className="p-6 rounded-lg space-y-6"
                    style={{ backgroundColor: "var(--bg-secondary)" }}
                  >
                    <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                      Order Summary
                    </h2>
                    <div className="space-y-3 pt-4 border-t" style={{ borderColor: "var(--border-primary)" }}>
                      <div className="flex justify-between text-sm">
                        <span style={{ color: "var(--text-secondary)" }}>Subtotal</span>
                        <span style={{ color: "var(--text-primary)" }}>৳{subtotal.toFixed(2)}</span>
                      </div>
                      <div className="pt-3 border-t" style={{ borderColor: "var(--border-primary)" }}>
                        <div className="flex justify-between text-lg font-bold">
                          <span style={{ color: "var(--text-primary)" }}>Total</span>
                          <span style={{ color: "var(--color-primary)" }}>৳{subtotal.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3 pt-4">
                      <Link
                        to="/checkout"
                        className="block w-full px-6 py-4 text-center text-white font-semibold uppercase tracking-wider rounded-lg transition-colors"
                        style={{ backgroundColor: "var(--color-primary)" }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "var(--active-color)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "var(--color-primary)";
                        }}
                      >
                        Proceed to Checkout
                      </Link>
                      <Link
                        to="/"
                        className="block w-full px-6 py-4 text-center border-2 rounded-lg font-semibold uppercase tracking-wider transition-colors"
                        style={{
                          borderColor: "var(--border-primary)",
                          color: "var(--text-primary)",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "var(--bg-tertiary)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                        }}
                      >
                        Continue Shopping
                      </Link>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          )}
        </motion.div>
      </Container>
    </div>
  );
};

function EmptyCart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center py-16 md:py-24 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
        className="p-8 rounded-full mb-6"
        style={{ backgroundColor: "var(--bg-secondary)" }}
      >
        <FiShoppingCart size={80} style={{ color: "var(--text-tertiary)" }} className="opacity-70" />
      </motion.div>
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-2xl md:text-3xl font-bold mb-2"
        style={{ color: "var(--text-primary)" }}
      >
        Your cart is empty
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-base max-w-md mx-auto mb-8"
        style={{ color: "var(--text-secondary)" }}
      >
        Your selection awaits refinement.
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-sm tracking-wide transition-colors border-2"
          style={{
            borderColor: "var(--border-secondary)",
            color: "var(--text-primary)",
            backgroundColor: "var(--bg-secondary)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--bg-tertiary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "var(--bg-secondary)";
          }}
        >
          <FiShoppingBag size={18} />
          Continue Shopping
        </Link>
      </motion.div>
    </motion.div>
  );
}

export default Cart;
