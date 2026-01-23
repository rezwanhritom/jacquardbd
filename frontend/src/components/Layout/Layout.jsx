import { Outlet, useLocation } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../Navbar";
import Footer from "../Footer";
import { pageTransitionVariants, pageTransitionConfig } from "../../utils/animations";

const Layout = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-theme-primary transition-colors duration-300">
      <header className="sticky top-0 z-50 w-full">
        <Navbar />
      </header>
      <main className="flex-1 w-full overflow-x-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageTransitionVariants}
            transition={pageTransitionConfig}
            className="w-full"
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
