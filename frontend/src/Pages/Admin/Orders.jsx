import { useState, useEffect } from "react";
import { Link } from "react-router";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "../../utils/animations";
import { FiEye, FiPackage, FiSearch, FiDownload, FiTrash2 } from "react-icons/fi";
import { EmptyState } from "../../components";
import toast from "react-hot-toast";
import { getAdminOrders, updateOrderStatus, deleteOrder as deleteOrderApi } from "../../services/orders.service";

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "cancelled", label: "Cancelled" },
  { value: "confirmed", label: "Confirmed" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
];

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    const result = await getAdminOrders();
    if (result.success && result.orders) {
      setOrders(result.orders);
    } else {
      toast.error(result.message || "Failed to load orders");
      setOrders([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter((order) => {
    const orderIdStr = (order.orderId || order._id || "").toString().toLowerCase();
    const customer = (order.customer || "").toLowerCase();
    const email = (order.email || "").toLowerCase();
    const matchesSearch =
      orderIdStr.includes(searchQuery.toLowerCase()) ||
      customer.includes(searchQuery.toLowerCase()) ||
      email.includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      order.status === statusFilter ||
      (statusFilter === "delivered" && order.status === "paid") ||
      (statusFilter === "cancelled" && order.status === "failed");
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "delivered" || s === "paid") return "var(--color-primary)";
    if (s === "confirmed" || s === "shipped") return "var(--color-secondary)";
    if (s === "pending") return "var(--color-tertiary)";
    if (s === "cancelled" || s === "failed") return "var(--text-tertiary)";
    return "var(--text-tertiary)";
  };

  const getStatusLabel = (status) => {
    const opt = STATUS_OPTIONS.find((o) => o.value === (status || "").toLowerCase());
    return opt ? opt.label : (status || "").charAt(0).toUpperCase() + (status || "").slice(1).toLowerCase();
  };

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    const result = await updateOrderStatus(orderId, newStatus);
    if (result.success) {
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
      );
      toast.success(`Order status updated to ${getStatusLabel(newStatus)}`);
    } else {
      toast.error(result.message || "Failed to update status");
    }
    setUpdatingId(null);
  };

  const handleDelete = async (order) => {
    if (!window.confirm(`Delete order ${order.orderId || order._id}? This cannot be undone.`)) return;
    setUpdatingId(order._id);
    const result = await deleteOrderApi(order._id);
    if (result.success) {
      setOrders((prev) => prev.filter((o) => o._id !== order._id));
      toast.success("Order deleted");
    } else {
      toast.error(result.message || "Failed to delete order");
    }
    setUpdatingId(null);
  };

  const itemCount = (order) => (order.items || []).reduce((sum, i) => sum + (i.quantity || 0), 0);

  if (loading) {
    return (
      <div
        className="p-6 rounded-lg flex items-center justify-center min-h-[200px]"
        style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-secondary)" }}
      >
        Loading orders…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <FiPackage size={24} style={{ color: "var(--color-primary)" }} />
          <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            Orders Management
          </h2>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-4 py-2 border-2 rounded-lg font-semibold"
          style={{
            borderColor: "var(--border-primary)",
            color: "var(--text-primary)",
          }}
        >
          <FiDownload size={18} />
          Export
        </motion.button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <FiSearch size={20} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-tertiary)" }} />
          <input
            type="text"
            placeholder="Search by order ID, customer, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border-2 rounded-lg outline-none"
            style={{
              borderColor: "var(--border-primary)",
              backgroundColor: "var(--bg-primary)",
              color: "var(--text-primary)",
            }}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border-2 rounded-lg outline-none"
          style={{
            borderColor: "var(--border-primary)",
            backgroundColor: "var(--bg-primary)",
            color: "var(--text-primary)",
          }}
        >
          <option value="all">All Status</option>
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Orders Table */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={staggerContainer}
        className="p-6 rounded-lg space-y-4 overflow-x-auto"
        style={{ backgroundColor: "var(--bg-secondary)" }}
      >
        <div className="min-w-full">
          <table className="w-full">
            <thead>
              <tr className="border-b-2" style={{ borderColor: "var(--border-primary)" }}>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: "var(--text-primary)" }}>
                  Order ID
                </th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: "var(--text-primary)" }}>
                  Customer
                </th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: "var(--text-primary)" }}>
                  Items
                </th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: "var(--text-primary)" }}>
                  Date
                </th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: "var(--text-primary)" }}>
                  Status
                </th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: "var(--text-primary)" }}>
                  Total
                </th>
                <th className="text-right py-3 px-4 font-semibold" style={{ color: "var(--text-primary)" }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order, index) => (
                <motion.tr
                  key={order._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b"
                  style={{ borderColor: "var(--border-primary)" }}
                  whileHover={{ backgroundColor: "var(--bg-tertiary)" }}
                >
                  <td className="py-4 px-4">
                    <span className="font-semibold font-mono" style={{ color: "var(--text-primary)" }}>
                      {order.orderId || order._id}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
                        {order.customer || "—"}
                      </p>
                      <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                        {order.email || "—"}
                      </p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                      {itemCount(order)} item{itemCount(order) !== 1 ? "s" : ""}
                      {(order.items || []).length > 0 && (order.items[0].name || order.items[0].productId) && (
                        <span className="block text-xs mt-0.5 truncate max-w-[120px]" style={{ color: "var(--text-tertiary)" }}>
                          {order.items[0].name || "—"}
                          {(order.items || []).length > 1 ? ` +${order.items.length - 1}` : ""}
                        </span>
                      )}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                      {order.date ? new Date(order.date).toLocaleDateString() : "—"}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <select
                      value={order.status === "paid" ? "delivered" : order.status === "failed" ? "cancelled" : (order.status || "pending")}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      disabled={updatingId === order._id}
                      className="px-3 py-1 text-xs font-semibold uppercase rounded-lg border-0 outline-none disabled:opacity-60"
                      style={{
                        backgroundColor: getStatusColor(order.status) + "20",
                        color: getStatusColor(order.status),
                      }}
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-bold" style={{ color: "var(--color-primary)" }}>
                      ৳{(order.total != null ? order.total : 0).toFixed(2)}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/admin/orders/${order._id}`}
                        className="p-2 rounded-lg transition-colors inline-flex"
                        style={{ color: "var(--color-primary)" }}
                        title="View order details"
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "var(--bg-tertiary)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                        }}
                      >
                        <FiEye size={18} />
                      </Link>
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 rounded-lg transition-colors"
                        style={{ color: "var(--color-tertiary)" }}
                        title="Delete order"
                        disabled={updatingId === order._id}
                        onClick={() => handleDelete(order)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "var(--bg-tertiary)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                        }}
                      >
                        <FiTrash2 size={18} />
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredOrders.length === 0 && (
          <EmptyState
            icon={FiPackage}
            title="No orders found"
            description={searchQuery || statusFilter !== "all" ? "Try adjusting your filters" : "No orders in the database yet"}
          />
        )}
      </motion.div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {STATUS_OPTIONS.map(({ value, label }) => {
          const count = orders.filter((o) => {
          const s = (o.status || "").toLowerCase();
          return s === value || (value === "delivered" && s === "paid") || (value === "cancelled" && s === "failed");
        }).length;
          return (
            <motion.div
              key={value}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-lg text-center"
              style={{ backgroundColor: "var(--bg-secondary)" }}
            >
              <p className="text-2xl font-bold mb-1" style={{ color: getStatusColor(value) }}>
                {count}
              </p>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                {label}
              </p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default Orders;
