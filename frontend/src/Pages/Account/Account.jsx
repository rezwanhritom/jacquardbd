import { Link, Outlet, useLocation } from "react-router";
import { Container } from "../../components";
import { motion, AnimatePresence } from "framer-motion";
import { fadeInUp } from "../../utils/animations";
import {
  FiLayout,
  FiUser,
  FiPackage,
  FiHeart,
  FiMapPin,
  FiShield,
  FiSliders,
  FiLogOut,
  FiChevronRight,
} from "react-icons/fi";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

function membershipLabel(role) {
  if (role === "premium") return "Premium";
  if (role === "admin") return "Admin";
  return "Standard";
}

const Account = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const displayName = user?.name?.trim() || "User";
  const membershipTier = membershipLabel(user?.role ?? "user");

  const tabs = [
    { id: "dashboard", label: "Overview", icon: FiLayout, path: "/account", description: "Dashboard & stats" },
    { id: "profile", label: "Profile Details", icon: FiUser, path: "/account/profile", description: "Personal info" },
    { id: "orders", label: "Orders", icon: FiPackage, path: "/account/orders", description: "Order history" },
    { id: "addresses", label: "Addresses", icon: FiMapPin, path: "/account/addresses", description: "Saved locations" },
    { id: "wishlist", label: "Wishlist", icon: FiHeart, path: "/account/wishlist", description: "Saved items" },
    { id: "security", label: "Security", icon: FiShield, path: "/account/security", description: "Password & safety" },
    { id: "preferences", label: "Preferences", icon: FiSliders, path: "/account/settings", description: "App settings" },
  ];

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully!");
    navigate("/");
  };

  return (
    <div className="min-h-screen py-12 md:py-16">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-6xl mx-auto"
        >
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="text-3xl md:text-4xl font-bold mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                My Account
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                Manage your profile, orders, and preferences
              </motion.p>
            </div>
            
            {/* User Quick Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-4"
            >
              <div className="text-right hidden sm:block">
                <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
                  {displayName}
                </p>
                <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                  {membershipTier} Member
                </p>
              </div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-12 h-12 rounded-full flex items-center justify-center ring-2 ring-offset-2"
                style={{ 
                  ringColor: "var(--color-primary)",
                  ringOffsetColor: "var(--bg-primary)",
                  backgroundColor: "var(--bg-secondary)",
                  color: "var(--color-primary)",
                }}
              >
                <FiUser size={24} />
              </motion.div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-1"
            >
              <div
                className="p-4 rounded-xl sticky top-24"
                style={{ backgroundColor: "var(--bg-secondary)" }}
              >
                <nav className="space-y-1">
                  {tabs.map((tab, index) => {
                    const Icon = tab.icon;
                    const isActive =
                      location.pathname === tab.path ||
                      (tab.path === "/account" && location.pathname === "/account");
                    
                    return (
                      <motion.div
                        key={tab.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + index * 0.05 }}
                      >
                        <Link
                          to={tab.path}
                          className="relative flex items-center gap-3 px-4 py-3 rounded-lg transition-all group"
                          style={{
                            backgroundColor: isActive ? "var(--bg-primary)" : "transparent",
                            color: isActive ? "var(--color-primary)" : "var(--text-secondary)",
                          }}
                          onMouseEnter={(e) => {
                            if (!isActive) {
                              e.currentTarget.style.backgroundColor = "var(--bg-primary)";
                              e.currentTarget.style.color = "var(--text-primary)";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isActive) {
                              e.currentTarget.style.backgroundColor = "transparent";
                              e.currentTarget.style.color = "var(--text-secondary)";
                            }
                          }}
                        >
                          {/* Active Indicator */}
                          <AnimatePresence>
                            {isActive && (
                              <motion.div
                                layoutId="activeTab"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full"
                                style={{ backgroundColor: "var(--color-primary)" }}
                              />
                            )}
                          </AnimatePresence>
                          
                          <Icon size={20} />
                          <div className="flex-1">
                            <span className={`block text-sm ${isActive ? "font-semibold" : "font-medium"}`}>
                              {tab.label}
                            </span>
                            <span
                              className="text-xs hidden lg:block"
                              style={{ color: "var(--text-tertiary)" }}
                            >
                              {tab.description}
                            </span>
                          </div>
                          <motion.div
                            animate={{ x: isActive ? 0 : -4, opacity: isActive ? 1 : 0 }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <FiChevronRight size={16} />
                          </motion.div>
                        </Link>
                      </motion.div>
                    );
                  })}
                  
                  {/* Divider */}
                  <div className="my-3 border-t" style={{ borderColor: "var(--border-primary)" }} />
                  
                  {/* Logout Button */}
                  <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all w-full text-left group"
                    style={{ color: "var(--color-tertiary)" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    <FiLogOut size={20} />
                    <span className="text-sm font-medium">Logout</span>
                  </motion.button>
                </nav>
              </div>
            </motion.div>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="lg:col-span-3"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Outlet />
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>
        </motion.div>
      </Container>
    </div>
  );
};

export default Account;
