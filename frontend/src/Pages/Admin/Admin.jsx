import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router";
import { Container } from "../../components";
import { motion } from "framer-motion";
import { fadeInUp } from "../../utils/animations";
import {
  FiLayout,
  FiPackage,
  FiUsers,
  FiBarChart2,
  FiSettings,
  FiRadio,
  FiPlus,
} from "react-icons/fi";

const Admin = () => {
  const location = useLocation();

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: FiLayout, path: "/admin" },
    { id: "products", label: "Products", icon: FiPackage, path: "/admin/products" },
    { id: "orders", label: "Orders", icon: FiBarChart2, path: "/admin/orders" },
    { id: "users", label: "Customers", icon: FiUsers, path: "/admin/users" },
    { id: "campaigns", label: "Campaigns", icon: FiRadio, path: "/admin/campaigns" },
    { id: "settings", label: "Settings", icon: FiSettings, path: "/admin/settings" },
  ];

  return (
    <div className="min-h-screen py-16">
      <Container>
        <motion.div
          initial="initial"
          animate="animate"
          variants={fadeInUp}
          className="max-w-7xl mx-auto"
        >
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-2" style={{ color: "var(--color-primary)" }}>
              Admin Panel
            </h1>
            <p className="text-lg" style={{ color: "var(--text-secondary)" }}>
              Manage your e-commerce platform
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Quick Action - Add Product */}
              <Link to="/admin/products/new">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold text-sm text-white mb-4"
                  style={{ backgroundColor: "var(--color-primary)" }}
                >
                  <FiPlus size={18} />
                  Add New Product
                </motion.button>
              </Link>

              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = location.pathname === tab.path || 
                    (tab.path === "/admin" && location.pathname === "/admin") ||
                    (tab.id === "products" && location.pathname.startsWith("/admin/products"));
                  return (
                    <Link
                      key={tab.id}
                      to={tab.path}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                        isActive ? "font-semibold" : ""
                      }`}
                      style={{
                        backgroundColor: isActive ? "var(--bg-secondary)" : "transparent",
                        color: isActive ? "var(--color-primary)" : "var(--text-secondary)",
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = "var(--bg-secondary)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = "transparent";
                        }
                      }}
                    >
                      <Icon size={20} />
                      <span>{tab.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Content */}
            <div className="lg:col-span-3">
              <Outlet />
            </div>
          </div>
        </motion.div>
      </Container>
    </div>
  );
};

export default Admin;
