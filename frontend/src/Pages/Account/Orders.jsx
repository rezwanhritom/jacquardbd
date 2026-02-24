import { useEffect, useState } from "react";
import { Link } from "react-router";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "../../utils/animations";
import { FiPackage, FiEye, FiTruck } from "react-icons/fi";
import { getMyOrders } from "../../services/orders.service";
import { EmptyState } from "../../components";

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

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getMyOrders()
      .then((res) => {
        if (res.success) setOrders(res.orders);
        else setError(res.message);
      })
      .catch(() => setError("Failed to load orders"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16" style={{ color: "var(--text-secondary)" }}>
        Loading orders…
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16" style={{ color: "var(--text-secondary)" }}>
        <p>{error}</p>
      </div>
    );
  }

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
          orders.map((order, index) => (
            <motion.div
              key={order._id}
              variants={fadeInUp}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.2 }}
              className="p-6 rounded-lg space-y-4"
              style={{ backgroundColor: "var(--bg-secondary)" }}
              whileHover={{ scale: 1.01, y: -2 }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-4 flex-wrap">
                    <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                      {order.orderId}
                    </h3>
                    <span
                      className="px-3 py-1 text-xs font-semibold uppercase rounded-lg"
                      style={{
                        backgroundColor: getStatusColor(order.status) + "20",
                        color: getStatusColor(order.status),
                      }}
                    >
                      {formatStatus(order.status)}
                    </span>
                  </div>
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                    Placed on {new Date(order.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                      <FiPackage size={16} style={{ color: "var(--text-tertiary)" }} />
                      <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                        {order.items?.length ?? 0} item{(order.items?.length ?? 0) !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {(order.items || []).slice(0, 3).map((item, i) => (
                      <span key={i} className="text-xs" style={{ color: "var(--text-secondary)" }}>
                        {item.name ?? "Item"} × {item.quantity}
                      </span>
                    ))}
                    {(order.items?.length ?? 0) > 3 && (
                      <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                        +{(order.items?.length ?? 0) - 3} more
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <div className="text-right sm:text-left">
                    <p className="text-xl font-bold mb-1" style={{ color: "var(--color-primary)" }}>
                      ৳{Number(order.total).toFixed(2)}
                    </p>
                  </div>
                  <Link
                    to={`/account/orders/${order._id}`}
                    className="flex items-center gap-2 px-4 py-2 border-2 rounded-lg font-semibold text-sm transition-colors"
                    style={{
                      borderColor: "var(--border-primary)",
                      color: "var(--text-primary)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "var(--color-primary)";
                      e.currentTarget.style.backgroundColor = "var(--color-primary)";
                      e.currentTarget.style.color = "white";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "var(--border-primary)";
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.color = "var(--text-primary)";
                    }}
                  >
                    <FiEye size={16} />
                    View
                  </Link>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <EmptyState
            icon={FiPackage}
            title="No orders found"
            description="You haven't placed any orders yet"
            actionLabel="Start Shopping"
            actionPath="/"
          />
        )}
      </motion.div>
    </div>
  );
};

export default Orders;
