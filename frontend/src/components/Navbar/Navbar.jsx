import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { navigationData } from "../../data/navigation";
import {
  FiSearch,
  FiHeart,
  FiShoppingBag,
  FiUser,
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
  FiShoppingCart,
  FiShield,
  FiSliders,
  FiChevronRight,
  FiGift,
} from "react-icons/fi";
import { categoryTree } from "../../data/categoryTree";
import { slideInFromRight, fadeIn } from "../../utils/animations";
import { useDarkMode } from "../../context/DarkModeContext";
import { getNavMenu } from "../../services/productApi";
import MegaMenu from "./MegaMenu";
import MobileCategoryList from "./MobileCategoryList";
import { useAuth } from "../../context/AuthContext";
import { useWishlist } from "../../context/WishlistContext";
import { useCart } from "../../context/CartContext";
import { useCookieConsent } from "../../context/CookieConsentContext";
import { useChat } from "../../context/ChatContext";
import logoSrc from "../../assets/logo.png";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  /** Mobile only: search bar visible only after tapping search icon (icon-only by default) */
  const [mobileSearchVisible, setMobileSearchVisible] = useState(false);
  /** Mobile only: which gender row is expanded (Men/Women) */
  const [mobileExpandedGender, setMobileExpandedGender] = useState(null);
  /** Mobile only: whether Account dropdown is expanded */
  const [mobileExpandedAccount, setMobileExpandedAccount] = useState(false);
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
  const { shoppingAllowed, decided } = useCookieConsent();
  const { closeChat } = useChat();
  const navigate = useNavigate();
  const location = useLocation();
  const searchInputRef = useRef(null);
  const mobileSearchInputRef = useRef(null);
  const megaLeaveTimer = useRef(null);
  const [navMenu, setNavMenu] = useState({
    men: { featured: [], sectionImages: {} },
    women: { featured: [], sectionImages: {} },
  });

  // Check if a path is active
  const isActivePath = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };


  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 8);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
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

  useEffect(() => {
    setActiveMegaMenu(null);
  }, [location.pathname]);

  useEffect(() => {
    document.body.classList.toggle("mobile-nav-open", mobileMenuOpen);
    if (mobileMenuOpen) closeChat();
    return () => document.body.classList.remove("mobile-nav-open");
  }, [mobileMenuOpen, closeChat]);

  useEffect(() => {
    getNavMenu().then((res) => {
      if (res.success) {
        setNavMenu({
          men: res.men || { featured: [], sectionImages: {} },
          women: res.women || { featured: [], sectionImages: {} },
        });
      }
    });
    return () => {
      if (megaLeaveTimer.current) clearTimeout(megaLeaveTimer.current);
    };
  }, []);

  const handleMegaMenuHover = (label) => {
    if (megaLeaveTimer.current) clearTimeout(megaLeaveTimer.current);
    if (label === "Men" || label === "Women") setActiveMegaMenu(label);
    else setActiveMegaMenu(null);
  };

  const handleMegaMenuLeave = () => {
    if (megaLeaveTimer.current) clearTimeout(megaLeaveTimer.current);
    megaLeaveTimer.current = setTimeout(() => setActiveMegaMenu(null), 180);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setMobileExpandedGender(null);
    setMobileExpandedAccount(false);
  };

  const handleLogoutConfirm = async () => {
    await logout();
    setLogoutModalOpen(false);
    setMobileMenuOpen(false);
    navigate("/");
  };


  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 w-full ${
          isScrolled ? "shadow-md" : "shadow-sm"
        }`}
        style={{ backgroundColor: "var(--bg-primary)" }}
      >
        <div className="w-full px-3 sm:px-5 lg:px-6 xl:px-8 2xl:px-10">
          <div className="flex w-full items-center h-14 sm:h-16 lg:h-[4.25rem] gap-2 sm:gap-3 lg:gap-4">
            {/* Logo */}
            <div className="flex shrink-0 items-center">
              <Link to="/" className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                <img
                  src={logoSrc}
                  alt=""
                  className="h-8 sm:h-9 lg:h-10 w-auto object-contain shrink-0"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
                <span
                  className="text-sm sm:text-base lg:text-base font-bold tracking-[0.16em] uppercase"
                  style={{ color: "var(--color-primary)" }}
                >
                  {navigationData.logo}
                </span>
              </Link>
            </div>

            {searchOpen ? (
              <div className="hidden lg:flex lg:flex-1 min-w-0 items-center justify-center">
                <motion.form
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleSearch}
                  className="w-full max-w-xl flex items-center justify-center gap-2"
                >
                  <div className="relative w-full">
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search..."
                      className="w-full px-4 py-2 pr-16 border-2 rounded-lg outline-none transition-colors text-sm"
                      style={{
                        borderColor: "var(--border-primary)",
                        backgroundColor: "var(--bg-secondary)",
                        color: "var(--text-primary)",
                      }}
                    />
                    <button
                      type="submit"
                      className="absolute right-9 top-1/2 -translate-y-1/2 p-1.5 rounded"
                      style={{ color: "var(--color-primary)" }}
                      aria-label="Search"
                    >
                      <FiSearch size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setSearchOpen(false)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded"
                      style={{ color: "var(--text-secondary)" }}
                      aria-label="Close search"
                    >
                      <FiX size={18} />
                    </button>
                  </div>
                </motion.form>
              </div>
            ) : (
            <div className="hidden lg:flex flex-1 min-w-0 items-center justify-center">
              <div className="flex flex-nowrap items-center justify-center gap-0 xl:gap-0.5">
              {navigationData.links.map((link) => {
                const isActive = isActivePath(link.path);
                return (
                <div
                  key={link.id}
                  className="relative shrink-0"
                  onMouseEnter={() => handleMegaMenuHover(link.label)}
                  onMouseLeave={handleMegaMenuLeave}
                >
                  <Link to={link.path}>
                    <motion.div
                      className="px-2.5 xl:px-3.5 py-2 font-medium text-[11px] xl:text-xs 2xl:text-sm uppercase tracking-[0.16em] transition-colors relative whitespace-nowrap"
                      style={{
                        color: isActive ? "var(--color-primary)" : "var(--text-secondary)",
                      }}
                      whileHover={{
                        color: "var(--color-primary)",
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {link.label}
                    </motion.div>
                  </Link>
                </div>
                );
              })}
              </div>
            </div>
            )}

            {/* Right: desktop icons + mobile controls */}
            <div className="ml-auto flex items-center justify-end gap-2 sm:gap-2.5 lg:gap-3 shrink-0">
              <div className="hidden lg:flex items-center shrink-0">
              <div className="flex items-center gap-2.5 xl:gap-3.5">
              {!searchOpen && (
                <button
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  className="nav-icon-btn"
                  aria-label="Search"
                >
                  <FiSearch size={18} />
                </button>
              )}

              {/* Theme Toggle */}
              <button
                type="button"
                onClick={toggleDarkMode}
                className="nav-icon-btn"
                aria-label="Toggle dark mode"
              >
                {isDark ? <FiSun size={18} /> : <FiMoon size={18} />}
              </button>
              </div>

              <span
                className="mx-3 xl:mx-4 h-4 w-px shrink-0"
                style={{ backgroundColor: "var(--border-primary)" }}
                aria-hidden="true"
              />

              <div className="flex items-center gap-2.5 xl:gap-3.5">
              {/* Wishlist */}
              <Link to="/wishlist" className="nav-icon-btn relative inline-flex" aria-label="Wishlist">
                <FiHeart size={18} style={{ color: isActivePath("/wishlist") ? "var(--color-primary)" : "inherit" }} />
                {wishlistCount > 0 && (
                  <span
                    className="absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] px-0.5 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                    style={{ backgroundColor: "var(--color-primary)" }}
                  >
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link to="/cart" className="nav-icon-btn relative inline-flex" aria-label="Shopping Cart">
                <FiShoppingBag size={18} style={{ color: isActivePath("/cart") ? "var(--color-primary)" : "inherit" }} />
                {cartCount > 0 && (
                  <span
                    className="absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] px-0.5 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                    style={{ backgroundColor: "var(--color-primary)" }}
                  >
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Admin — only visible when user role is admin */}
              {user?.role === "admin" && (
                <Link to="/admin" className="nav-icon-btn inline-flex" aria-label="Admin Panel" title="Admin Panel">
                  <FiGrid size={18} style={{ color: isActivePath("/admin") ? "var(--color-primary)" : "inherit" }} />
                </Link>
              )}

              {/* Account (logged in) or My orders (guest) — same slot */}
              {isAuthenticated ? (
                <div
                  className="relative"
                  onMouseEnter={() => setAccountMenuOpen(true)}
                  onMouseLeave={() => setAccountMenuOpen(false)}
                >
                  <Link to="/account" className="nav-icon-btn inline-flex" aria-label="My Account" aria-expanded={accountMenuOpen}>
                    <FiUser size={18} style={{ color: isActivePath("/account") ? "var(--color-primary)" : "inherit" }} />
                  </Link>
                  <AnimatePresence>
                    {accountMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full right-0 mt-1 min-w-[200px] py-2 rounded-xl shadow-lg z-[100]"
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
                            { path: "/account/cart", label: "Cart", icon: FiShoppingCart },
                            { path: "/account/reward-points", label: "Reward points", icon: FiGift },
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
                          <button
                            type="button"
                            onClick={() => {
                              setAccountMenuOpen(false);
                              setLogoutModalOpen(true);
                            }}
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm font-medium"
                            style={{ color: "#dc2626", backgroundColor: "transparent" }}
                          >
                            <FiLogOut size={16} />
                            Logout
                          </button>
                        </nav>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link to="/my-orders" className="nav-icon-btn inline-flex" title="My orders" aria-label="My orders">
                  <FiPackage
                    size={18}
                    style={{
                      color: location.pathname.startsWith("/my-orders")
                        ? "var(--color-primary)"
                        : "inherit",
                    }}
                  />
                </Link>
              )}

              {!isAuthenticated && (
                <>
                  <Link to="/register">
                    <span
                      className="flex items-center gap-1.5 px-2.5 py-1.5 font-semibold text-[10px] xl:text-[11px] uppercase tracking-wide border"
                      style={{
                        borderColor: "var(--color-primary)",
                        color: "var(--color-primary)",
                        backgroundColor: "transparent",
                      }}
                    >
                      <FiUserPlus size={13} />
                      <span className="hidden xl:inline">Register</span>
                    </span>
                  </Link>
                  <Link to="/login">
                    <span
                      className="flex items-center gap-1.5 px-3 py-1.5 font-semibold text-[10px] xl:text-[11px] uppercase tracking-wide"
                      style={{
                        backgroundColor: "var(--color-primary)",
                        color: "white",
                      }}
                    >
                      <FiLogIn size={13} />
                      <span>Sign In</span>
                    </span>
                  </Link>
                </>
              )}
              </div>
              </div>

            {/* Mobile: search + dark mode + menu */}
            <div className="flex lg:hidden items-center gap-2 shrink-0 justify-end">
              <AnimatePresence mode="wait">
                {mobileSearchVisible ? (
                  <motion.form
                    key="mobile-search-form"
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: "auto", opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onSubmit={handleSearch}
                    className="flex-1 min-w-0 max-w-[110px] sm:max-w-[140px]"
                  >
                    <div className="relative w-full">
                      <input
                        ref={mobileSearchInputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder=""
                        className="w-full px-2 py-1 pr-7 text-[11px] outline-none border"
                        style={{
                          borderColor: "var(--border-primary)",
                          backgroundColor: "var(--bg-secondary)",
                          color: "var(--text-primary)",
                        }}
                      />
                      <button
                        type="submit"
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 p-0.5"
                        style={{ color: "var(--color-primary)" }}
                        aria-label="Search"
                      >
                        <FiSearch size={14} />
                      </button>
                    </div>
                  </motion.form>
                ) : (
                  <button
                    key="mobile-search-icon"
                    type="button"
                    onClick={() => {
                      setMobileSearchVisible(true);
                      setTimeout(() => mobileSearchInputRef.current?.focus(), 100);
                    }}
                    className="nav-icon-btn shrink-0"
                    aria-label="Open search"
                  >
                    <FiSearch size={16} />
                  </button>
                )}
              </AnimatePresence>
              <button
                type="button"
                onClick={toggleDarkMode}
                className="nav-icon-btn shrink-0"
                aria-label="Toggle dark mode"
              >
                {isDark ? <FiSun size={16} /> : <FiMoon size={16} />}
              </button>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="relative w-8 h-8 flex items-center justify-center shrink-0"
                style={{ color: "var(--text-primary)", backgroundColor: "transparent" }}
                aria-label="Toggle menu"
                aria-expanded={mobileMenuOpen}
              >
                <span className="relative block w-[18px] h-[12px]">
                  <span
                    className="absolute left-0 top-0 h-[2px] w-full bg-current transition-all duration-200 ease-out origin-center"
                    style={{
                      transform: mobileMenuOpen ? "translateY(5px) rotate(45deg)" : "none",
                    }}
                  />
                  <span
                    className="absolute left-0 top-[5px] h-[2px] w-full bg-current transition-opacity duration-150 ease-out"
                    style={{ opacity: mobileMenuOpen ? 0 : 1 }}
                  />
                  <span
                    className="absolute left-0 bottom-0 h-[2px] w-full bg-current transition-all duration-200 ease-out origin-center"
                    style={{
                      transform: mobileMenuOpen ? "translateY(-5px) rotate(-45deg)" : "none",
                    }}
                  />
                </span>
              </button>
            </div>
            </div>
          </div>
        </div>
        <AnimatePresence>
          {activeMegaMenu && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.16, ease: "easeOut" }}
              className="hidden lg:block absolute left-0 right-0 top-full z-[100] border-t max-h-[min(68vh,34rem)] overflow-y-auto"
              style={{
                backgroundColor: "var(--bg-primary)",
                borderColor: "var(--border-primary)",
              }}
              onMouseEnter={() => handleMegaMenuHover(activeMegaMenu)}
              onMouseLeave={handleMegaMenuLeave}
            >
              <MegaMenu
                genderLabel={activeMegaMenu}
                categories={navigationData.megaMenuCategories[activeMegaMenu] || []}
                featured={(activeMegaMenu === "Women" ? navMenu.women : navMenu.men).featured}
                onNavigate={() => setActiveMegaMenu(null)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
      <div className="h-14 sm:h-16 lg:h-[4.25rem]" aria-hidden="true" />

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
              className="fixed inset-0 w-full h-full z-50 lg:hidden"
              style={{ backgroundColor: "var(--bg-primary)" }}
            >
              <div className="flex flex-col h-full px-4 py-4">
                <div className="flex justify-between items-center mb-4">
                  <Link
                    to="/"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-2"
                  >
                    <img
                      src={logoSrc}
                      alt=""
                      className="h-7 w-auto object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                    <span
                      className="text-sm font-bold tracking-[0.16em]"
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
                    <FiX size={18} />
                  </motion.button>
                </div>

                {/* Mobile Search */}
                <form onSubmit={handleSearch} className="mb-3">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search products..."
                      className="w-full px-3 py-2 pr-10 border rounded-lg outline-none transition-colors text-sm"
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
                      <FiSearch size={16} />
                    </button>
                  </div>
                </form>

                <nav className="flex-1 space-y-0 overflow-y-auto">
                  {navigationData.links.map((link, index) => {
                    const isActive = isActivePath(link.path);
                    const isMenOrWomen = link.hasMegaMenu && (link.label === "Men" || link.label === "Women");
                    const tree = isMenOrWomen
                      ? (link.label === "Men" ? categoryTree.Male : categoryTree.Female)
                      : null;
                    const genderSlug = link.label === "Men" ? "men" : link.label === "Women" ? "women" : "";

                    if (isMenOrWomen && tree) {
                      const expanded = mobileExpandedGender === link.label;
                      const allProductsPath = `/category/${genderSlug}`;
                      return (
                        <motion.div
                          key={link.id}
                          initial={{ opacity: 0, x: 12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.03 }}
                          className="space-y-0"
                        >
                          <div
                            role="button"
                            tabIndex={0}
                            className="w-full flex items-center justify-between px-3 py-1.5 font-medium text-[13px] uppercase tracking-[0.12em] cursor-pointer touch-manipulation"
                            style={{
                              color: isActive || expanded ? "var(--color-primary)" : "var(--text-secondary)",
                              backgroundColor: "transparent",
                            }}
                            onClick={() => {
                              setMobileExpandedGender((g) => (g === link.label ? null : link.label));
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                setMobileExpandedGender((g) => (g === link.label ? null : link.label));
                              }
                            }}
                            aria-expanded={expanded}
                            aria-label={expanded ? "Collapse categories" : "Expand categories"}
                          >
                            <Link
                              to={allProductsPath}
                              onClick={(e) => {
                                e.stopPropagation();
                                closeMobileMenu();
                              }}
                              className="min-w-0 shrink-0"
                              style={{ color: "inherit", textDecoration: "none" }}
                            >
                              {link.label}
                            </Link>
                            <motion.span
                              className="flex-shrink-0 p-1.5 -mr-1.5 pointer-events-none"
                              style={{ color: "inherit" }}
                              animate={{ rotate: expanded ? 90 : 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <FiChevronRight size={16} />
                            </motion.span>
                          </div>
                          {expanded && (
                            <MobileCategoryList
                              tree={tree}
                              genderSlug={genderSlug}
                              onNavigate={closeMobileMenu}
                            />
                          )}
                        </motion.div>
                      );
                    }

                    return (
                      <motion.div
                        key={link.id}
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                      >
                        <Link
                          to={link.path}
                          onClick={closeMobileMenu}
                          className="block px-3 py-1.5 font-medium text-[13px] uppercase tracking-[0.12em] transition-colors"
                          style={{
                            color: isActive ? "var(--color-primary)" : "var(--text-secondary)",
                            backgroundColor: "transparent",
                            textDecoration: "none",
                          }}
                        >
                          {link.label}
                        </Link>
                      </motion.div>
                    );
                  })}

                  {isAuthenticated && (
                    <motion.div
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-0"
                    >
                      <div
                        role="button"
                        tabIndex={0}
                        className="w-full flex items-center justify-between px-3 py-1.5 font-medium text-[13px] uppercase tracking-[0.12em] cursor-pointer touch-manipulation"
                        style={{
                          color: isActivePath("/account") || mobileExpandedAccount ? "var(--color-primary)" : "var(--text-secondary)",
                          backgroundColor: "transparent",
                        }}
                        onClick={() => {
                          setMobileExpandedAccount((a) => !a);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setMobileExpandedAccount((a) => !a);
                          }
                        }}
                        aria-expanded={mobileExpandedAccount}
                        aria-label={mobileExpandedAccount ? "Collapse account menu" : "Expand account menu"}
                      >
                        <Link
                          to="/account"
                          onClick={(e) => {
                            e.stopPropagation();
                            closeMobileMenu();
                          }}
                          className="min-w-0 shrink-0"
                          style={{ color: "inherit", textDecoration: "none" }}
                        >
                          Account
                        </Link>
                        <motion.span
                          className="flex-shrink-0 p-1.5 -mr-1.5 pointer-events-none"
                          style={{ color: "inherit" }}
                          animate={{ rotate: mobileExpandedAccount ? 90 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <FiChevronRight size={16} />
                        </motion.span>
                      </div>
                      {mobileExpandedAccount && (
                        <div className="pl-4 pr-2 pb-1 space-y-0">
                          {[
                            { path: "/account", label: "Dashboard", icon: FiLayout },
                            { path: "/account/profile", label: "Profile", icon: FiUser },
                            { path: "/account/orders", label: "Orders", icon: FiPackage },
                            { path: "/account/addresses", label: "Addresses", icon: FiMapPin },
                            { path: "/account/wishlist", label: "Wishlist", icon: FiHeart },
                            { path: "/account/cart", label: "Cart", icon: FiShoppingCart },
                            { path: "/account/reward-points", label: "Reward points", icon: FiGift },
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
                                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium transition-colors"
                                style={{
                                  color: isActive ? "var(--color-primary)" : "var(--text-secondary)",
                                  backgroundColor: "transparent",
                                  textDecoration: "none",
                                }}
                              >
                                <Icon size={15} />
                                {item.label}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => setLogoutModalOpen(true)}
                        className="block w-full text-left px-3 py-1.5 font-medium text-[13px] uppercase tracking-[0.12em]"
                        style={{ color: "#dc2626", backgroundColor: "transparent" }}
                      >
                        Logout
                      </button>
                    </motion.div>
                  )}

                  {!isAuthenticated && (
                    <>
                      <Link
                        to="/login"
                        onClick={closeMobileMenu}
                        className="block px-3 py-1.5 font-medium text-[13px] uppercase tracking-[0.12em]"
                        style={{ color: "var(--text-secondary)", textDecoration: "none" }}
                      >
                        Sign In
                      </Link>
                      <Link
                        to="/register"
                        onClick={closeMobileMenu}
                        className="block px-3 py-1.5 font-medium text-[13px] uppercase tracking-[0.12em]"
                        style={{ color: "var(--text-secondary)", textDecoration: "none" }}
                      >
                        Register
                      </Link>
                    </>
                  )}
                </nav>

                <div
                  className="flex items-center justify-center gap-6 pt-4 mt-2 border-t shrink-0"
                  style={{ borderColor: "var(--border-primary)" }}
                >
                  <Link
                    to="/wishlist"
                    onClick={closeMobileMenu}
                    className="relative p-2"
                    style={{ color: isActivePath("/wishlist") ? "var(--color-primary)" : "var(--text-secondary)" }}
                    aria-label="Wishlist"
                  >
                    <FiHeart size={20} />
                    {wishlistCount > 0 && (
                      <span
                        className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-0.5 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                        style={{ backgroundColor: "var(--color-primary)" }}
                      >
                        {wishlistCount}
                      </span>
                    )}
                  </Link>
                  <Link
                    to="/cart"
                    onClick={closeMobileMenu}
                    className="relative p-2"
                    style={{ color: isActivePath("/cart") ? "var(--color-primary)" : "var(--text-secondary)" }}
                    aria-label="Shopping cart"
                  >
                    <FiShoppingBag size={20} />
                    {cartCount > 0 && (
                      <span
                        className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-0.5 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                        style={{ backgroundColor: "var(--color-primary)" }}
                      >
                        {cartCount}
                      </span>
                    )}
                  </Link>
                  {user?.role === "admin" && (
                    <Link
                      to="/admin"
                      onClick={closeMobileMenu}
                      className="relative p-2"
                      style={{ color: isActivePath("/admin") ? "var(--color-primary)" : "var(--text-secondary)" }}
                      aria-label="Admin Panel"
                    >
                      <FiGrid size={20} />
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
