import { Link } from "react-router";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "../../utils/animations";
import { FiPackage, FiEye, FiDownload, FiTruck } from "react-icons/fi";
import { mockOrders } from "../../data/accountData";
import { productsData } from "../../data/products";
import { EmptyState } from "../../components";
import toast from "react-hot-toast";

const Orders = () => {
  const getProduct = (productId) => {
    return productsData.find((p) => p.id === productId);
  };

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
        {mockOrders.length > 0 ? (
          mockOrders.map((order, index) => (
            <motion.div
              key={order.id}
              variants={fadeInUp}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-6 rounded-lg space-y-4"
              style={{ backgroundColor: "var(--bg-secondary)" }}
              whileHover={{ scale: 1.01, y: -2 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-4 flex-wrap">
                    <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                      Order #{order.id}
                    </h3>
                    <span
                      className="px-3 py-1 text-xs font-semibold uppercase rounded-lg"
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
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                      <FiPackage size={16} style={{ color: "var(--text-tertiary)" }} />
                      <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                        {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                    {order.trackingNumber && (
                      <div className="flex items-center gap-2">
                        <FiTruck size={16} style={{ color: "var(--text-tertiary)" }} />
                        <span className="text-sm font-mono" style={{ color: "var(--text-secondary)" }}>
                          {order.trackingNumber}
                        </span>
                      </div>
                    )}
                  </div>
                  {/* Order Items Preview */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {order.items.slice(0, 3).map((item) => {
                      const product = getProduct(item.productId);
                      if (!product) return null;
                      return (
                        <div key={item.productId} className="flex items-center gap-2">
                          <div className="w-12 h-12 rounded overflow-hidden" style={{ backgroundColor: "var(--bg-tertiary)" }}>
                            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                          </div>
                          <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                            {product.name} × {item.quantity}
                          </span>
                        </div>
                      );
                    })}
                    {order.items.length > 3 && (
                      <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                        +{order.items.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <div className="text-right sm:text-left">
                    <p className="text-xl font-bold mb-1" style={{ color: "var(--color-primary)" }}>
                      ৳{order.total.toFixed(2)}
                    </p>
                    <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                      {order.paymentMethod}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      to={`/account/orders/${order.id}`}
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
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2 border-2 rounded-lg transition-colors"
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
                      <FiDownload size={16} />
                    </motion.button>
                  </div>
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
