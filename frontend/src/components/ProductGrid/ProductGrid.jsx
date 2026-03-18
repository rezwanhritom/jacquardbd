import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ProductCard from "../ProductCard";
import { ProductCardSkeleton, EmptyState } from "../";
import { FiGrid, FiList, FiPackage } from "react-icons/fi";
import { chunkProductsBrick21 } from "../../utils/productUtils";

function productKey(p) {
  return p?.id ?? p?._id ?? String(p?.slug ?? "");
}

const ProductGrid = ({
  products,
  viewMode: externalViewMode,
  onViewModeChange,
  onQuickView,
  hideViewToggle,
  brickLayout = false,
}) => {
  const [internalViewMode, setInternalViewMode] = useState("grid");
  const viewMode = externalViewMode !== undefined ? externalViewMode : internalViewMode;
  const setViewMode = onViewModeChange || setInternalViewMode;

  const brickRows = useMemo(
    () => (brickLayout && viewMode === "grid" ? chunkProductsBrick21(products || []) : []),
    [brickLayout, viewMode, products]
  );

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

  const viewToggle = !hideViewToggle && (
    <div className="flex items-center justify-end gap-2">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setViewMode("grid")}
        className={`p-2 rounded-lg transition-colors ${viewMode === "grid" ? "bg-opacity-100" : "bg-opacity-50"}`}
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
        className={`p-2 rounded-lg transition-colors ${viewMode === "list" ? "bg-opacity-100" : "bg-opacity-50"}`}
        style={{
          backgroundColor: viewMode === "list" ? "var(--color-primary)" : "var(--bg-secondary)",
          color: viewMode === "list" ? "white" : "var(--text-secondary)",
        }}
        aria-label="List view"
      >
        <FiList size={20} />
      </motion.button>
    </div>
  );

  if (brickLayout && viewMode === "grid") {
    return (
      <div className="space-y-6">
        {viewToggle}
        <AnimatePresence mode="wait">
          <motion.div
            key="brick"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="w-screen max-w-[100vw] relative left-1/2 -translate-x-1/2 overflow-x-clip"
          >
            <div className="flex flex-col">
              {brickRows.map((row, ri) => {
                if (row.type === "pair") {
                  const lone = row.items.length === 1;
                  return (
                    <div
                      key={`brick-pair-${ri}-${row.items.map(productKey).join("-")}`}
                      className={`grid gap-0 ${lone ? "grid-cols-1" : "grid-cols-2"}`}
                      style={{ borderColor: "var(--border-primary)" }}
                    >
                      {row.items.map((product, j) => (
                        <div
                          key={productKey(product)}
                          className={`min-w-0 ${!lone && j === 0 ? "border-r" : ""} border-b`}
                          style={{ borderColor: "var(--border-primary)" }}
                        >
                          <ProductCard
                            product={product}
                            index={ri * 3 + j}
                            viewMode="grid"
                            brickSlot={lone ? "full" : "half"}
                          />
                        </div>
                      ))}
                    </div>
                  );
                }
                return (
                  <div
                    key={`brick-single-${ri}-${productKey(row.items[0])}`}
                    className="border-b w-full min-w-0"
                    style={{ borderColor: "var(--border-primary)" }}
                  >
                    <ProductCard
                      product={row.items[0]}
                      index={ri}
                      viewMode="grid"
                      brickSlot="full"
                    />
                  </div>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {viewToggle}

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
            <div
              key={productKey(product)}
              className={viewMode === "list" ? "w-full min-w-0 max-w-full" : ""}
            >
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
