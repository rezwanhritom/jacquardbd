import { Link } from "react-router";
import { Container } from "../../components";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "../../utils/animations";
import { FiPackage, FiEye } from "react-icons/fi";

// Fake orders data
const orders = [
  {
    id: "ORD-1234567890",
    date: "2024-01-15",
    status: "Delivered",
    total: 269.98,
    items: 3,
  },
  {
    id: "ORD-1234567891",
    date: "2024-01-10",
    status: "Shipped",
    total: 149.99,
    items: 1,
  },
  {
    id: "ORD-1234567892",
    date: "2024-01-05",
    status: "Processing",
    total: 89.99,
    items: 2,
  },
];

const Orders = () => {
  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered":
        return "var(--color-primary)";
      case "Shipped":
        return "var(--color-secondary)";
      case "Processing":
        return "var(--color-tertiary)";
      default:
        return "var(--text-tertiary)";
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeInUp}
        className="flex items-center space-x-3 mb-6"
      >
        <FiPackage size={24} style={{ color: "var(--color-primary)" }} />
        <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
          My Orders
        </h2>
      </motion.div>

      <motion.div
        initial="initial"
        animate="animate"
        variants={staggerContainer}
        className="space-y-4"
      >
        {orders.length > 0 ? (
          orders.map((order) => (
            <motion.div
              key={order.id}
              variants={fadeInUp}
              className="p-6 rounded-lg space-y-4"
              style={{ backgroundColor: "var(--bg-secondary)" }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-4">
                    <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                      Order #{order.id}
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
                    Placed on {new Date(order.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                    {order.items} item{order.items > 1 ? "s" : ""} • ${order.total.toFixed(2)}
                  </p>
                </div>
                <Link
                  to={`/account/orders/${order.id}`}
                  className="flex items-center space-x-2 px-4 py-2 border rounded-lg transition-colors"
                  style={{
                    borderColor: "var(--border-primary)",
                    color: "var(--text-primary)",
                  }}
                >
                  <FiEye size={18} />
                  <span>View Details</span>
                </Link>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-12">
            <p style={{ color: "var(--text-secondary)" }}>No orders found</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Orders;
