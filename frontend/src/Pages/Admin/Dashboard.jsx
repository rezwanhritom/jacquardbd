import { Container } from "../../components";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "../../utils/animations";
import { FiDollarSign, FiShoppingBag, FiUsers, FiTrendingUp } from "react-icons/fi";

const Dashboard = () => {
  // Fake stats data
  const stats = [
    {
      id: 1,
      label: "Total Revenue",
      value: "$45,231",
      change: "+12.5%",
      icon: FiDollarSign,
      color: "var(--color-primary)",
    },
    {
      id: 2,
      label: "Total Orders",
      value: "1,234",
      change: "+8.2%",
      icon: FiShoppingBag,
      color: "var(--color-secondary)",
    },
    {
      id: 3,
      label: "Total Users",
      value: "5,678",
      change: "+15.3%",
      icon: FiUsers,
      color: "var(--color-tertiary)",
    },
    {
      id: 4,
      label: "Growth Rate",
      value: "23.4%",
      change: "+4.1%",
      icon: FiTrendingUp,
      color: "var(--color-primary)",
    },
  ];

  return (
    <div className="space-y-6">
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
            >
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-lg" style={{ backgroundColor: stat.color + "20" }}>
                  <Icon size={24} style={{ color: stat.color }} />
                </div>
                <span className="text-sm font-semibold" style={{ color: "var(--color-primary)" }}>
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

      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeInUp}
        className="p-6 rounded-lg"
        style={{ backgroundColor: "var(--bg-secondary)" }}
      >
        <h2 className="text-2xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>
          Recent Activity
        </h2>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((item) => (
            <div
              key={item}
              className="flex items-center justify-between p-4 rounded-lg"
              style={{ backgroundColor: "var(--bg-primary)" }}
            >
              <div>
                <p className="font-medium" style={{ color: "var(--text-primary)" }}>
                  New order #{1234567890 + item}
                </p>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  {item} hour{item > 1 ? "s" : ""} ago
                </p>
              </div>
              <span className="px-3 py-1 text-xs font-semibold rounded" style={{ backgroundColor: "var(--color-primary)", color: "white" }}>
                ${(Math.random() * 200 + 50).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
