import { useEffect, useState } from "react";
import { Link } from "react-router";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "../../utils/animations";
import { FiPackage, FiDollarSign, FiHeart, FiTrendingUp, FiShoppingBag, FiClock, FiUser } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { getAccountDashboard } from "../../services/user.service";

function membershipLabel(role) {
  if (role === "premium") return "Premium";
  if (role === "admin") return "Admin";
  return "Standard";
}

const Dashboard = () => {
  const { user: authUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!authUser?._id) {
      setLoading(false);
      return;
    }
    getAccountDashboard(authUser._id)
      .then((res) => {
        if (res.success) setData(res.data);
        else setError(res.message);
      })
      .catch(() => setError("Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, [authUser?._id]);

  const firstName = authUser?.name?.trim().split(/\s+/)[0] || "there";
  const memberSince = data?.user?.createdAt || authUser?.createdAt;
  const membershipTier = membershipLabel(data?.user?.role ?? authUser?.role ?? "user");

  const totalOrders = data?.totalOrders ?? 0;
  const totalSpent = data?.totalSpent ?? 0;
  const wishlistCount = data?.wishlistCount ?? 0;
  const avgOrderValue = data?.avgOrderValue ?? 0;
  const recentOrders = data?.recentOrders ?? [];

  const stats = [
    { id: 1, label: "Total Orders", value: totalOrders, icon: FiPackage, color: "var(--color-primary)" },
    { id: 2, label: "Total Spent", value: `৳${Number(totalSpent).toFixed(2)}`, icon: FiDollarSign, color: "var(--color-secondary)" },
    { id: 3, label: "Wishlist Items", value: wishlistCount, icon: FiHeart, color: "var(--color-tertiary)" },
    { id: 4, label: "Avg Order Value", value: `৳${Number(avgOrderValue).toFixed(2)}`, icon: FiTrendingUp, color: "var(--color-primary)" },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "paid":
        return "var(--color-primary)";
      case "pending":
        return "var(--color-tertiary)";
      case "cancelled":
      case "failed":
        return "var(--text-tertiary)";
      default:
        return "var(--text-tertiary)";
    }
  };

  const formatStatus = (status) => {
    if (!status) return "—";
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16" style={{ color: "var(--text-secondary)" }}>
        Loading dashboard…
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
            Welcome back, {firstName}! 👋
          </h2>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            {memberSince
              ? `Member since ${new Date(memberSince).toLocaleDateString("en-US", { year: "numeric", month: "long" })}`
              : "Manage your account"}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs uppercase tracking-wider mb-1" style={{ color: "var(--text-tertiary)" }}>
              Membership
            </p>
            <p className="text-lg font-bold" style={{ color: "var(--color-primary)" }}>
              {membershipTier}
            </p>
          </div>
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center border-2"
            style={{ borderColor: "var(--border-primary)", backgroundColor: "var(--bg-secondary)", color: "var(--color-primary)" }}
          >
            <FiUser size={32} />
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
            onMouseEnter={(e) => { e.currentTarget.style.textDecoration = "underline"; }}
            onMouseLeave={(e) => { e.currentTarget.style.textDecoration = "none"; }}
          >
            View All
          </Link>
        </div>

        {recentOrders.length > 0 ? (
          <div className="space-y-4">
            {recentOrders.map((order, index) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 rounded-lg border-2 transition-all"
                style={{ borderColor: "var(--border-primary)", backgroundColor: "var(--bg-primary)" }}
                whileHover={{ borderColor: "var(--color-primary)", scale: 1.01 }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
                        {order.orderId}
                      </span>
                      <span
                        className="px-2 py-1 text-xs font-semibold uppercase rounded"
                        style={{
                          backgroundColor: getStatusColor(order.status) + "20",
                          color: getStatusColor(order.status),
                        }}
                      >
                        {formatStatus(order.status)}
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
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-lg font-bold" style={{ color: "var(--color-primary)" }}>
                        ৳{Number(order.total).toFixed(2)}
                      </p>
                      <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                        {order.items?.length ?? 0} item{(order.items?.length ?? 0) !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <Link
                      to={`/account/orders/${order._id}`}
                      className="px-4 py-2 border-2 rounded-lg font-semibold text-sm transition-colors"
                      style={{ borderColor: "var(--border-primary)", color: "var(--text-primary)" }}
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
          style={{ borderColor: "var(--border-primary)", backgroundColor: "var(--bg-secondary)" }}
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
          <h4 className="font-semibold mb-2" style={{ color: "var(--text-primary)" }}>My Wishlist</h4>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{wishlistCount} items saved</p>
        </Link>

        <Link
          to="/account/addresses"
          className="p-6 rounded-lg border-2 transition-all group"
          style={{ borderColor: "var(--border-primary)", backgroundColor: "var(--bg-secondary)" }}
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
          <h4 className="font-semibold mb-2" style={{ color: "var(--text-primary)" }}>Address Book</h4>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Manage shipping addresses</p>
        </Link>

        <Link
          to="/account/membership"
          className="p-6 rounded-lg border-2 transition-all group"
          style={{ borderColor: "var(--border-primary)", backgroundColor: "var(--bg-secondary)" }}
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
          <h4 className="font-semibold mb-2" style={{ color: "var(--text-primary)" }}>Membership</h4>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{membershipTier} Member</p>
        </Link>
      </motion.div>
    </div>
  );
};

export default Dashboard;
