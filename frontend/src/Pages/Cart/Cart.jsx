import { useState } from "react";
import { Container } from "../../components";
import { productsData } from "../../data/products";
import { motion } from "framer-motion";
import { fadeInUp } from "../../utils/animations";
import { FiTrash2, FiPlus, FiMinus, FiShoppingBag } from "react-icons/fi";
import { Link } from "react-router";

// Fake cart data
const initialCartItems = [
  { id: 1, productId: 1, quantity: 2, size: "M" },
  { id: 2, productId: 3, quantity: 1, size: "L" },
];

const Cart = () => {
  const [cartItems, setCartItems] = useState(initialCartItems);

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

  const shipping = subtotal > 100 ? 0 : 10;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  return (
    <div className="min-h-screen py-16">
      <Container>
        <motion.div
          initial="initial"
          animate="animate"
          variants={fadeInUp}
          className="space-y-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold" style={{ color: "var(--color-primary)" }}>
            Shopping Cart
          </h1>

          {cartItems.length === 0 ? (
            <div className="text-center py-16 space-y-6">
              <p className="text-lg" style={{ color: "var(--text-secondary)" }}>
                Your cart is empty
              </p>
              <Link
                to="/"
                className="inline-block px-8 py-4 text-white font-semibold uppercase tracking-wider"
                style={{ backgroundColor: "var(--color-primary)" }}
              >
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {cartItems.map((item) => {
                  const product = getProduct(item.productId);
                  if (!product) return null;

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col sm:flex-row gap-4 p-6 rounded-lg"
                      style={{ backgroundColor: "var(--bg-secondary)" }}
                    >
                      <div className="w-full sm:w-32 h-32 flex-shrink-0 overflow-hidden rounded" style={{ backgroundColor: "var(--bg-tertiary)" }}>
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-lg mb-1" style={{ color: "var(--text-primary)" }}>
                              {product.name}
                            </h3>
                            <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
                              Size: {item.size}
                            </p>
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-2 hover:bg-red-100 rounded transition-colors"
                            style={{ color: "var(--color-tertiary)" }}
                          >
                            <FiTrash2 size={20} />
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-8 h-8 flex items-center justify-center border rounded"
                              style={{ borderColor: "var(--border-primary)" }}
                            >
                              <FiMinus size={16} />
                            </button>
                            <span className="w-12 text-center font-semibold" style={{ color: "var(--text-primary)" }}>
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-8 h-8 flex items-center justify-center border rounded"
                              style={{ borderColor: "var(--border-primary)" }}
                            >
                              <FiPlus size={16} />
                            </button>
                          </div>
                          <span className="text-xl font-bold" style={{ color: "var(--color-primary)" }}>
                            ${(product.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="sticky top-24 p-6 rounded-lg space-y-6" style={{ backgroundColor: "var(--bg-secondary)" }}>
                  <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                    Order Summary
                  </h2>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span style={{ color: "var(--text-secondary)" }}>Subtotal</span>
                      <span style={{ color: "var(--text-primary)" }}>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: "var(--text-secondary)" }}>Shipping</span>
                      <span style={{ color: "var(--text-primary)" }}>
                        {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
                      </span>
                    </div>
                    <div className="flex justify-between">
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
                  <Link
                    to="/checkout"
                    className="block w-full px-6 py-4 text-center text-white font-semibold uppercase tracking-wider"
                    style={{ backgroundColor: "var(--color-primary)" }}
                  >
                    Proceed to Checkout
                  </Link>
                  <Link
                    to="/"
                    className="block w-full px-6 py-4 text-center border rounded font-semibold uppercase tracking-wider"
                    style={{
                      borderColor: "var(--border-primary)",
                      color: "var(--text-primary)",
                    }}
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </Container>
    </div>
  );
};

export default Cart;
