import { useState } from "react";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "../../utils/animations";
import { FiEye, FiPackage, FiSearch, FiFilter, FiDownload } from "react-icons/fi";
import { adminOrders } from "../../data/adminData";
import { productsData } from "../../data/products";
import { EmptyState } from "../../components";
import toast from "react-hot-toast";

const Orders = () => {
  const [orders, setOrders] = useState(adminOrders);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered":
        return "var(--color-primary)";
      case "Shipped":
        return "var(--color-secondary)";
      case "Processing":
        return "var(--color-tertiary)";
      case "Pending":
        return "var(--text-tertiary)";
      default:
        return "var(--text-tertiary)";
    }
  };

  const getProduct = (productId) => {
    return productsData.find((p) => p.id === productId);
  };

  const handleStatusChange = (orderId, newStatus) => {
    const order = orders.find((o) => o.id === orderId);
    setOrders(orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
    toast.success(`Order ${orderId} status updated to ${newStatus}`);
  };

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
            placeholder="Search orders..."
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
          <option value="Pending">Pending</option>
          <option value="Processing">Processing</option>
          <option value="Shipped">Shipped</option>
          <option value="Delivered">Delivered</option>
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
                <th className="text-left py-3 px-4 font-semibold" style={{ color: "var(--text-primary)" }}>Order ID</th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: "var(--text-primary)" }}>Customer</th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: "var(--text-primary)" }}>Items</th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: "var(--text-primary)" }}>Date</th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: "var(--text-primary)" }}>Status</th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: "var(--text-primary)" }}>Total</th>
                <th className="text-right py-3 px-4 font-semibold" style={{ color: "var(--text-primary)" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order, index) => (
                <motion.tr
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b" style={{ borderColor: "var(--border-primary)" }}
                  whileHover={{ backgroundColor: "var(--bg-tertiary)" }}
                >
                  <td className="py-4 px-4">
                    <span className="font-semibold font-mono" style={{ color: "var(--text-primary)" }}>
                      {order.id}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
                        {order.customer}
                      </p>
                      <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                        {order.email}
                      </p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      {order.items.slice(0, 2).map((item) => {
                        const product = getProduct(item.productId);
                        if (!product) return null;
                        return (
                          <div key={item.productId} className="w-10 h-10 rounded overflow-hidden" style={{ backgroundColor: "var(--bg-tertiary)" }}>
                            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                          </div>
                        );
                      })}
                      {order.items.length > 2 && (
                        <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                          +{order.items.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                      {new Date(order.date).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className="px-3 py-1 text-xs font-semibold uppercase rounded-lg border-0 outline-none"
                      style={{
                        backgroundColor: getStatusColor(order.status) + "20",
                        color: getStatusColor(order.status),
                      }}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-bold" style={{ color: "var(--color-primary)" }}>
                      ${order.total.toFixed(2)}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 rounded-lg transition-colors"
                        style={{ color: "var(--color-primary)" }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "var(--bg-tertiary)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                        }}
                      >
                        <FiEye size={18} />
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
            description={searchQuery || statusFilter !== "all" ? "Try adjusting your filters" : "No orders available"}
          />
        )}
      </motion.div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {["Pending", "Processing", "Shipped", "Delivered"].map((status) => {
          const count = orders.filter((o) => o.status === status).length;
          return (
            <motion.div
              key={status}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-lg text-center"
              style={{ backgroundColor: "var(--bg-secondary)" }}
            >
              <p className="text-2xl font-bold mb-1" style={{ color: getStatusColor(status) }}>
                {count}
              </p>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                {status}
              </p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default Orders;
