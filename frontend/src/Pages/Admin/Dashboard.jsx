import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "../../utils/animations";
import { FiDollarSign, FiShoppingBag, FiUsers, FiPackage, FiTrendingUp, FiTrendingDown, FiArrowUpRight } from "react-icons/fi";
import { adminKPIs, recentOrders, salesData, topProducts } from "../../data/adminData";
import { productsData } from "../../data/products";

const Dashboard = () => {
  const stats = [
    {
      id: 1,
      label: "Total Revenue",
      value: `$${adminKPIs.totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: `+${adminKPIs.revenueChange}%`,
      icon: FiDollarSign,
      color: "var(--color-primary)",
      isPositive: true,
    },
    {
      id: 2,
      label: "Total Orders",
      value: adminKPIs.totalOrders.toLocaleString(),
      change: `+${adminKPIs.ordersChange}%`,
      icon: FiShoppingBag,
      color: "var(--color-secondary)",
      isPositive: true,
    },
    {
      id: 3,
      label: "Total Customers",
      value: adminKPIs.totalCustomers.toLocaleString(),
      change: `+${adminKPIs.customersChange}%`,
      icon: FiUsers,
      color: "var(--color-tertiary)",
      isPositive: true,
    },
    {
      id: 4,
      label: "Total Products",
      value: adminKPIs.totalProducts.toString(),
      change: `+${adminKPIs.productsChange}%`,
      icon: FiPackage,
      color: "var(--color-primary)",
      isPositive: true,
    },
  ];

  const maxSales = Math.max(...salesData.map((d) => d.sales));

  const getProduct = (productId) => {
    return productsData.find((p) => p.id === productId);
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
                <div className="flex items-center gap-1 text-sm font-semibold" style={{ color: stat.isPositive ? "var(--color-primary)" : "var(--color-tertiary)" }}>
                  {stat.isPositive ? <FiTrendingUp size={16} /> : <FiTrendingDown size={16} />}
                  <span>{stat.change}</span>
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
        {/* Sales Chart */}
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
            {salesData.map((data, index) => (
              <div key={data.month} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span style={{ color: "var(--text-secondary)" }}>{data.month}</span>
                  <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
                    ${data.sales.toLocaleString()}
                  </span>
                </div>
                <div className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: "var(--bg-tertiary)" }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(data.sales / maxSales) * 100}%` }}
                    transition={{ delay: index * 0.05, duration: 0.5 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: "var(--color-primary)" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top Products */}
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
            {topProducts.map((product, index) => {
              const productData = getProduct(product.id);
              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-4 p-4 rounded-lg"
                  style={{ backgroundColor: "var(--bg-primary)" }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="w-16 h-16 flex-shrink-0 overflow-hidden rounded-lg" style={{ backgroundColor: "var(--bg-tertiary)" }}>
                    {productData && (
                      <img src={productData.images[0]} alt={product.name} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                      {product.name}
                    </p>
                    <div className="flex items-center gap-4 text-xs mt-1">
                      <span style={{ color: "var(--text-secondary)" }}>
                        {product.sales} sales
                      </span>
                      <span style={{ color: "var(--text-secondary)" }}>
                        Stock: {product.stock}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold" style={{ color: "var(--color-primary)" }}>
                      ${product.revenue.toLocaleString()}
                    </p>
                  </div>
                </motion.div>
              );
            })}
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
          <button
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
          </button>
        </div>
        <div className="space-y-3">
          {recentOrders.map((order, index) => {
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
              <motion.div
                key={order.id}
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
                      {order.id}
                    </span>
                    <span
                      className="px-2 py-1 text-xs font-semibold uppercase rounded"
                      style={{
                        backgroundColor: getStatusColor(order.status) + "20",
                        color: getStatusColor(order.status),
                      }}
                    >
                      {order.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span style={{ color: "var(--text-secondary)" }}>
                      {order.customer}
                    </span>
                    <span style={{ color: "var(--text-secondary)" }}>
                      {order.items} item{order.items !== 1 ? "s" : ""}
                    </span>
                    <span style={{ color: "var(--text-secondary)" }}>
                      {new Date(order.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg" style={{ color: "var(--color-primary)" }}>
                    ${order.total.toFixed(2)}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
