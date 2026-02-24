import { useEffect } from "react";
import { Outlet, useLocation, Link } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../Navbar";
import Footer from "../Footer";
import { pageTransitionVariants, pageTransitionConfig } from "../../utils/animations";

const Layout = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-theme-primary transition-colors duration-300 overflow-x-hidden w-full max-w-[100vw]">
      {/* Skip to main content link for accessibility */}
      <Link
        to="#main-content"
        className="skip-to-main"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById("main-content")?.focus();
        }}
      >
        Skip to main content
      </Link>
      <header className="sticky top-0 z-50 w-full min-w-0">
        <Navbar />
      </header>
      <main id="main-content" className="flex-1 w-full min-w-0" tabIndex={-1}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageTransitionVariants}
            transition={pageTransitionConfig}
            className="w-full min-w-0 overflow-x-hidden"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <footer className="w-full">
        <Footer />
      </footer>
    </div>
  );
};

export default Layout;
