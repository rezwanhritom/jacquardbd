import { Container } from "../../components";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "../../utils/animations";
import { FiEye, FiPackage } from "react-icons/fi";

const orders = [
  { id: "ORD-001", customer: "John Doe", total: 269.98, status: "Delivered", date: "2024-01-15" },
  { id: "ORD-002", customer: "Jane Smith", total: 149.99, status: "Shipped", date: "2024-01-14" },
  { id: "ORD-003", customer: "Bob Johnson", total: 89.99, status: "Processing", date: "2024-01-13" },
  { id: "ORD-004", customer: "Alice Brown", total: 199.99, status: "Pending", date: "2024-01-12" },
];

const Orders = () => {
  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered": return "var(--color-primary)";
      case "Shipped": return "var(--color-secondary)";
      case "Processing": return "var(--color-tertiary)";
      default: return "var(--text-tertiary)";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <FiPackage size={24} style={{ color: "var(--color-primary)" }} />
        <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
          Orders
        </h2>
      </div>

      <motion.div
        initial="initial"
        animate="animate"
        variants={staggerContainer}
        className="space-y-4"
      >
        {orders.map((order) => (
          <motion.div
            key={order.id}
            variants={fadeInUp}
            className="p-6 rounded-lg"
            style={{ backgroundColor: "var(--bg-secondary)" }}
          >
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center space-x-4">
                  <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>
                    {order.id}
                  </h3>
                  <span
                    className="px-3 py-1 text-xs font-semibold uppercase rounded"
                    style={{
                      backgroundColor: getStatusColor(order.status) + "20",
                      color: getStatusColor(order.status),
                    }}
                  >
                    {order.status}
                  </span>
                </div>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  {order.customer} • ${order.total.toFixed(2)} • {order.date}
                </p>
              </div>
              <button
                className="p-2 rounded-lg transition-colors"
                style={{ backgroundColor: "var(--bg-primary)", color: "var(--color-primary)" }}
              >
                <FiEye size={20} />
              </button>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default Orders;
