import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "../../utils/animations";
import { downloadOrderInvoice } from "../../utils/orderInvoicePdf";
import { FiPackage, FiCreditCard, FiMapPin, FiChevronLeft, FiDownload } from "react-icons/fi";
import { getMyOrderById } from "../../services/orders.service";

function getStatusColor(status) {
  switch (status) {
    case "paid":
    case "delivered":
      return "var(--color-primary)";
    case "confirmed":
    case "shipped":
      return "var(--color-secondary)";
    case "pending":
      return "var(--color-tertiary)";
    case "cancelled":
    case "failed":
      return "var(--text-tertiary)";
    default:
      return "var(--text-tertiary)";
  }
}

function formatStatus(status) {
  if (!status) return "—";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function getPaymentStatusDisplay(order) {
  const ps = order.paymentStatus || (order.status === "paid" ? "paid" : order.status === "cancelled" ? "cancelled" : "pending");
  return formatStatus(ps);
}

const OrderDetail = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }
    getMyOrderById(orderId)
      .then((res) => {
        if (res.success) setOrder(res.order);
        else setError(res.message || "Order not found");
      })
      .catch(() => setError("Failed to load order"))
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16" style={{ color: "var(--text-secondary)" }}>
        Loading order…
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="text-center py-16 space-y-4">
        <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
          {error || "Order not found"}
        </h2>
        <Link
          to="/account/orders"
          className="inline-block px-6 py-3 text-white font-semibold rounded-lg"
          style={{ backgroundColor: "var(--color-primary)" }}
        >
          Back to Orders
        </Link>
      </div>
    );
  }

  const addr = order.shippingAddress || {};
  const items = order.items || [];

  return (
    <div className="space-y-6">
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeInUp}
        className="flex items-center justify-between flex-wrap gap-4"
      >
        <div className="flex items-center gap-4">
          <Link
            to="/account/orders"
            className="p-2 rounded-lg transition-colors"
            style={{ color: "var(--text-secondary)" }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--bg-secondary)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
          >
            <FiChevronLeft size={24} />
          </Link>
          <div>
            <h2 className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
              {order.orderId}
            </h2>
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
              Placed on {new Date(order.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span
            className="px-4 py-2 text-sm font-semibold uppercase rounded-lg"
            style={{
              backgroundColor: getStatusColor(order.status) + "20",
              color: getStatusColor(order.status),
            }}
          >
            {formatStatus(order.status)}
          </span>
          <motion.button
            type="button"
            onClick={() => downloadOrderInvoice({ ...order, total: order.total ?? order.amount })}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2 border-2 rounded-lg font-semibold text-sm"
            style={{ borderColor: "var(--border-primary)", color: "var(--text-primary)" }}
          >
            <FiDownload size={18} />
            Download invoice
          </motion.button>
        </div>
      </motion.div>

      <motion.div
        initial="initial"
        animate="animate"
        variants={staggerContainer}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        <div className="lg:col-span-2 space-y-6">
          <motion.div
            variants={fadeInUp}
            className="p-6 rounded-lg space-y-4"
            style={{ backgroundColor: "var(--bg-secondary)" }}
          >
            <div className="flex items-center gap-3 mb-4">
              <FiPackage size={24} style={{ color: "var(--color-primary)" }} />
              <h3 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                Order Items
              </h3>
            </div>
            <div className="space-y-4">
              {items.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex gap-4 p-4 rounded-lg"
                  style={{ backgroundColor: "var(--bg-primary)" }}
                >
                  <div className="flex-1">
                    <p className="font-semibold text-lg mb-1" style={{ color: "var(--text-primary)" }}>
                      {item.name ?? "Item"}
                    </p>
                    <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                      Quantity: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold" style={{ color: "var(--color-primary)" }}>
                      ৳{((item.price ?? 0) * (item.quantity ?? 0)).toFixed(2)}
                    </p>
                    <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                      ৳{(item.price ?? 0).toFixed(2)} each
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {(addr.address || addr.name) && (
            <motion.div
              variants={fadeInUp}
              className="p-6 rounded-lg space-y-4"
              style={{ backgroundColor: "var(--bg-secondary)" }}
            >
              <div className="flex items-center gap-3 mb-4">
                <FiMapPin size={24} style={{ color: "var(--color-primary)" }} />
                <h3 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                  Shipping Address
                </h3>
              </div>
              <div className="space-y-1 text-sm" style={{ color: "var(--text-secondary)" }}>
                {addr.name && <p className="font-semibold" style={{ color: "var(--text-primary)" }}>{addr.name}</p>}
                {addr.address && <p>{addr.address}</p>}
                {(addr.city || addr.state || addr.zip) && (
                  <p>{[addr.city, addr.state, addr.zip].filter(Boolean).join(", ")}</p>
                )}
                {addr.phone && <p className="pt-2">{addr.phone}</p>}
              </div>
            </motion.div>
          )}

          <motion.div
            variants={fadeInUp}
            className="p-6 rounded-lg space-y-4"
            style={{ backgroundColor: "var(--bg-secondary)" }}
          >
            <div className="flex items-center gap-3 mb-4">
              <FiCreditCard size={24} style={{ color: "var(--color-primary)" }} />
              <h3 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                Payment
              </h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Payment status</span>
                <span className="text-sm font-semibold" style={{ color: order.paymentStatus === "paid" || order.status === "paid" || order.status === "delivered" ? "var(--color-primary)" : order.paymentStatus === "cancelled" ? "var(--text-tertiary)" : "var(--text-primary)" }}>
                  {getPaymentStatusDisplay(order)}
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="lg:col-span-1">
          <motion.div
            variants={fadeInUp}
            className="sticky top-24 p-6 rounded-lg space-y-4"
            style={{ backgroundColor: "var(--bg-secondary)" }}
          >
            <h3 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
              Order Summary
            </h3>
            <div className="space-y-3 pt-4 border-t" style={{ borderColor: "var(--border-primary)" }}>
              {order.couponCode && Number(order.couponDiscount) > 0 && (
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span style={{ color: "var(--text-secondary)" }}>Coupon</span>
                    <span className="font-mono font-semibold" style={{ color: "var(--color-primary)" }}>
                      {order.couponCode}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: "var(--text-secondary)" }}>Discount</span>
                    <span style={{ color: "var(--color-primary)" }}>−৳{Number(order.couponDiscount).toFixed(2)}</span>
                  </div>
                </div>
              )}
              <div className="pt-3 border-t" style={{ borderColor: "var(--border-primary)" }}>
                <div className="flex justify-between text-lg font-bold">
                  <span style={{ color: "var(--text-primary)" }}>Total</span>
                  <span style={{ color: "var(--color-primary)" }}>
                    ৳{Number(order.total).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default OrderDetail;
