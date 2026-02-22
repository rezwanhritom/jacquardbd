import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { navigationData } from "../../data/navigation";
import {
  FiSearch,
  FiHeart,
  FiShoppingBag,
  FiUser,
  FiMenu,
  FiX,
  FiSun,
  FiMoon,
  FiLogIn,
  FiLogOut,
  FiUserPlus,
  FiGrid,
  FiLayout,
  FiPackage,
  FiMapPin,
  FiShield,
  FiSliders,
  FiChevronRight,
} from "react-icons/fi";
import { categoryTree } from "../../data/categoryTree";
import { slideInFromRight, fadeIn } from "../../utils/animations";
import { useDarkMode } from "../../context/DarkModeContext";

/** Title to URL slug: "Winter Wear" -> "winter-wear". */
function toSlug(s) {
  return (s || "").toLowerCase().replace(/\s+/g, "-");
}
/** Flatten section value to list of leaf labels (for mobile subcategory links). */
function getSectionLeafItems(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (value && typeof value === "object") {
    const items = [];
    Object.entries(value).forEach(([k, v]) => {
      items.push(k);
      if (Array.isArray(v) && v.length) items.push(...v);
    });
    return items;
  }
  return [];
}
import { useAuth } from "../../context/AuthContext";
import { useWishlist } from "../../context/WishlistContext";
import { useCart } from "../../context/CartContext";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  /** Mobile only: which gender row is expanded (Men/Women) */
  const [mobileExpandedGender, setMobileExpandedGender] = useState(null);
  /** Mobile only: which section is expanded (e.g. "Winter Wear") */
  const [mobileExpandedSection, setMobileExpandedSection] = useState(null);
  const [activeMegaMenu, setActiveMegaMenu] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const { isDark, toggleDarkMode } = useDarkMode();
  const { isAuthenticated, user, logout } = useAuth();
  const { wishlistItems } = useWishlist();
  const wishlistCount = wishlistItems?.length ?? 0;
  const { getCartCount } = useCart();
  const cartCount = getCartCount();
  const navigate = useNavigate();
  const location = useLocation();
  const searchInputRef = useRef(null);

  // Check if a path is active
  const isActivePath = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };


  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const handleMegaMenuHover = (label) => {
    if (label === "Men" || label === "Women") {
      setActiveMegaMenu(label);
    }
  };

  const handleMegaMenuLeave = () => {
    setActiveMegaMenu(null);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setMobileExpandedGender(null);
    setMobileExpandedSection(null);
  };

  const handleLogoutConfirm = async () => {
    await logout();
    setLogoutModalOpen(false);
    setMobileMenuOpen(false);
    navigate("/");
  };

  const getIcon = (name) => {
    const icons = {
      search: FiSearch,
      wishlist: FiHeart,
      cart: FiShoppingBag,
      profile: FiUser,
    };
    return icons[name] || FiSearch;
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`w-full transition-all duration-300 ${
          isScrolled
            ? "shadow-lg backdrop-blur-md bg-opacity-95"
            : "shadow-sm backdrop-blur-sm bg-opacity-90"
        }`}
        style={{
          backgroundColor: "var(--bg-primary)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-shrink-0"
            >
              <Link to="/" className="flex items-center gap-3 group">
                <motion.img
                  src="/images/logo.png"
                  alt={navigationData.logo}
                  className="h-10 w-auto object-contain"
                  whileHover={{ rotate: [0, -5, 5, -5, 0] }}
                  transition={{ duration: 0.5 }}
                />
                <motion.span
                  className="text-2xl font-bold tracking-wider"
                  style={{ color: "var(--color-primary)" }}
                  whileHover={{ x: 2 }}
                >
                  {navigationData.logo}
                </motion.span>
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1 flex-1 justify-center">
              {navigationData.links.map((link) => {
                const isActive = isActivePath(link.path);
                return (
                <div
                  key={link.id}
                  className="relative"
                  onMouseEnter={() => handleMegaMenuHover(link.label)}
                  onMouseLeave={handleMegaMenuLeave}
                >
                  <Link to={link.path}>
                    <motion.div
                      className="px-4 py-2 rounded-lg font-medium text-sm uppercase tracking-wide transition-colors relative"
                      style={{
                        color: isActive ? "var(--color-primary)" : "var(--text-secondary)",
                      }}
                      whileHover={{
                        color: "var(--color-primary)",
                        y: -2,
                      }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {link.label}
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 h-0.5"
                        style={{ backgroundColor: "var(--color-primary)" }}
                        initial={{ scaleX: isActive ? 1 : 0 }}
                        animate={{ scaleX: isActive ? 1 : 0 }}
                        whileHover={{ scaleX: 1 }}
                        transition={{ duration: 0.2 }}
                      />
                    </motion.div>
                  </Link>

                  {/* Mega Menu */}
                  <AnimatePresence>
                    {activeMegaMenu === link.label && link.hasMegaMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-[600px] shadow-2xl rounded-xl p-8 z-50"
                        style={{
                          backgroundColor: "var(--bg-primary)",
                          border: "1px solid var(--border-primary)",
                        }}
                      >
                        <div className="grid grid-cols-2 gap-6">
                          {navigationData.megaMenuCategories[link.label]?.map(
                            (category) => {
                              const genderSlug = link.label.toLowerCase();
                              const sectionSlug = category.title.toLowerCase().replace(/\s+/g, "-");
                              const sectionPath = `/category/${genderSlug}/${sectionSlug}`;
                              return (
                                <motion.div
                                  key={category.id}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.1 }}
                                >
                                  <Link
                                    to={sectionPath}
                                    onClick={() => setActiveMegaMenu(null)}
                                    className="block mb-4"
                                  >
                                    <h4
                                      className="font-semibold text-sm uppercase tracking-wide hover:underline"
                                      style={{ color: "var(--color-primary)" }}
                                    >
                                      {category.title}
                                    </h4>
                                  </Link>
                                  <ul className="space-y-2">
                                    {category.items.map((item, idx) => {
                                      const itemSlug = item.toLowerCase().replace(/\s+/g, "-");
                                      const itemPath = `/category/${genderSlug}/${sectionSlug}/${itemSlug}`;
                                      return (
                                        <li key={idx}>
                                          <Link
                                            to={itemPath}
                                            onClick={() => setActiveMegaMenu(null)}
                                            className="block"
                                          >
                                            <motion.span
                                              className="text-sm text-left w-full transition-colors block"
                                              style={{ color: "var(--text-tertiary)" }}
                                              whileHover={{
                                                color: "var(--color-primary)",
                                                x: 5,
                                              }}
                                            >
                                              {item}
                                            </motion.span>
                                          </Link>
                                        </li>
                                      );
                                    })}
                                  </ul>
                                </motion.div>
                              );
                            }
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                );
              })}
            </div>

            {/* Right Actions */}
            <div className="hidden lg:flex items-center space-x-4 flex-shrink-0">
              {/* Search */}
              <AnimatePresence>
                {searchOpen ? (
                  <motion.form
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 300, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    onSubmit={handleSearch}
                    className="flex items-center"
                  >
                    <div className="relative w-full">
                      <input
                        ref={searchInputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search products..."
                        className="w-full px-4 py-2 pr-10 border-2 rounded-lg outline-none transition-colors text-sm"
                        style={{
                          borderColor: "var(--border-primary)",
                          backgroundColor: "var(--bg-secondary)",
                          color: "var(--text-primary)",
                        }}
                        onBlur={() => {
                          if (!searchQuery) {
                            setTimeout(() => setSearchOpen(false), 200);
                          }
                        }}
                      />
                      <button
                        type="submit"
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded"
                        style={{ color: "var(--color-primary)" }}
                      >
                        <FiSearch size={18} />
                      </button>
                    </div>
                  </motion.form>
                ) : (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSearchOpen(true)}
                    className="p-2 rounded-lg transition-colors relative"
                    style={{
                      color: "var(--text-secondary)",
                      backgroundColor: "transparent",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "var(--color-primary)";
                      e.currentTarget.style.backgroundColor = "var(--bg-secondary)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "var(--text-secondary)";
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                    aria-label="Search"
                  >
                    <FiSearch size={20} />
                  </motion.button>
                )}
              </AnimatePresence>

              {/* Theme Toggle */}
              <motion.button
                whileHover={{ scale: 1.1, rotate: 15 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleDarkMode}
                className="p-2 rounded-lg transition-colors relative"
                style={{
                  color: "var(--text-secondary)",
                  backgroundColor: "transparent",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "var(--color-primary)";
                  e.currentTarget.style.backgroundColor = "var(--bg-secondary)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "var(--text-secondary)";
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
                aria-label="Toggle dark mode"
              >
                {isDark ? <FiSun size={20} /> : <FiMoon size={20} />}
              </motion.button>

              {/* Wishlist */}
              <Link to="/wishlist">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded-lg transition-colors relative"
                  style={{
                    color: isActivePath("/wishlist") ? "var(--color-primary)" : "var(--text-secondary)",
                    backgroundColor: "transparent",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "var(--color-primary)";
                    e.currentTarget.style.backgroundColor = "var(--bg-secondary)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isActivePath("/wishlist")) {
                      e.currentTarget.style.color = "var(--text-secondary)";
                    }
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                  aria-label="Wishlist"
                >
                  <FiHeart size={20} />
                  {wishlistCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{ backgroundColor: "var(--color-primary)" }}
                    >
                      {wishlistCount}
                    </motion.span>
                  )}
                </motion.button>
              </Link>

              {/* Cart */}
              <Link to="/cart">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded-lg transition-colors relative"
                  style={{
                    color: isActivePath("/cart") ? "var(--color-primary)" : "var(--text-secondary)",
                    backgroundColor: "transparent",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "var(--color-primary)";
                    e.currentTarget.style.backgroundColor = "var(--bg-secondary)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isActivePath("/cart")) {
                      e.currentTarget.style.color = "var(--text-secondary)";
                    }
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                  aria-label="Shopping Cart"
                >
                  <FiShoppingBag size={20} />
                  {cartCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{ backgroundColor: "var(--color-primary)" }}
                    >
                      {cartCount}
                    </motion.span>
                  )}
                </motion.button>
              </Link>

              {/* Admin (always visible) */}
              <Link to="/admin">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded-lg transition-colors"
                  style={{
                    color: isActivePath("/admin") ? "var(--color-primary)" : "var(--text-secondary)",
                    backgroundColor: "transparent",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "var(--color-primary)";
                    e.currentTarget.style.backgroundColor = "var(--bg-secondary)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isActivePath("/admin")) {
                      e.currentTarget.style.color = "var(--text-secondary)";
                    }
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                  aria-label="Admin Panel"
                  title="Admin Panel"
                >
                  <FiGrid size={20} />
                </motion.button>
              </Link>

              {/* Account dropdown (when logged in) */}
              {isAuthenticated && (
                <div
                  className="relative"
                  onMouseEnter={() => setAccountMenuOpen(true)}
                  onMouseLeave={() => setAccountMenuOpen(false)}
                >
                  <Link to="/account" className="flex items-center">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2 rounded-lg transition-colors"
                      style={{
                        color: isActivePath("/account") ? "var(--color-primary)" : "var(--text-secondary)",
                        backgroundColor: accountMenuOpen ? "var(--bg-secondary)" : "transparent",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = "var(--color-primary)";
                        e.currentTarget.style.backgroundColor = "var(--bg-secondary)";
                      }}
                      onMouseLeave={(e) => {
                        if (!isActivePath("/account")) e.currentTarget.style.color = "var(--text-secondary)";
                      }}
                      aria-label="My Account"
                      aria-expanded={accountMenuOpen}
                    >
                      <FiUser size={20} />
                    </motion.button>
                  </Link>
                  <AnimatePresence>
                    {accountMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full right-0 mt-1 min-w-[200px] py-2 rounded-xl shadow-lg z-50"
                        style={{
                          backgroundColor: "var(--bg-primary)",
                          border: "1px solid var(--border-primary)",
                        }}
                      >
                        <div className="px-3 py-2 border-b" style={{ borderColor: "var(--border-primary)" }}>
                          <p className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                            {user?.name}
                          </p>
                          <p className="text-xs truncate" style={{ color: "var(--text-tertiary)" }}>
                            {user?.email}
                          </p>
                        </div>
                        <nav className="py-1">
                          {[
                            { path: "/account", label: "Dashboard", icon: FiLayout },
                            { path: "/account/profile", label: "Profile", icon: FiUser },
                            { path: "/account/orders", label: "Orders", icon: FiPackage },
                            { path: "/account/addresses", label: "Addresses", icon: FiMapPin },
                            { path: "/account/wishlist", label: "Wishlist", icon: FiHeart },
                            { path: "/account/security", label: "Security", icon: FiShield },
                            { path: "/account/settings", label: "Settings", icon: FiSliders },
                          ].map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path || (item.path === "/account" && location.pathname === "/account");
                            return (
                              <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setAccountMenuOpen(false)}
                                className="flex items-center gap-2 px-3 py-2 text-sm transition-colors"
                                style={{
                                  color: isActive ? "var(--color-primary)" : "var(--text-secondary)",
                                  backgroundColor: isActive ? "var(--bg-secondary)" : "transparent",
                                }}
                              >
                                <Icon size={16} />
                                {item.label}
                              </Link>
                            );
                          })}
                        </nav>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Logout (when logged in) */}
              {isAuthenticated && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setLogoutModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm uppercase tracking-wide transition-all border"
                  style={{
                    borderColor: "var(--border-primary)",
                    color: "var(--text-primary)",
                    backgroundColor: "transparent",
                  }}
                  aria-label="Log out"
                >
                  <FiLogOut size={16} />
                  <span>Logout</span>
                </motion.button>
              )}

              {/* Login / Register (when not logged in) */}
              {!isAuthenticated && (
                <>
                  <Link to="/register">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm uppercase tracking-wide transition-colors border"
                      style={{
                        borderColor: "var(--color-primary)",
                        color: "var(--color-primary)",
                        backgroundColor: "transparent",
                      }}
                      aria-label="Register"
                    >
                      <FiUserPlus size={16} />
                      <span>Register</span>
                    </motion.button>
                  </Link>
                  <Link to="/login">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm uppercase tracking-wide transition-all"
                      style={{
                        backgroundColor: "var(--color-primary)",
                        color: "white",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "var(--active-color)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "var(--color-primary)";
                      }}
                      aria-label="Sign In"
                    >
                      <FiLogIn size={16} />
                      <span>Sign In</span>
                    </motion.button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center space-x-3">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={toggleDarkMode}
                className="p-2 rounded-lg"
                style={{ color: "var(--text-secondary)" }}
                aria-label="Toggle dark mode"
              >
                {isDark ? <FiSun size={22} /> : <FiMoon size={22} />}
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg"
                style={{ color: "var(--text-secondary)" }}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={closeMobileMenu}
            />
            <motion.div
              {...slideInFromRight}
              className="fixed inset-y-0 right-0 w-full max-w-sm shadow-2xl z-50 lg:hidden"
              style={{ backgroundColor: "var(--bg-primary)" }}
            >
              <div className="flex flex-col h-full p-6">
                <div className="flex justify-between items-center mb-8">
                  <Link
                    to="/"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-2"
                  >
                    <img
                      src="/images/logo.png"
                      alt={navigationData.logo}
                      className="h-8 w-auto object-contain"
                    />
                    <span
                      className="text-xl font-bold tracking-wider"
                      style={{ color: "var(--color-primary)" }}
                    >
                      {navigationData.logo}
                    </span>
                  </Link>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={closeMobileMenu}
                    style={{ color: "var(--text-secondary)" }}
                  >
                    <FiX size={24} />
                  </motion.button>
                </div>

                {/* Mobile Search */}
                <form onSubmit={handleSearch} className="mb-6">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search products..."
                      className="w-full px-4 py-3 pr-12 border-2 rounded-lg outline-none transition-colors"
                      style={{
                        borderColor: "var(--border-primary)",
                        backgroundColor: "var(--bg-secondary)",
                        color: "var(--text-primary)",
                      }}
                    />
                    <button
                      type="submit"
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      style={{ color: "var(--color-primary)" }}
                    >
                      <FiSearch size={20} />
                    </button>
                  </div>
                </form>

                <nav className="flex-1 space-y-2 overflow-y-auto">
                  {navigationData.links.map((link, index) => {
                    const isActive = isActivePath(link.path);
                    const isMenOrWomen = link.hasMegaMenu && (link.label === "Men" || link.label === "Women");
                    const tree = isMenOrWomen
                      ? (link.label === "Men" ? categoryTree.Male : categoryTree.Female)
                      : null;
                    const genderSlug = link.label === "Men" ? "men" : link.label === "Women" ? "women" : "";

                    if (isMenOrWomen && tree) {
                      const expanded = mobileExpandedGender === link.label;
                      return (
                        <motion.div
                          key={link.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="space-y-0"
                        >
                          {/* Men / Women row: label + arrow (click anywhere to expand) */}
                          <button
                            type="button"
                            onClick={() => {
                              setMobileExpandedGender((g) => (g === link.label ? null : link.label));
                              if (mobileExpandedGender === link.label) setMobileExpandedSection(null);
                            }}
                            className="w-full flex items-center justify-between px-4 py-3 rounded-lg font-medium text-lg uppercase tracking-wide transition-colors text-left"
                            style={{
                              color: isActive || expanded ? "var(--color-primary)" : "var(--text-secondary)",
                            }}
                          >
                            <span>{link.label}</span>
                            <motion.span
                              animate={{ rotate: expanded ? 90 : 0 }}
                              transition={{ duration: 0.2 }}
                              style={{ color: "var(--text-secondary)" }}
                            >
                              <FiChevronRight size={20} />
                            </motion.span>
                          </button>
                          {/* Section list: Winter Wear, Regular Wear, ... */}
                          {expanded && (
                            <div className="pl-4 pr-2 pb-2 space-y-0">
                              {Object.entries(tree).map(([sectionTitle, sectionValue]) => {
                                const sectionSlug = toSlug(sectionTitle);
                                const sectionExpanded = mobileExpandedSection === sectionTitle;
                                const leafItems = getSectionLeafItems(sectionValue);
                                const hasChildren = leafItems.length > 0;
                                return (
                                  <div key={sectionTitle} className="mt-1">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setMobileExpandedSection((s) =>
                                          s === sectionTitle ? null : sectionTitle
                                        );
                                      }}
                                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-base font-medium transition-colors text-left"
                                      style={{
                                        color: sectionExpanded
                                          ? "var(--color-primary)"
                                          : "var(--text-secondary)",
                                      }}
                                    >
                                      <span className="capitalize">{sectionTitle}</span>
                                      {hasChildren && (
                                        <motion.span
                                          animate={{ rotate: sectionExpanded ? 90 : 0 }}
                                          transition={{ duration: 0.2 }}
                                        >
                                          <FiChevronRight size={18} />
                                        </motion.span>
                                      )}
                                    </button>
                                    {/* Leaf items: Sweatshirts, Hoodies, ... (links) */}
                                    {sectionExpanded && hasChildren && (
                                      <div className="pl-3 pb-2 space-y-0.5">
                                        {leafItems.map((itemLabel) => {
                                          const itemSlug = toSlug(itemLabel);
                                          const href = `/category/${genderSlug}/${sectionSlug}/${itemSlug}`;
                                          return (
                                            <Link
                                              key={itemLabel}
                                              to={href}
                                              onClick={closeMobileMenu}
                                              className="block px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                                              style={{ color: "var(--text-tertiary)" }}
                                            >
                                              {itemLabel}
                                            </Link>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </motion.div>
                      );
                    }

                    return (
                      <motion.div
                        key={link.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Link
                          to={link.path}
                          onClick={closeMobileMenu}
                          className="block px-4 py-3 rounded-lg font-medium text-lg uppercase tracking-wide transition-colors relative"
                          style={{
                            color: isActive ? "var(--color-primary)" : "var(--text-secondary)",
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.color = "var(--color-primary)";
                          }}
                          onMouseLeave={(e) => {
                            if (!isActive) {
                              e.target.style.color = "var(--text-secondary)";
                            }
                          }}
                        >
                          {link.label}
                          {isActive && (
                            <span
                              className="absolute bottom-1 left-4 right-4 h-0.5"
                              style={{ backgroundColor: "var(--color-primary)" }}
                            />
                          )}
                        </Link>
                      </motion.div>
                    );
                  })}
                </nav>

                {/* Mobile Account / Profile routes (when logged in) */}
                {isAuthenticated && (
                  <div className="mb-4 py-3 border-t border-b" style={{ borderColor: "var(--border-primary)" }}>
                    <p className="px-4 text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--text-tertiary)" }}>
                      My Account
                    </p>
                    <div className="space-y-1">
                      {[
                        { path: "/account", label: "Dashboard", icon: FiLayout },
                        { path: "/account/profile", label: "Profile", icon: FiUser },
                        { path: "/account/orders", label: "Orders", icon: FiPackage },
                        { path: "/account/addresses", label: "Addresses", icon: FiMapPin },
                        { path: "/account/wishlist", label: "Wishlist", icon: FiHeart },
                        { path: "/account/security", label: "Security", icon: FiShield },
                        { path: "/account/settings", label: "Settings", icon: FiSliders },
                      ].map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path || (item.path === "/account" && location.pathname === "/account");
                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            onClick={closeMobileMenu}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors"
                            style={{
                              color: isActive ? "var(--color-primary)" : "var(--text-secondary)",
                              backgroundColor: isActive ? "var(--bg-secondary)" : "transparent",
                            }}
                          >
                            <Icon size={18} />
                            {item.label}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Mobile Admin (always visible) */}
                <Link
                  to="/admin"
                  onClick={closeMobileMenu}
                  className="block mb-3"
                >
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm uppercase tracking-wide border-2 relative"
                    style={{
                      borderColor: "var(--color-primary)",
                      backgroundColor: "transparent",
                      color: "var(--color-primary)",
                    }}
                  >
                    <FiGrid size={18} />
                    <span>Admin Panel</span>
                    {isActivePath("/admin") && (
                      <span 
                        className="absolute bottom-1 left-6 right-6 h-0.5"
                        style={{ backgroundColor: "var(--color-primary)" }}
                      />
                    )}
                  </motion.button>
                </Link>

                {/* Mobile Login / Register (when not logged in) */}
                {!isAuthenticated && (
                  <>
                    <Link
                      to="/register"
                      onClick={closeMobileMenu}
                      className="block mb-3"
                    >
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm uppercase tracking-wide border-2"
                        style={{
                          borderColor: "var(--color-primary)",
                          backgroundColor: "transparent",
                          color: "var(--color-primary)",
                        }}
                      >
                        <FiUserPlus size={18} />
                        <span>Register</span>
                      </motion.button>
                    </Link>
                    <Link
                      to="/login"
                      onClick={closeMobileMenu}
                      className="block mb-4"
                    >
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm uppercase tracking-wide"
                        style={{
                          backgroundColor: "var(--color-primary)",
                          color: "white",
                        }}
                      >
                        <FiLogIn size={18} />
                        <span>Sign In</span>
                      </motion.button>
                    </Link>
                  </>
                )}

                {/* Mobile Logout (when logged in) */}
                {isAuthenticated && (
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setLogoutModalOpen(true)}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm uppercase tracking-wide border-2 mb-4"
                    style={{
                      borderColor: "var(--border-primary)",
                      color: "var(--text-primary)",
                      backgroundColor: "transparent",
                    }}
                  >
                    <FiLogOut size={18} />
                    <span>Logout</span>
                  </motion.button>
                )}

                <div
                  className="flex items-center justify-around pt-6 border-t space-x-4"
                  style={{ borderColor: "var(--border-primary)" }}
                >
                  <Link
                    to="/wishlist"
                    onClick={closeMobileMenu}
                    className="relative p-3 rounded-lg transition-colors"
                    style={{
                      color: isActivePath("/wishlist") ? "var(--color-primary)" : "var(--text-secondary)",
                    }}
                  >
                    <FiHeart size={24} />
                    {wishlistCount > 0 && (
                      <span
                        className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
                        style={{ backgroundColor: "var(--color-primary)" }}
                      >
                        {wishlistCount}
                      </span>
                    )}
                  </Link>
                  <Link
                    to="/cart"
                    onClick={closeMobileMenu}
                    className="relative p-3 rounded-lg transition-colors"
                    style={{
                      color: isActivePath("/cart") ? "var(--color-primary)" : "var(--text-secondary)",
                    }}
                  >
                    <FiShoppingBag size={24} />
                    {cartCount > 0 && (
                      <span
                        className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
                        style={{ backgroundColor: "var(--color-primary)" }}
                      >
                        {cartCount}
                      </span>
                    )}
                  </Link>
                  {isAuthenticated && (
                    <Link
                      to="/account"
                      onClick={closeMobileMenu}
                      className="p-3 rounded-lg transition-colors"
                      style={{
                        color: isActivePath("/account") ? "var(--color-primary)" : "var(--text-secondary)",
                      }}
                    >
                      <FiUser size={24} />
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Logout confirmation modal - centered on page */}
      <AnimatePresence>
        {logoutModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-modal-title"
          >
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setLogoutModalOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "tween", duration: 0.2 }}
              className="relative w-full max-w-sm p-6 rounded-2xl shadow-xl"
              style={{
                backgroundColor: "var(--bg-primary)",
                border: "1px solid var(--border-primary)",
              }}
            >
              <h2 id="logout-modal-title" className="text-lg font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                Log out?
              </h2>
              <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
                Are you sure you want to log out?
              </p>
              <div className="flex gap-3 justify-end">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setLogoutModalOpen(false)}
                  className="px-4 py-2.5 rounded-lg font-medium text-sm border"
                  style={{
                    borderColor: "var(--border-primary)",
                    color: "var(--text-primary)",
                    backgroundColor: "transparent",
                  }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLogoutConfirm}
                  className="px-4 py-2.5 rounded-lg font-medium text-sm"
                  style={{
                    backgroundColor: "var(--color-primary)",
                    color: "white",
                  }}
                >
                  Log out
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
