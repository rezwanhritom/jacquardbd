import { useState, useRef, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router";
import { Container } from "../../components";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiLayout,
  FiUser,
  FiPackage,
  FiHeart,
  FiShoppingCart,
  FiMapPin,
  FiShield,
  FiSliders,
  FiLogOut,
  FiChevronRight,
} from "react-icons/fi";
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
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const displayName = user?.name?.trim() || "User";
  const membershipTier = membershipLabel(user?.role ?? "user");

  const tabs = [
    { id: "dashboard", label: "Overview", icon: FiLayout, path: "/account", description: "Dashboard & stats" },
    { id: "profile", label: "Profile Details", icon: FiUser, path: "/account/profile", description: "Personal info" },
    { id: "orders", label: "Orders", icon: FiPackage, path: "/account/orders", description: "Order history" },
    { id: "addresses", label: "Addresses", icon: FiMapPin, path: "/account/addresses", description: "Saved locations" },
    { id: "wishlist", label: "Wishlist", icon: FiHeart, path: "/account/wishlist", description: "Saved items" },
    { id: "cart", label: "Cart", icon: FiShoppingCart, path: "/account/cart", description: "Shopping cart" },
    { id: "security", label: "Security", icon: FiShield, path: "/account/security", description: "Password & safety" },
    { id: "preferences", label: "Preferences", icon: FiSliders, path: "/account/settings", description: "App settings" },
  ];

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully!");
    navigate("/");
  };

  const currentTab = tabs.find(
    (t) => t.path === location.pathname || (t.path === "/account" && location.pathname === "/account")
  ) || tabs[0];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setMobileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen py-12 md:py-16">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-6xl mx-auto"
        >
          {/* Page Header — centered on mobile, row on desktop */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8 text-center md:text-left">
            <div className="flex-1">
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

            {/* User Quick Info — on mobile: icon then name & type below; on desktop: name/type right of icon */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 flex-shrink-0"
            >
              <div className="hidden sm:block text-right">
                <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
                  {displayName}
                </p>
                <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                  {membershipTier} Member
                </p>
              </div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-12 h-12 rounded-full flex items-center justify-center ring-2 ring-offset-2 flex-shrink-0"
                style={{
                  ringColor: "var(--color-primary)",
                  ringOffsetColor: "var(--bg-primary)",
                  backgroundColor: "var(--bg-secondary)",
                  color: "var(--color-primary)",
                }}
              >
                <FiUser size={24} />
              </motion.div>
              {/* Mobile: name and membership below icon */}
              <div className="sm:hidden text-center">
                <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
                  {displayName}
                </p>
                <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                  {membershipTier} Member
                </p>
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar — hidden on mobile, use dropdown instead */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="hidden lg:block lg:col-span-1"
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
              {/* Mobile: dropdown to select section instead of full sidebar */}
              <div ref={dropdownRef} className="relative mb-6 lg:hidden">
                <motion.button
                  type="button"
                  onClick={() => setMobileDropdownOpen((o) => !o)}
                  className="w-full flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl border-2 transition-colors"
                  style={{
                    borderColor: "var(--border-primary)",
                    backgroundColor: "var(--bg-primary)",
                    color: "var(--text-primary)",
                  }}
                >
                  <span className="flex items-center gap-2">
                    {(() => {
                      const Icon = currentTab.icon;
                      return <Icon size={20} style={{ color: "var(--color-primary)" }} />;
                    })()}
                    <span className="font-medium">{currentTab.label}</span>
                  </span>
                  <motion.span
                    animate={{ rotate: mobileDropdownOpen ? -90 : 90 }}
                    transition={{ duration: 0.2 }}
                    style={{ display: "inline-block" }}
                  >
                    <FiChevronRight size={20} style={{ color: "var(--text-tertiary)" }} />
                  </motion.span>
                </motion.button>
                <AnimatePresence>
                  {mobileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-0 right-0 top-full mt-1 z-20 py-2 rounded-xl shadow-lg border overflow-hidden"
                      style={{
                        backgroundColor: "var(--bg-primary)",
                        borderColor: "var(--border-primary)",
                      }}
                    >
                      {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive =
                          location.pathname === tab.path ||
                          (tab.path === "/account" && location.pathname === "/account");
                        return (
                          <Link
                            key={tab.id}
                            to={tab.path}
                            onClick={() => setMobileDropdownOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors"
                            style={{
                              color: isActive ? "var(--color-primary)" : "var(--text-secondary)",
                              backgroundColor: isActive ? "var(--bg-secondary)" : "transparent",
                            }}
                          >
                            <Icon size={18} />
                            {tab.label}
                          </Link>
                        );
                      })}
                      <div className="my-2 border-t" style={{ borderColor: "var(--border-primary)" }} />
                      <button
                        type="button"
                        onClick={() => {
                          setMobileDropdownOpen(false);
                          handleLogout();
                        }}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm w-full text-left transition-colors"
                        style={{ color: "var(--color-tertiary)" }}
                      >
                        <FiLogOut size={18} />
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

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
