import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router";
import { Container } from "../../components";
import { motion } from "framer-motion";
import { fadeInUp } from "../../utils/animations";
import {
  FiLayout,
  FiUser,
  FiPackage,
  FiHeart,
  FiMapPin,
  FiCrown,
  FiMail,
  FiSettings,
  FiLogOut,
} from "react-icons/fi";

const Account = () => {
  const location = useLocation();

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: FiLayout, path: "/account" },
    { id: "profile", label: "Profile", icon: FiUser, path: "/account/profile" },
    { id: "orders", label: "Orders", icon: FiPackage, path: "/account/orders" },
    { id: "addresses", label: "Addresses", icon: FiMapPin, path: "/account/addresses" },
    { id: "wishlist", label: "Wishlist", icon: FiHeart, path: "/account/wishlist" },
    { id: "membership", label: "Membership", icon: FiCrown, path: "/account/membership" },
    { id: "newsletter", label: "Newsletter", icon: FiMail, path: "/account/newsletter" },
    { id: "settings", label: "Settings", icon: FiSettings, path: "/account/settings" },
  ];

  return (
    <div className="min-h-screen py-16">
      <Container>
        <motion.div
          initial="initial"
          animate="animate"
          variants={fadeInUp}
          className="max-w-6xl mx-auto"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-8" style={{ color: "var(--color-primary)" }}>
            My Account
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = location.pathname === tab.path || (tab.path === "/account" && location.pathname === "/account");
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
                <button
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors w-full text-left"
                  style={{ color: "var(--text-secondary)" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--bg-secondary)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <FiLogOut size={20} />
                  <span>Logout</span>
                </button>
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

export default Account;
