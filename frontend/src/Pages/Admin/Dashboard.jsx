import { useEffect, useState } from "react";
import { Link } from "react-router";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "../../utils/animations";
import { FiCreditCard, FiShoppingBag, FiUsers, FiPackage, FiArrowUpRight } from "react-icons/fi";
import { getDashboardStats } from "../../services/dashboard.service";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      const result = await getDashboardStats();
      if (cancelled) return;
      if (result.success && result.data) {
        setData(result.data);
      } else {
        setError(result.message || "Failed to load dashboard");
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]" style={{ color: "var(--text-secondary)" }}>
        Loading dashboard…
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-lg" style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-secondary)" }}>
        {error}
      </div>
    );
  }

  if (!data) return null;

  const stats = [
    {
      id: 1,
      label: "Total Revenue",
      value: `৳${Number(data.totalRevenue).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: FiCreditCard,
      color: "var(--color-primary)",
    },
    {
      id: 2,
      label: "Total Orders",
      value: Number(data.totalOrders).toLocaleString(),
      icon: FiShoppingBag,
      color: "var(--color-secondary)",
    },
    {
      id: 3,
      label: "Total Customers",
      value: Number(data.totalCustomers).toLocaleString(),
      icon: FiUsers,
      color: "var(--color-tertiary)",
    },
    {
      id: 4,
      label: "Total Products",
      value: Number(data.totalProducts).toString(),
      icon: FiPackage,
      color: "var(--color-primary)",
    },
  ];

  const getStatusDisplay = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "paid") return "Paid";
    if (s === "pending") return "Pending";
    if (s === "failed") return "Failed";
    if (s === "cancelled") return "Cancelled";
    return status || "—";
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={staggerContainer}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.id}
              variants={fadeInUp}
              className="p-6 rounded-lg space-y-4"
              style={{ backgroundColor: "var(--bg-secondary)" }}
              whileHover={{ scale: 1.02, y: -4 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-lg" style={{ backgroundColor: stat.color + "20" }}>
                  <Icon size={24} style={{ color: stat.color }} />
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>
                  {stat.value}
                </p>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  {stat.label}
                </p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Overview - no bars, month+year with total income and products sold */}
        <motion.div
          initial="initial"
          animate="animate"
          variants={fadeInUp}
          className="p-6 rounded-lg space-y-6"
          style={{ backgroundColor: "var(--bg-secondary)" }}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
              Sales Overview
            </h3>
            <span className="text-sm flex items-center gap-1" style={{ color: "var(--text-secondary)" }}>
              Last 12 months
              <FiArrowUpRight size={14} />
            </span>
          </div>
          <div className="space-y-4">
            {(data.salesOverview || []).map((row, index) => (
              <motion.div
                key={row.monthYear}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="p-4 rounded-lg border"
                style={{ borderColor: "var(--border-primary)", backgroundColor: "var(--bg-primary)" }}
              >
                <p className="font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                  {row.monthYear}
                </p>
                <div className="flex flex-col gap-1 text-sm">
                  <span style={{ color: "var(--text-secondary)" }}>
                    Total sale income: <strong style={{ color: "var(--color-primary)" }}>৳{Number(row.totalIncome).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                  </span>
                  <span style={{ color: "var(--text-secondary)" }}>
                    Total products sold: <strong style={{ color: "var(--text-primary)" }}>{Number(row.totalProductsSold).toLocaleString()}</strong>
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Top Selling Products */}
        <motion.div
          initial="initial"
          animate="animate"
          variants={fadeInUp}
          className="p-6 rounded-lg space-y-6"
          style={{ backgroundColor: "var(--bg-secondary)" }}
        >
          <h3 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
            Top Selling Products
          </h3>
          <div className="space-y-4">
            {(data.topSellingProducts || []).length === 0 ? (
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>No sales data yet.</p>
            ) : (
              (data.topSellingProducts || []).map((product, index) => (
                <motion.div
                  key={product.productId || index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-4 p-4 rounded-lg"
                  style={{ backgroundColor: "var(--bg-primary)" }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="w-16 h-16 flex-shrink-0 overflow-hidden rounded-lg" style={{ backgroundColor: "var(--bg-tertiary)" }}>
                    {product.images?.[0] ? (
                      <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs" style={{ color: "var(--text-tertiary)" }}>—</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                      {product.name}
                    </p>
                    <div className="flex items-center gap-4 text-xs mt-1">
                      <span style={{ color: "var(--text-secondary)" }}>
                        {product.quantitySold} sold
                      </span>
                      <span style={{ color: "var(--text-secondary)" }}>
                        Stock: {product.stock ?? 0}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold" style={{ color: "var(--color-primary)" }}>
                      ৳{Number(product.revenue || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* Recent Orders */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeInUp}
        className="p-6 rounded-lg space-y-4"
        style={{ backgroundColor: "var(--bg-secondary)" }}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
            Recent Orders
          </h3>
          <Link
            to="/admin/orders"
            className="text-sm font-semibold transition-colors"
            style={{ color: "var(--color-primary)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.textDecoration = "underline";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.textDecoration = "none";
            }}
          >
            View All
          </Link>
        </div>
        <div className="space-y-3">
          {(data.recentOrders || []).length === 0 ? (
            <p className="text-sm py-4" style={{ color: "var(--text-secondary)" }}>No orders yet.</p>
          ) : (
            (data.recentOrders || []).map((order, index) => {
              const getStatusColor = (status) => {
                const s = (status || "").toLowerCase();
                if (s === "paid") return "var(--color-primary)";
                if (s === "pending") return "var(--color-tertiary)";
                if (s === "failed") return "var(--color-tertiary)";
                if (s === "cancelled") return "var(--text-tertiary)";
                return "var(--text-tertiary)";
              };
              return (
                <motion.div
                  key={order.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 rounded-lg border-2 transition-all"
                  style={{
                    borderColor: "var(--border-primary)",
                    backgroundColor: "var(--bg-primary)",
                  }}
                  whileHover={{ borderColor: "var(--color-primary)", scale: 1.01 }}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
                        {order.orderId || order.id}
                      </span>
                      <span
                        className="px-2 py-1 text-xs font-semibold uppercase rounded"
                        style={{
                          backgroundColor: getStatusColor(order.status) + "20",
                          color: getStatusColor(order.status),
                        }}
                      >
                        {getStatusDisplay(order.status)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span style={{ color: "var(--text-secondary)" }}>
                        {order.customer}
                      </span>
                      <span style={{ color: "var(--text-secondary)" }}>
                        {order.items ?? 0} item{(order.items ?? 0) !== 1 ? "s" : ""}
                      </span>
                      <span style={{ color: "var(--text-secondary)" }}>
                        {order.date ? new Date(order.date).toLocaleDateString() : "—"}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg" style={{ color: "var(--color-primary)" }}>
                      ৳{Number(order.total ?? 0).toFixed(2)}
                    </p>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
