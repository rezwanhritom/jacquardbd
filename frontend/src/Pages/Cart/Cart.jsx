import { useState } from "react";
import { Container } from "../../components";
import { productsData } from "../../data/products";
import { motion, AnimatePresence } from "framer-motion";
import { fadeInUp, staggerContainer } from "../../utils/animations";
import { FiTrash2, FiPlus, FiMinus, FiShoppingBag, FiTag, FiX, FiCheck } from "react-icons/fi";
import { Link } from "react-router";

// Fake cart data
const initialCartItems = [
  { id: 1, productId: 1, quantity: 2, size: "M", color: "Black" },
  { id: 2, productId: 3, quantity: 1, size: "L", color: "Navy" },
];

// Fake coupon codes
const availableCoupons = [
  { code: "SAVE10", discount: 10, type: "percentage", minPurchase: 50 },
  { code: "WELCOME20", discount: 20, type: "percentage", minPurchase: 100 },
  { code: "FREESHIP", discount: 0, type: "shipping", minPurchase: 0 },
];

const Cart = () => {
  const [cartItems, setCartItems] = useState(initialCartItems);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [showCouponInput, setShowCouponInput] = useState(false);

  const getProduct = (productId) => {
    return productsData.find((p) => p.id === productId);
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    setCartItems((items) =>
      items.map((item) => (item.id === itemId ? { ...item, quantity: newQuantity } : item))
    );
  };

  const removeItem = (itemId) => {
    setCartItems((items) => items.filter((item) => item.id !== itemId));
  };

  const subtotal = cartItems.reduce((sum, item) => {
    const product = getProduct(item.productId);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);

  const applyCoupon = () => {
    setCouponError("");
    const coupon = availableCoupons.find((c) => c.code.toUpperCase() === couponCode.toUpperCase());
    
    if (!coupon) {
      setCouponError("Invalid coupon code");
      return;
    }

    if (subtotal < coupon.minPurchase) {
      setCouponError(`Minimum purchase of $${coupon.minPurchase} required`);
      return;
    }

    setAppliedCoupon(coupon);
    setCouponCode("");
    setShowCouponInput(false);
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
  };

  const calculateDiscount = () => {
    if (!appliedCoupon) return 0;
    
    if (appliedCoupon.type === "percentage") {
      return (subtotal * appliedCoupon.discount) / 100;
    }
    return 0;
  };

  const discount = calculateDiscount();
  const shipping = appliedCoupon?.type === "shipping" ? 0 : subtotal > 100 ? 0 : 10;
  const tax = (subtotal - discount) * 0.08;
  const total = subtotal - discount + shipping + tax;

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
            <h1 className="text-4xl md:text-5xl font-bold" style={{ color: "var(--color-primary)" }}>
              Shopping Cart
            </h1>
            <p className="text-sm mt-2" style={{ color: "var(--text-secondary)" }}>
              {cartItems.length} item{cartItems.length !== 1 ? "s" : ""} in your cart
            </p>
          </motion.div>

          {cartItems.length === 0 ? (
            <motion.div
              variants={fadeInUp}
              className="text-center py-16 space-y-6"
            >
              <p className="text-lg" style={{ color: "var(--text-secondary)" }}>
                Your cart is empty
              </p>
              <Link
                to="/"
                className="inline-block px-8 py-4 text-white font-semibold uppercase tracking-wider rounded-lg"
                style={{ backgroundColor: "var(--color-primary)" }}
              >
                Continue Shopping
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                <AnimatePresence>
                  {cartItems.map((item, index) => {
                    const product = getProduct(item.productId);
                    if (!product) return null;

                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100, scale: 0.8 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex flex-col sm:flex-row gap-4 p-6 rounded-lg"
                        style={{ backgroundColor: "var(--bg-secondary)" }}
                      >
                        <Link
                          to={`/product/${product.id}`}
                          className="w-full sm:w-32 h-32 flex-shrink-0 overflow-hidden rounded-lg group"
                          style={{ backgroundColor: "var(--bg-tertiary)" }}
                        >
                          <motion.img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            whileHover={{ scale: 1.1 }}
                            transition={{ duration: 0.3 }}
                          />
                        </Link>
                        <div className="flex-1 space-y-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <Link
                                to={`/product/${product.id}`}
                                className="font-semibold text-lg mb-1 block hover:underline transition-colors"
                                style={{ color: "var(--text-primary)" }}
                              >
                                {product.name}
                              </Link>
                              <div className="flex gap-4 text-sm" style={{ color: "var(--text-tertiary)" }}>
                                <span>Size: {item.size}</span>
                                {item.color && <span>Color: {item.color}</span>}
                              </div>
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.1, rotate: 15 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => removeItem(item.id)}
                              className="p-2 rounded-lg transition-colors"
                              style={{ color: "var(--color-tertiary)" }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.1)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = "transparent";
                              }}
                            >
                              <FiTrash2 size={20} />
                            </motion.button>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="w-10 h-10 flex items-center justify-center border-2 rounded-lg transition-colors"
                                style={{ borderColor: "var(--border-primary)" }}
                              >
                                <FiMinus size={16} style={{ color: "var(--text-primary)" }} />
                              </motion.button>
                              <span className="w-12 text-center font-semibold text-lg" style={{ color: "var(--text-primary)" }}>
                                {item.quantity}
                              </span>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="w-10 h-10 flex items-center justify-center border-2 rounded-lg transition-colors"
                                style={{ borderColor: "var(--border-primary)" }}
                              >
                                <FiPlus size={16} style={{ color: "var(--text-primary)" }} />
                              </motion.button>
                            </div>
                            <div className="text-right">
                              <span className="text-xl font-bold block" style={{ color: "var(--color-primary)" }}>
                                ${(product.price * item.quantity).toFixed(2)}
                              </span>
                              {product.originalPrice && (
                                <span className="text-sm line-through" style={{ color: "var(--text-tertiary)" }}>
                                  ${(product.originalPrice * item.quantity).toFixed(2)}
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

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="sticky top-24 space-y-6"
                >
                  <div className="p-6 rounded-lg space-y-6" style={{ backgroundColor: "var(--bg-secondary)" }}>
                    <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                      Order Summary
                    </h2>

                    {/* Coupon Section */}
                    <div className="space-y-3">
                      {!appliedCoupon ? (
                        <>
                          {!showCouponInput ? (
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => setShowCouponInput(true)}
                              className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 rounded-lg transition-colors"
                              style={{
                                borderColor: "var(--border-primary)",
                                color: "var(--text-primary)",
                              }}
                            >
                              <FiTag size={18} />
                              <span className="text-sm font-semibold">Have a coupon code?</span>
                            </motion.button>
                          ) : (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="space-y-2"
                            >
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={couponCode}
                                  onChange={(e) => setCouponCode(e.target.value)}
                                  placeholder="Enter coupon code"
                                  className="flex-1 px-4 py-2 border-2 rounded-lg outline-none text-sm"
                                  style={{
                                    borderColor: couponError ? "var(--color-tertiary)" : "var(--border-primary)",
                                    backgroundColor: "var(--bg-primary)",
                                    color: "var(--text-primary)",
                                  }}
                                  onKeyPress={(e) => e.key === "Enter" && applyCoupon()}
                                />
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={applyCoupon}
                                  className="px-4 py-2 rounded-lg text-white font-semibold text-sm"
                                  style={{ backgroundColor: "var(--color-primary)" }}
                                >
                                  Apply
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => {
                                    setShowCouponInput(false);
                                    setCouponCode("");
                                    setCouponError("");
                                  }}
                                  className="p-2 rounded-lg"
                                  style={{ color: "var(--text-secondary)" }}
                                >
                                  <FiX size={18} />
                                </motion.button>
                              </div>
                              {couponError && (
                                <motion.p
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="text-xs"
                                  style={{ color: "var(--color-tertiary)" }}
                                >
                                  {couponError}
                                </motion.p>
                              )}
                            </motion.div>
                          )}
                        </>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex items-center justify-between p-3 rounded-lg"
                          style={{ backgroundColor: "var(--color-primary)", color: "white" }}
                        >
                          <div className="flex items-center gap-2">
                            <FiCheck size={18} />
                            <span className="text-sm font-semibold">{appliedCoupon.code}</span>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={removeCoupon}
                            className="p-1"
                          >
                            <FiX size={16} />
                          </motion.button>
                        </motion.div>
                      )}
                    </div>

                    {/* Price Breakdown */}
                    <div className="space-y-3 pt-4 border-t" style={{ borderColor: "var(--border-primary)" }}>
                      <div className="flex justify-between text-sm">
                        <span style={{ color: "var(--text-secondary)" }}>Subtotal</span>
                        <span style={{ color: "var(--text-primary)" }}>${subtotal.toFixed(2)}</span>
                      </div>
                      {discount > 0 && (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex justify-between text-sm"
                          style={{ color: "var(--color-tertiary)" }}
                        >
                          <span>Discount ({appliedCoupon.discount}%)</span>
                          <span>-${discount.toFixed(2)}</span>
                        </motion.div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span style={{ color: "var(--text-secondary)" }}>Shipping</span>
                        <span style={{ color: "var(--text-primary)" }}>
                          {shipping === 0 ? (
                            <span className="text-green-600 font-semibold">Free</span>
                          ) : (
                            `$${shipping.toFixed(2)}`
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span style={{ color: "var(--text-secondary)" }}>Tax</span>
                        <span style={{ color: "var(--text-primary)" }}>${tax.toFixed(2)}</span>
                      </div>
                      <div className="pt-3 border-t" style={{ borderColor: "var(--border-primary)" }}>
                        <div className="flex justify-between text-lg font-bold">
                          <span style={{ color: "var(--text-primary)" }}>Total</span>
                          <span style={{ color: "var(--color-primary)" }}>${total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
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

export default Cart;
