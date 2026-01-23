import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ProductCard from "../ProductCard";
import { FiGrid, FiList } from "react-icons/fi";

const ProductGrid = ({ products, viewMode: externalViewMode, onViewModeChange }) => {
  const [internalViewMode, setInternalViewMode] = useState("grid");
  const viewMode = externalViewMode !== undefined ? externalViewMode : internalViewMode;
  const setViewMode = onViewModeChange || setInternalViewMode;

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-lg" style={{ color: "var(--text-secondary)" }}>
          No products found
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* View Mode Toggle */}
      <div className="flex items-center justify-end gap-2">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setViewMode("grid")}
          className={`p-2 rounded-lg transition-colors ${
            viewMode === "grid" ? "bg-opacity-100" : "bg-opacity-50"
          }`}
          style={{
            backgroundColor: viewMode === "grid" ? "var(--color-primary)" : "var(--bg-secondary)",
            color: viewMode === "grid" ? "white" : "var(--text-secondary)",
          }}
          aria-label="Grid view"
        >
          <FiGrid size={20} />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setViewMode("list")}
          className={`p-2 rounded-lg transition-colors ${
            viewMode === "list" ? "bg-opacity-100" : "bg-opacity-50"
          }`}
          style={{
            backgroundColor: viewMode === "list" ? "var(--color-primary)" : "var(--bg-secondary)",
            color: viewMode === "list" ? "white" : "var(--text-secondary)",
          }}
          aria-label="List view"
        >
          <FiList size={20} />
        </motion.button>
      </div>

      {/* Products Grid/List */}
      <AnimatePresence mode="wait">
        <motion.div
          key={viewMode}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "space-y-6"
          }
        >
          {products.map((product, index) => (
            <div key={product.id} className={viewMode === "list" ? "w-full" : ""}>
              <ProductCard
                product={product}
                index={index}
                viewMode={viewMode}
              />
            </div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default ProductGrid;
