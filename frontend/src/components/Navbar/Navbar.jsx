import { useState, useEffect } from "react";
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
} from "react-icons/fi";
import { slideInFromRight, fadeIn } from "../../utils/animations";
import { useDarkMode } from "../../context/DarkModeContext";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState(null);
  const { isDark, toggleDarkMode } = useDarkMode();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const getIcon = (name) => {
    const icons = {
      search: FiSearch,
      wishlist: FiHeart,
      cart: FiShoppingBag,
      profile: FiUser,
    };
    return icons[name] || FiSearch;
  };

  const handleMegaMenuHover = (label) => {
    if (label === "Men" || label === "Women") {
      setActiveMegaMenu(label);
    }
  };

  const handleMegaMenuLeave = () => {
    setActiveMegaMenu(null);
  };

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{
        backgroundColor: isScrolled
          ? "var(--bg-primary)"
          : "var(--bg-primary)",
        opacity: isScrolled ? 1 : 0.95,
      }}
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 backdrop-blur-sm shadow-md py-3"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="text-2xl font-bold tracking-wider cursor-pointer"
            style={{ color: "var(--color-primary)" }}
          >
            {navigationData.logo}
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navigationData.links.map((link) => (
              <div
                key={link.id}
                className="relative"
                onMouseEnter={() => handleMegaMenuHover(link.label)}
                onMouseLeave={handleMegaMenuLeave}
              >
                <motion.a
                  href={link.path}
                  className="font-medium text-sm uppercase tracking-wide transition-colors"
                  style={{
                    color: "var(--text-secondary)",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = "var(--color-primary)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = "var(--text-secondary)";
                  }}
                  whileHover={{ y: -2 }}
                >
                  {link.label}
                </motion.a>

                {/* Mega Menu */}
                <AnimatePresence>
                  {activeMegaMenu === link.label && link.hasMegaMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-1/2 transform -translate-x-1/2 mt-4 w-[600px] shadow-xl rounded-lg p-8"
                      style={{ backgroundColor: "var(--bg-primary)" }}
                    >
                      <div className="grid grid-cols-2 gap-6">
                        {navigationData.megaMenuCategories[link.label]?.map(
                          (category) => (
                            <div key={category.id}>
                              <h4
                                className="font-semibold mb-3 text-sm uppercase tracking-wide"
                                style={{ color: "var(--color-primary)" }}
                              >
                                {category.title}
                              </h4>
                              <ul className="space-y-2">
                                {category.items.map((item, idx) => (
                                  <li key={idx}>
                                    <a
                                      href="#"
                                      className="text-sm transition-colors"
                                      style={{ color: "var(--text-tertiary)" }}
                                      onMouseEnter={(e) => {
                                        e.target.style.color =
                                          "var(--color-primary)";
                                      }}
                                      onMouseLeave={(e) => {
                                        e.target.style.color =
                                          "var(--text-tertiary)";
                                      }}
                                    >
                                      {item}
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* Icon Actions */}
          <div className="hidden lg:flex items-center space-x-6">
            {/* Dark Mode Toggle */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleDarkMode}
              className="transition-colors"
              style={{ color: "var(--text-secondary)" }}
              onMouseEnter={(e) => {
                e.target.style.color = "var(--color-primary)";
              }}
              onMouseLeave={(e) => {
                e.target.style.color = "var(--text-secondary)";
              }}
              aria-label="Toggle dark mode"
            >
              {isDark ? <FiSun size={20} /> : <FiMoon size={20} />}
            </motion.button>
            {navigationData.iconActions.map((action) => {
              const Icon = getIcon(action.name);
              return (
                <motion.button
                  key={action.id}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="transition-colors"
              style={{ color: "var(--text-secondary)" }}
              onMouseEnter={(e) => {
                e.target.style.color = "var(--color-primary)";
              }}
              onMouseLeave={(e) => {
                e.target.style.color = "var(--text-secondary)";
              }}
                  aria-label={action.label}
                >
                  <Icon size={20} />
                </motion.button>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center space-x-4">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={toggleDarkMode}
              className="text-gray-700 dark:text-gray-300"
              aria-label="Toggle dark mode"
            >
              {isDark ? <FiSun size={24} /> : <FiMoon size={24} />}
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="text-gray-700 dark:text-gray-300"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            {...slideInFromRight}
            className="fixed inset-y-0 right-0 w-full max-w-sm shadow-2xl z-50 lg:hidden"
            style={{ backgroundColor: "var(--bg-primary)" }}
          >
            <div className="flex flex-col h-full p-6">
              <div className="flex justify-between items-center mb-8">
                <span
                  className="text-xl font-bold tracking-wider"
                  style={{ color: "var(--color-primary)" }}
                >
                  {navigationData.logo}
                </span>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FiX size={24} />
                </motion.button>
              </div>

              <nav className="flex-1 space-y-4">
                {navigationData.links.map((link) => (
                  <motion.a
                    key={link.id}
                    href={link.path}
                    className="font-medium text-lg uppercase tracking-wide py-2 transition-colors"
                    style={{ color: "var(--text-secondary)" }}
                    onMouseEnter={(e) => {
                      e.target.style.color = "var(--color-primary)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.color = "var(--text-secondary)";
                    }}
                    onClick={() => setMobileMenuOpen(false)}
                    whileHover={{ x: 5 }}
                  >
                    {link.label}
                  </motion.a>
                ))}
              </nav>

              <div
                className="flex items-center justify-around pt-8 border-t"
                style={{ borderColor: "var(--border-primary)" }}
              >
                {navigationData.iconActions.map((action) => {
                  const Icon = getIcon(action.name);
                  return (
                    <motion.button
                      key={action.id}
                      whileTap={{ scale: 0.95 }}
                      className="text-gray-700 dark:text-gray-300"
                      aria-label={action.label}
                    >
                      <Icon size={24} />
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
