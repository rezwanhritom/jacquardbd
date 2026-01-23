import { Link } from "react-router";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "../../utils/animations";
import { FiPackage, FiDollarSign, FiHeart, FiTrendingUp, FiShoppingBag, FiClock } from "react-icons/fi";
import { mockUser, mockOrders } from "../../data/accountData";
import { productsData } from "../../data/products";

const Dashboard = () => {
  const recentOrders = mockOrders.slice(0, 3);
  const totalSpent = mockUser.totalSpent;
  const totalOrders = mockUser.totalOrders;
  const wishlistCount = 8; // Mock count
  const averageOrderValue = totalSpent / totalOrders;

  const stats = [
    {
      id: 1,
      label: "Total Orders",
      value: totalOrders,
      icon: FiPackage,
      color: "var(--color-primary)",
      change: "+12%",
    },
    {
      id: 2,
      label: "Total Spent",
      value: `$${totalSpent.toFixed(2)}`,
      icon: FiDollarSign,
      color: "var(--color-secondary)",
      change: "+8%",
    },
    {
      id: 3,
      label: "Wishlist Items",
      value: wishlistCount,
      icon: FiHeart,
      color: "var(--color-tertiary)",
      change: "+3",
    },
    {
      id: 4,
      label: "Avg Order Value",
      value: `$${averageOrderValue.toFixed(2)}`,
      icon: FiTrendingUp,
      color: "var(--color-primary)",
      change: "+5%",
    },
  ];

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
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeInUp}
        className="flex items-center justify-between flex-wrap gap-4"
      >
        <div>
          <h2 className="text-3xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
            Welcome back, {mockUser.firstName}! 👋
          </h2>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Member since {new Date(mockUser.memberSince).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
            })}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs uppercase tracking-wider mb-1" style={{ color: "var(--text-tertiary)" }}>
              Membership
            </p>
            <p className="text-lg font-bold" style={{ color: "var(--color-primary)" }}>
              {mockUser.membershipTier}
            </p>
          </div>
          <div className="w-16 h-16 rounded-full overflow-hidden border-2" style={{ borderColor: "var(--border-primary)" }}>
            <img src={mockUser.avatar} alt={mockUser.firstName} className="w-full h-full object-cover" />
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={staggerContainer}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.id}
              variants={fadeInUp}
              className="p-6 rounded-lg space-y-3"
              style={{ backgroundColor: "var(--bg-secondary)" }}
              whileHover={{ scale: 1.02, y: -4 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-lg" style={{ backgroundColor: stat.color + "20" }}>
                  <Icon size={24} style={{ color: stat.color }} />
                </div>
                <span className="text-xs font-semibold px-2 py-1 rounded" style={{ backgroundColor: "var(--bg-tertiary)", color: "var(--text-secondary)" }}>
                  {stat.change}
                </span>
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

      {/* Recent Orders */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeInUp}
        className="p-6 rounded-lg space-y-6"
        style={{ backgroundColor: "var(--bg-secondary)" }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FiClock size={24} style={{ color: "var(--color-primary)" }} />
            <h3 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
              Recent Orders
            </h3>
          </div>
          <Link
            to="/account/orders"
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

        {recentOrders.length > 0 ? (
          <div className="space-y-4">
            {recentOrders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 rounded-lg border-2 transition-all"
                style={{
                  borderColor: "var(--border-primary)",
                  backgroundColor: "var(--bg-primary)",
                }}
                whileHover={{ borderColor: "var(--color-primary)", scale: 1.01 }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
                        Order #{order.id}
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
                    <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                      {new Date(order.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {order.items.slice(0, 3).map((item) => {
                        const product = getProduct(item.productId);
                        if (!product) return null;
                        return (
                          <div key={item.productId} className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded overflow-hidden" style={{ backgroundColor: "var(--bg-tertiary)" }}>
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
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-lg font-bold" style={{ color: "var(--color-primary)" }}>
                        ${order.total.toFixed(2)}
                      </p>
                      <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                        {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <Link
                      to={`/account/orders/${order.id}`}
                      className="px-4 py-2 border-2 rounded-lg font-semibold text-sm transition-colors"
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
                      View
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FiShoppingBag size={48} className="mx-auto mb-4" style={{ color: "var(--text-tertiary)" }} />
            <p style={{ color: "var(--text-secondary)" }}>No recent orders</p>
            <Link
              to="/"
              className="inline-block mt-4 px-6 py-3 text-white font-semibold uppercase tracking-wider rounded-lg"
              style={{ backgroundColor: "var(--color-primary)" }}
            >
              Start Shopping
            </Link>
          </div>
        )}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeInUp}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <Link
          to="/account/wishlist"
          className="p-6 rounded-lg border-2 transition-all group"
          style={{
            borderColor: "var(--border-primary)",
            backgroundColor: "var(--bg-secondary)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--color-primary)";
            e.currentTarget.style.transform = "translateY(-4px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--border-primary)";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          <FiHeart size={32} className="mb-3" style={{ color: "var(--color-primary)" }} />
          <h4 className="font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
            My Wishlist
          </h4>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            {wishlistCount} items saved
          </p>
        </Link>

        <Link
          to="/account/addresses"
          className="p-6 rounded-lg border-2 transition-all group"
          style={{
            borderColor: "var(--border-primary)",
            backgroundColor: "var(--bg-secondary)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--color-primary)";
            e.currentTarget.style.transform = "translateY(-4px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--border-primary)";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          <FiPackage size={32} className="mb-3" style={{ color: "var(--color-primary)" }} />
          <h4 className="font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
            Address Book
          </h4>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Manage shipping addresses
          </p>
        </Link>

        <Link
          to="/account/membership"
          className="p-6 rounded-lg border-2 transition-all group"
          style={{
            borderColor: "var(--border-primary)",
            backgroundColor: "var(--bg-secondary)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--color-primary)";
            e.currentTarget.style.transform = "translateY(-4px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--border-primary)";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          <FiTrendingUp size={32} className="mb-3" style={{ color: "var(--color-primary)" }} />
          <h4 className="font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
            Membership
          </h4>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            {mockUser.membershipTier} Member
          </p>
        </Link>
      </motion.div>
    </div>
  );
};

export default Dashboard;
