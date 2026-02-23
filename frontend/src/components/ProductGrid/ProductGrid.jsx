import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ProductCard from "../ProductCard";
import { ProductCardSkeleton, EmptyState } from "../";
import { FiGrid, FiList, FiPackage } from "react-icons/fi";

const ProductGrid = ({ products, viewMode: externalViewMode, onViewModeChange, onQuickView, hideViewToggle }) => {
  const [internalViewMode, setInternalViewMode] = useState("grid");
  const viewMode = externalViewMode !== undefined ? externalViewMode : internalViewMode;
  const setViewMode = onViewModeChange || setInternalViewMode;

  if (!products || products.length === 0) {
    return (
      <EmptyState
        icon={FiPackage}
        title="No products found"
        description="Try adjusting your filters or search terms"
        actionLabel="Browse All Products"
        actionPath="/"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* View Mode Toggle — hidden when hideViewToggle (e.g. inside section/subcategory blocks) */}
      {!hideViewToggle && (
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
      )}

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
              ? "grid grid-cols-1 lg:grid-cols-2 gap-8"
              : "space-y-6"
          }
        >
          {products.map((product, index) => (
            <div key={product.id} className={viewMode === "list" ? "w-full" : ""}>
              <ProductCard
                product={product}
                index={index}
                viewMode={viewMode}
                onQuickView={onQuickView}
              />
            </div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default ProductGrid;
