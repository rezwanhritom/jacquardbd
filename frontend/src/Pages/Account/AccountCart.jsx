import { useState, useEffect } from "react";
import { Link } from "react-router";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "../../utils/animations";
import { FiShoppingCart, FiTrash2, FiMinus, FiPlus, FiShoppingBag } from "react-icons/fi";
import { EmptyState } from "../../components";
import toast from "react-hot-toast";
import { getCart, updateCartQuantity, removeFromCart } from "../../services/cart.service";
import Loading from "../../components/Loading";

const AccountCart = () => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [removingId, setRemovingId] = useState(null);

  const fetchCart = async () => {
    const res = await getCart();
    if (res.success && Array.isArray(res.cart)) {
      setCart(res.cart);
    } else {
      setCart([]);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchCart().finally(() => setLoading(false));
  }, []);

  const handleQuantityChange = async (productId, newQty) => {
    const qty = Math.max(1, Math.floor(Number(newQty)));
    setUpdatingId(productId);
    const res = await updateCartQuantity(productId, qty);
    setUpdatingId(null);
    if (res.success && Array.isArray(res.cart)) {
      setCart(res.cart);
      toast.success("Cart updated");
    } else if (res.message) {
      toast.error(res.message);
    }
  };

  const handleRemove = async (productId) => {
    setRemovingId(productId);
    const res = await removeFromCart(productId);
    setRemovingId(null);
    if (res.success && Array.isArray(res.cart)) {
      setCart(res.cart);
      toast.success("Removed from cart");
    } else if (res.message) {
      toast.error(res.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loading />
      </div>
    );
  }

  const cartItems = cart || [];
  const subtotal = cartItems.reduce((sum, item) => {
    const p = item.product;
    const price = p?.finalPrice ?? p?.price ?? 0;
    return sum + price * (item.quantity || 0);
  }, 0);

  return (
    <div className="space-y-6">
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeInUp}
        className="flex items-center justify-between flex-wrap gap-4"
      >
        <div className="flex items-center gap-3">
          <FiShoppingCart size={24} style={{ color: "var(--color-primary)" }} />
          <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            My Cart
          </h2>
          <span className="px-3 py-1 text-sm font-semibold rounded-lg" style={{ backgroundColor: "var(--bg-tertiary)", color: "var(--text-secondary)" }}>
            {cartItems.length} item{cartItems.length !== 1 ? "s" : ""}
          </span>
        </div>
        {cartItems.length > 0 && (
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="px-4 py-2 border-2 rounded-lg font-semibold text-sm transition-colors"
              style={{ borderColor: "var(--border-primary)", color: "var(--text-primary)" }}
            >
              Continue Shopping
            </Link>
            <Link
              to="/checkout"
              className="px-4 py-2 rounded-lg font-semibold text-sm text-white transition-colors"
              style={{ backgroundColor: "var(--color-primary)" }}
            >
              Proceed to Checkout
            </Link>
          </div>
        )}
      </motion.div>

      {cartItems.length > 0 ? (
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerContainer}
          className="space-y-6"
        >
          <div className="space-y-4">
            {cartItems.map((item, index) => {
              const product = item.product;
              const productId = product?._id || product?.id;
              const slug = product?.slug || productId;
              const imageUrl = Array.isArray(product?.images) && product.images.length > 0
                ? product.images[0]
                : "/images/product-placeholder.png";
              const price = product?.finalPrice ?? product?.price ?? 0;
              const qty = item.quantity ?? 1;
              const lineTotal = price * qty;
              const stock = product?.stockQuantity ?? 99;
              const isUpdating = updatingId === productId;
              const isRemoving = removingId === productId;

              return (
                <motion.div
                  key={productId}
                  variants={fadeInUp}
                  className="p-4 rounded-lg border-2 flex flex-col sm:flex-row gap-4 sm:items-center"
                  style={{ borderColor: "var(--border-primary)", backgroundColor: "var(--bg-secondary)" }}
                >
                  <Link to={`/product/${slug}`} className="flex-shrink-0 w-full sm:w-24 aspect-square rounded-lg overflow-hidden" style={{ backgroundColor: "var(--bg-tertiary)" }}>
                    <img src={imageUrl} alt={product?.name} className="w-full h-full object-cover" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/product/${slug}`} className="font-semibold hover:underline block truncate" style={{ color: "var(--text-primary)" }}>
                      {product?.name ?? "Product"}
                    </Link>
                    <p className="text-lg font-bold mt-1" style={{ color: "var(--color-primary)" }}>
                      ৳{Number(price).toFixed(2)} each
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center border-2 rounded-lg" style={{ borderColor: "var(--border-primary)" }}>
                      <button
                        type="button"
                        disabled={qty <= 1 || isUpdating}
                        onClick={() => handleQuantityChange(productId, qty - 1)}
                        className="p-2 disabled:opacity-50 transition-colors"
                        style={{ color: "var(--text-primary)" }}
                      >
                        <FiMinus size={16} />
                      </button>
                      <span className="px-3 py-1 min-w-[2.5rem] text-center text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                        {qty}
                      </span>
                      <button
                        type="button"
                        disabled={qty >= stock || isUpdating}
                        onClick={() => handleQuantityChange(productId, qty + 1)}
                        className="p-2 disabled:opacity-50 transition-colors"
                        style={{ color: "var(--text-primary)" }}
                      >
                        <FiPlus size={16} />
                      </button>
                    </div>
                    <span className="font-bold" style={{ color: "var(--color-primary)" }}>
                      ৳{Number(lineTotal).toFixed(2)}
                    </span>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleRemove(productId)}
                      disabled={isRemoving}
                      className="p-2 rounded-lg transition-colors disabled:opacity-60"
                      style={{ color: "var(--text-tertiary)" }}
                      title="Remove"
                    >
                      <FiTrash2 size={18} />
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            variants={fadeInUp}
            className="p-6 rounded-lg border-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            style={{ borderColor: "var(--border-primary)", backgroundColor: "var(--bg-secondary)" }}
          >
            <p className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
              Subtotal ({cartItems.length} item{cartItems.length !== 1 ? "s" : ""}):{" "}
              <span style={{ color: "var(--color-primary)" }}>৳{Number(subtotal).toFixed(2)}</span>
            </p>
            <Link
              to="/checkout"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-white"
              style={{ backgroundColor: "var(--color-primary)" }}
            >
              <FiShoppingBag size={20} />
              Proceed to Checkout
            </Link>
          </motion.div>
        </motion.div>
      ) : (
        <EmptyState
          icon={FiShoppingCart}
          title="Your cart is empty"
          description="Add items from the shop to your cart"
          actionLabel="Start Shopping"
          actionPath="/"
        />
      )}
    </div>
  );
};

export default AccountCart;
