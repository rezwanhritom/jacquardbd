import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "../../utils/animations";
import { FiPackage, FiCreditCard, FiMapPin, FiChevronLeft, FiSave } from "react-icons/fi";
import { getAdminOrderById, updateOrder, updateOrderStatus } from "../../services/orders.service";
import toast from "react-hot-toast";

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "cancelled", label: "Cancelled" },
  { value: "confirmed", label: "Confirmed" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
];

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

const AdminOrderDetail = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  // Editable state: items (quantity per item), shipping address
  const [items, setItems] = useState([]);
  const [shippingAddress, setShippingAddress] = useState({ name: "", phone: "", address: "", city: "", state: "", zip: "" });

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }
    getAdminOrderById(orderId)
      .then((res) => {
        if (res.success && res.order) {
          setOrder(res.order);
          setItems((res.order.items || []).map((i) => ({ ...i, quantity: i.quantity ?? 1 })));
          setShippingAddress({
            name: res.order.shippingAddress?.name ?? "",
            phone: res.order.shippingAddress?.phone ?? "",
            address: res.order.shippingAddress?.address ?? "",
            city: res.order.shippingAddress?.city ?? "",
            state: res.order.shippingAddress?.state ?? "",
            zip: res.order.shippingAddress?.zip ?? "",
          });
        } else {
          setError(res.message || "Order not found");
        }
      })
      .catch(() => setError("Failed to load order"))
      .finally(() => setLoading(false));
  }, [orderId]);

  const handleQuantityChange = (index, value) => {
    const q = Math.max(1, parseInt(value, 10) || 1);
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, quantity: q } : item)));
  };

  const handleAddressChange = (field, value) => {
    setShippingAddress((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!order?._id) return;
    setSaving(true);
    const payload = {
      items: items.map((i) => ({ productId: i.productId, name: i.name, quantity: i.quantity, price: i.price })),
      shippingAddress,
    };
    const result = await updateOrder(order._id, payload);
    if (result.success && result.order) {
      setOrder(result.order);
      setItems((result.order.items || []).map((i) => ({ ...i, quantity: i.quantity ?? 1 })));
      setShippingAddress({
        name: result.order.shippingAddress?.name ?? "",
        phone: result.order.shippingAddress?.phone ?? "",
        address: result.order.shippingAddress?.address ?? "",
        city: result.order.shippingAddress?.city ?? "",
        state: result.order.shippingAddress?.state ?? "",
        zip: result.order.shippingAddress?.zip ?? "",
      });
      toast.success("Order updated");
    } else {
      toast.error(result.message || "Failed to update order");
    }
    setSaving(false);
  };

  const handleStatusChange = async (newStatus) => {
    if (!order?._id) return;
    setSaving(true);
    const result = await updateOrderStatus(order._id, newStatus);
    if (result.success && result.order) {
      setOrder(result.order);
      toast.success(`Status updated to ${STATUS_OPTIONS.find((o) => o.value === newStatus)?.label || newStatus}`);
    } else {
      toast.error(result.message || "Failed to update status");
    }
    setSaving(false);
  };

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
          to="/admin/orders"
          className="inline-block px-6 py-3 text-white font-semibold rounded-lg"
          style={{ backgroundColor: "var(--color-primary)" }}
        >
          Back to Orders
        </Link>
      </div>
    );
  }

  const addr = order.shippingAddress || {};
  const displayTotal = order.total != null ? order.total : 0;

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
            to="/admin/orders"
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
              {order.customer && <span>{order.customer}</span>}
              {order.email && <span className="ml-2">({order.email})</span>}
              {" · "}
              Placed on {new Date(order.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <span
            className="px-4 py-2 text-sm font-semibold uppercase rounded-lg"
            style={{
              backgroundColor: getStatusColor(order.status) + "20",
              color: getStatusColor(order.status),
            }}
          >
            {formatStatus(order.status)}
          </span>
          <select
            value={order.status || "pending"}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="px-4 py-2 rounded-lg border-2 text-sm font-medium"
            style={{
              borderColor: "var(--border-primary)",
              backgroundColor: "var(--bg-primary)",
              color: "var(--text-primary)",
            }}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <motion.button
            type="button"
            onClick={handleSave}
            disabled={saving}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm text-white"
            style={{ backgroundColor: "var(--color-primary)" }}
          >
            <FiSave size={18} />
            {saving ? "Saving…" : "Save changes"}
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
                Order Items (editable)
              </h3>
            </div>
            <div className="space-y-4">
              {items.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex gap-4 p-4 rounded-lg items-center"
                  style={{ backgroundColor: "var(--bg-primary)" }}
                >
                  <div className="flex-1">
                    <p className="font-semibold text-lg mb-1" style={{ color: "var(--text-primary)" }}>
                      {item.name ?? "Item"}
                    </p>
                    <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                      ৳{(item.price ?? 0).toFixed(2)} each
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm" style={{ color: "var(--text-secondary)" }}>Qty</label>
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(index, e.target.value)}
                      className="w-20 px-2 py-2 rounded border text-center"
                      style={{
                        borderColor: "var(--border-primary)",
                        backgroundColor: "var(--bg-secondary)",
                        color: "var(--text-primary)",
                      }}
                    />
                  </div>
                  <div className="text-right w-24">
                    <p className="text-lg font-bold" style={{ color: "var(--color-primary)" }}>
                      ৳{((item.price ?? 0) * (item.quantity ?? 0)).toFixed(2)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            className="p-6 rounded-lg space-y-4"
            style={{ backgroundColor: "var(--bg-secondary)" }}
          >
            <div className="flex items-center gap-3 mb-4">
              <FiMapPin size={24} style={{ color: "var(--color-primary)" }} />
              <h3 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                Shipping Address (editable)
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Name"
                value={shippingAddress.name}
                onChange={(e) => handleAddressChange("name", e.target.value)}
                className="px-3 py-2 rounded-lg border"
                style={{
                  borderColor: "var(--border-primary)",
                  backgroundColor: "var(--bg-primary)",
                  color: "var(--text-primary)",
                }}
              />
              <input
                type="text"
                placeholder="Phone"
                value={shippingAddress.phone}
                onChange={(e) => handleAddressChange("phone", e.target.value)}
                className="px-3 py-2 rounded-lg border"
                style={{
                  borderColor: "var(--border-primary)",
                  backgroundColor: "var(--bg-primary)",
                  color: "var(--text-primary)",
                }}
              />
              <input
                type="text"
                placeholder="Address"
                value={shippingAddress.address}
                onChange={(e) => handleAddressChange("address", e.target.value)}
                className="px-3 py-2 rounded-lg border sm:col-span-2"
                style={{
                  borderColor: "var(--border-primary)",
                  backgroundColor: "var(--bg-primary)",
                  color: "var(--text-primary)",
                }}
              />
              <input
                type="text"
                placeholder="City"
                value={shippingAddress.city}
                onChange={(e) => handleAddressChange("city", e.target.value)}
                className="px-3 py-2 rounded-lg border"
                style={{
                  borderColor: "var(--border-primary)",
                  backgroundColor: "var(--bg-primary)",
                  color: "var(--text-primary)",
                }}
              />
              <input
                type="text"
                placeholder="State"
                value={shippingAddress.state}
                onChange={(e) => handleAddressChange("state", e.target.value)}
                className="px-3 py-2 rounded-lg border"
                style={{
                  borderColor: "var(--border-primary)",
                  backgroundColor: "var(--bg-primary)",
                  color: "var(--text-primary)",
                }}
              />
              <input
                type="text"
                placeholder="ZIP"
                value={shippingAddress.zip}
                onChange={(e) => handleAddressChange("zip", e.target.value)}
                className="px-3 py-2 rounded-lg border"
                style={{
                  borderColor: "var(--border-primary)",
                  backgroundColor: "var(--bg-primary)",
                  color: "var(--text-primary)",
                }}
              />
            </div>
          </motion.div>

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
                    ৳{Number(displayTotal).toFixed(2)}
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

export default AdminOrderDetail;
