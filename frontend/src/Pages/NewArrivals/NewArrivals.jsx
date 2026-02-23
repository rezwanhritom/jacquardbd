import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiFilter,
  FiX,
  FiChevronDown,
  FiGrid,
  FiList,
  FiArrowRight,
  FiStar,
  FiTruck,
  FiRefreshCw,
} from "react-icons/fi";
import {
  Container,
  ProductGrid,
  ProductSort,
  Pagination,
  QuickView,
  Loading,
} from "../../components";
import { getProductsByCollection } from "../../services/productApi";
import { fadeInUp, staggerContainer } from "../../utils/animations";
import { filterProducts, sortProducts, paginateProducts } from "../../utils/productUtils";
import { mapApiProduct } from "../../utils/productUtils";

const COLLECTION_NAME = "new-arrivals";

const NewArrivals = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    priceRange: { min: 0, max: 1000 },
    sizes: [],
    colors: [],
    categories: [],
  });
  const [sortOption, setSortOption] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const itemsPerPage = 8;

  useEffect(() => {
    setLoading(true);
    setError(null);
    getProductsByCollection(COLLECTION_NAME)
      .then((res) => {
        if (res.success && Array.isArray(res.products)) {
          setProducts(res.products.map(mapApiProduct).map((p) => ({ ...p, badge: "New" })));
        } else {
          setProducts([]);
        }
      })
      .catch(() => {
        setError("Failed to load new arrivals.");
        setProducts([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const normalizedProducts = useMemo(() => products, [products]);

  // Apply filters
  const filteredProducts = useMemo(() => {
    let result = filterProducts(normalizedProducts, filters);
    if (filters.categories && filters.categories.length > 0) {
      result = result.filter((product) =>
        filters.categories.some(
          (cat) =>
            product.category === cat ||
            (typeof product.category === "string" && product.category.includes(cat))
        )
      );
    }
    return result;
  }, [normalizedProducts, filters]);

  // Apply sorting (newest: by createdAt desc; backend already sends newest first)
  const sortedProducts = useMemo(() => {
    if (sortOption === "newest") {
      return [...filteredProducts].sort((a, b) => {
        const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return tB - tA;
      });
    }
    return sortProducts(filteredProducts, sortOption);
  }, [filteredProducts, sortOption]);

  // Paginate
  const { paginatedProducts, totalPages } = useMemo(() => {
    return paginateProducts(sortedProducts, currentPage, itemsPerPage);
  }, [sortedProducts, currentPage, itemsPerPage]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters({
      priceRange: { min: 0, max: 1000 },
      sizes: [],
      colors: [],
      categories: [],
    });
    setCurrentPage(1);
  };

  const handleCategoryToggle = (category) => {
    const categories = filters.categories || [];
    const newCategories = categories.includes(category)
      ? categories.filter((c) => c !== category)
      : [...categories, category];
    handleFilterChange({ ...filters, categories: newCategories });
  };

  const handleSortChange = (newSort) => {
    setSortOption(newSort);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const categories = ["Men", "Women", "Accessories", "Footwear"];
  const hasActiveFilters =
    (filters.sizes && filters.sizes.length > 0) ||
    (filters.colors && filters.colors.length > 0) ||
    (filters.categories && filters.categories.length > 0) ||
    (filters.priceRange && (filters.priceRange.min > 0 || filters.priceRange.max < 1000));

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden py-16 md:py-24"
        style={{ backgroundColor: "var(--bg-secondary)" }}
      >
        <Container>
          <div className="relative z-10 text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <span
                className="inline-block px-4 py-2 text-xs font-semibold uppercase tracking-widest rounded-full mb-6"
                style={{
                  backgroundColor: "var(--color-primary)",
                  color: "white",
                }}
              >
                Just Dropped
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-4xl md:text-6xl font-bold mb-6"
              style={{ color: "var(--text-primary)" }}
            >
              New Arrivals
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-lg md:text-xl mb-8 leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            >
              Discover our latest collection of premium fashion pieces. Fresh styles, 
              timeless designs, and exceptional quality — curated just for you.
            </motion.p>
          </div>

          {/* Decorative Elements */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.1, scale: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl"
            style={{ backgroundColor: "var(--color-primary)" }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.1, scale: 1 }}
            transition={{ delay: 0.7, duration: 1 }}
            className="absolute bottom-0 left-0 w-64 h-64 rounded-full blur-3xl"
            style={{ backgroundColor: "var(--color-secondary)" }}
          />
        </Container>
      </motion.section>

      {/* Promotional Banner */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="py-4"
        style={{ backgroundColor: "var(--color-primary)" }}
      >
        <Container>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-12 text-white text-center md:text-left">
            <div className="flex items-center gap-2">
              <FiTruck size={20} />
              <span className="text-sm font-medium">Free shipping only</span>
            </div>
            <div className="flex items-center gap-2">
              <FiRefreshCw size={20} />
              <span className="text-sm font-medium">15 day return option</span>
            </div>
            <div className="flex items-center gap-2">
              <FiStar size={20} />
              <span className="text-sm font-medium">Exclusive member rewards</span>
            </div>
          </div>
        </Container>
      </motion.section>

      {/* Main Content */}
      <section className="py-12 md:py-16">
        <Container>
          <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="space-y-8"
          >
            {/* Toolbar & filters: only when we have products */}
            {!loading && !error && products.length > 0 && (
              <>
                <motion.div
                  variants={fadeInUp}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b"
                  style={{ borderColor: "var(--border-primary)" }}
                >
                  <div className="flex items-center gap-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setMobileFiltersOpen(true)}
                      className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors"
                      style={{
                        backgroundColor: "var(--bg-secondary)",
                        color: "var(--text-primary)",
                      }}
                    >
                      <FiFilter size={18} />
                      Filters
                      {hasActiveFilters && (
                        <span
                          className="w-5 h-5 rounded-full text-xs flex items-center justify-center text-white"
                          style={{ backgroundColor: "var(--color-primary)" }}
                        >
                          {(filters.categories?.length || 0) +
                            (filters.sizes?.length || 0) +
                            (filters.colors?.length || 0)}
                        </span>
                      )}
                    </motion.button>
                    <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                      <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
                        {sortedProducts.length}
                      </span>{" "}
                      new {sortedProducts.length === 1 ? "arrival" : "arrivals"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div
                      className="hidden sm:flex items-center rounded-lg p-1"
                      style={{ backgroundColor: "var(--bg-secondary)" }}
                    >
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setViewMode("grid")}
                        className="p-2 rounded-lg transition-colors"
                        style={{
                          backgroundColor:
                            viewMode === "grid" ? "var(--bg-primary)" : "transparent",
                          color:
                            viewMode === "grid"
                              ? "var(--color-primary)"
                              : "var(--text-tertiary)",
                        }}
                      >
                        <FiGrid size={18} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setViewMode("list")}
                        className="p-2 rounded-lg transition-colors"
                        style={{
                          backgroundColor:
                            viewMode === "list" ? "var(--bg-primary)" : "transparent",
                          color:
                            viewMode === "list"
                              ? "var(--color-primary)"
                              : "var(--text-tertiary)",
                        }}
                      >
                        <FiList size={18} />
                      </motion.button>
                    </div>
                    <ProductSort
                      currentSort={sortOption}
                      onSortChange={handleSortChange}
                    />
                  </div>
                </motion.div>
                <AnimatePresence>
                  {hasActiveFilters && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex flex-wrap items-center gap-2"
                    >
                      <span
                        className="text-sm font-medium"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        Active filters:
                      </span>
                      {filters.categories?.map((cat) => (
                        <motion.button
                          key={cat}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          whileHover={{ scale: 1.05 }}
                          onClick={() => handleCategoryToggle(cat)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: "var(--bg-secondary)",
                            color: "var(--text-primary)",
                          }}
                        >
                          {cat}
                          <FiX size={14} />
                        </motion.button>
                      ))}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleClearFilters}
                        className="text-xs font-medium underline"
                        style={{ color: "var(--color-primary)" }}
                      >
                        Clear all
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}

            {/* Products Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Desktop Sidebar Filters: only when we have products */}
              {!loading && !error && products.length > 0 && (
                <motion.aside
                  variants={fadeInUp}
                  className="hidden lg:block lg:col-span-1"
                >
                  <div className="sticky top-24">
                    <DesktopFilters
                      filters={filters}
                      onFilterChange={handleFilterChange}
                      onClearFilters={handleClearFilters}
                      categories={categories}
                      onCategoryToggle={handleCategoryToggle}
                    />
                  </div>
                </motion.aside>
              )}

              {/* Products */}
              <div
                className={
                  !loading && !error && products.length > 0 ? "lg:col-span-3" : "lg:col-span-4"
                }
              >
                {loading ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-center items-center py-24"
                  >
                    <Loading />
                  </motion.div>
                ) : error ? (
                  <NewArrivalsErrorState
                    message={error}
                    onRetry={() => {
                      setError(null);
                      setLoading(true);
                      getProductsByCollection(COLLECTION_NAME)
                        .then((res) => {
                          if (res.success && Array.isArray(res.products)) {
                            setProducts(res.products.map(mapApiProduct).map((p) => ({ ...p, badge: "New" })));
                          } else setProducts([]);
                        })
                        .catch(() => setError("Failed to load new arrivals."))
                        .finally(() => setLoading(false));
                    }}
                  />
                ) : products.length === 0 ? (
                  <NewArrivalsEmptyState />
                ) : paginatedProducts.length > 0 ? (
                  <>
                    <ProductGrid
                      products={paginatedProducts}
                      viewMode={viewMode}
                      onQuickView={setQuickViewProduct}
                    />
                    {totalPages > 1 && (
                      <div className="mt-12">
                        <Pagination
                          currentPage={currentPage}
                          totalPages={totalPages}
                          onPageChange={handlePageChange}
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <EmptyResults onClearFilters={handleClearFilters} />
                )}
              </div>
            </div>
          </motion.div>
        </Container>
      </section>

      {/* Featured Collection CTA */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="py-16 md:py-24"
        style={{ backgroundColor: "var(--bg-secondary)" }}
      >
        <Container>
          <div className="text-center max-w-2xl mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{ color: "var(--text-primary)" }}
            >
              Explore More Collections
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg mb-8"
              style={{ color: "var(--text-secondary)" }}
            >
              Discover our full range of premium fashion pieces
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-lg font-semibold text-sm uppercase tracking-wide text-white transition-colors"
                style={{ backgroundColor: "var(--color-primary)" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--active-color)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--color-primary)";
                }}
              >
                Shop All Products
                <FiArrowRight size={18} />
              </Link>
            </motion.div>
          </div>
        </Container>
      </motion.section>

      {/* Mobile Filters Panel */}
      <MobileFiltersPanel
        isOpen={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        categories={categories}
        onCategoryToggle={handleCategoryToggle}
        resultsCount={sortedProducts.length}
      />

      {/* Quick View Modal */}
      <QuickView
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={(item) => {
          console.log("Add to cart:", item);
          setQuickViewProduct(null);
        }}
        onAddToWishlist={(product) => {
          console.log("Add to wishlist:", product);
        }}
      />
    </div>
  );
};

// Desktop Filters Component
const DesktopFilters = ({
  filters,
  onFilterChange,
  onClearFilters,
  categories,
  onCategoryToggle,
}) => {
  const [openSections, setOpenSections] = useState({
    category: true,
    price: true,
    size: true,
    color: true,
  });

  const toggleSection = (section) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const sizes = ["XS", "S", "M", "L", "XL", "XXL"];
  const colors = [
    { name: "Black", value: "#000000" },
    { name: "White", value: "#FFFFFF" },
    { name: "Gray", value: "#808080" },
    { name: "Navy", value: "#000080" },
    { name: "Beige", value: "#F5F5DC" },
    { name: "Brown", value: "#8B4513" },
  ];

  const handleSizeToggle = (size) => {
    const sizes = filters.sizes || [];
    const newSizes = sizes.includes(size)
      ? sizes.filter((s) => s !== size)
      : [...sizes, size];
    onFilterChange({ ...filters, sizes: newSizes });
  };

  const handleColorToggle = (color) => {
    const colors = filters.colors || [];
    const newColors = colors.includes(color)
      ? colors.filter((c) => c !== color)
      : [...colors, color];
    onFilterChange({ ...filters, colors: newColors });
  };

  const handlePriceChange = (min, max) => {
    onFilterChange({ ...filters, priceRange: { min, max } });
  };

  const hasActiveFilters =
    (filters.sizes && filters.sizes.length > 0) ||
    (filters.colors && filters.colors.length > 0) ||
    (filters.categories && filters.categories.length > 0) ||
    (filters.priceRange && (filters.priceRange.min > 0 || filters.priceRange.max < 1000));

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6 p-6 rounded-xl"
      style={{ backgroundColor: "var(--bg-secondary)" }}
    >
      <div className="flex items-center justify-between">
        <h3
          className="text-lg font-bold"
          style={{ color: "var(--text-primary)" }}
        >
          Filters
        </h3>
        {hasActiveFilters && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClearFilters}
            className="text-xs font-medium flex items-center gap-1"
            style={{ color: "var(--color-primary)" }}
          >
            <FiX size={14} />
            Clear All
          </motion.button>
        )}
      </div>

      {/* Category Filter */}
      <FilterSection
        title="Category"
        isOpen={openSections.category}
        onToggle={() => toggleSection("category")}
      >
        <div className="space-y-2">
          {categories.map((cat) => (
            <motion.button
              key={cat}
              whileHover={{ x: 4 }}
              onClick={() => onCategoryToggle(cat)}
              className="w-full flex items-center justify-between py-2 text-sm transition-colors"
              style={{
                color: filters.categories?.includes(cat)
                  ? "var(--color-primary)"
                  : "var(--text-secondary)",
              }}
            >
              <span className={filters.categories?.includes(cat) ? "font-medium" : ""}>
                {cat}
              </span>
              {filters.categories?.includes(cat) && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: "var(--color-primary)" }}
                />
              )}
            </motion.button>
          ))}
        </div>
      </FilterSection>

      {/* Price Filter */}
      <FilterSection
        title="Price"
        isOpen={openSections.price}
        onToggle={() => toggleSection("price")}
      >
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <input
              type="number"
              placeholder="Min"
              value={filters.priceRange?.min || ""}
              onChange={(e) =>
                handlePriceChange(
                  parseFloat(e.target.value) || 0,
                  filters.priceRange?.max || 1000
                )
              }
              className="w-full px-3 py-2 text-sm border rounded-lg outline-none transition-colors"
              style={{
                borderColor: "var(--border-primary)",
                backgroundColor: "var(--bg-primary)",
                color: "var(--text-primary)",
              }}
            />
            <span style={{ color: "var(--text-tertiary)" }}>—</span>
            <input
              type="number"
              placeholder="Max"
              value={filters.priceRange?.max || ""}
              onChange={(e) =>
                handlePriceChange(
                  filters.priceRange?.min || 0,
                  parseFloat(e.target.value) || 1000
                )
              }
              className="w-full px-3 py-2 text-sm border rounded-lg outline-none transition-colors"
              style={{
                borderColor: "var(--border-primary)",
                backgroundColor: "var(--bg-primary)",
                color: "var(--text-primary)",
              }}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Under ৳50", min: 0, max: 50 },
              { label: "৳50-৳100", min: 50, max: 100 },
              { label: "৳100-৳200", min: 100, max: 200 },
              { label: "৳200+", min: 200, max: 1000 },
            ].map((range) => (
              <motion.button
                key={range.label}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handlePriceChange(range.min, range.max)}
                className="px-3 py-1.5 text-xs rounded-lg transition-colors"
                style={{
                  backgroundColor:
                    filters.priceRange?.min === range.min &&
                    filters.priceRange?.max === range.max
                      ? "var(--color-primary)"
                      : "var(--bg-primary)",
                  color:
                    filters.priceRange?.min === range.min &&
                    filters.priceRange?.max === range.max
                      ? "white"
                      : "var(--text-secondary)",
                }}
              >
                {range.label}
              </motion.button>
            ))}
          </div>
        </div>
      </FilterSection>

      {/* Size Filter */}
      <FilterSection
        title="Size"
        isOpen={openSections.size}
        onToggle={() => toggleSection("size")}
      >
        <div className="flex flex-wrap gap-2">
          {sizes.map((size) => (
            <motion.button
              key={size}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleSizeToggle(size)}
              className="w-10 h-10 rounded-lg text-xs font-medium transition-colors"
              style={{
                backgroundColor: filters.sizes?.includes(size)
                  ? "var(--color-primary)"
                  : "var(--bg-primary)",
                color: filters.sizes?.includes(size)
                  ? "white"
                  : "var(--text-secondary)",
              }}
            >
              {size}
            </motion.button>
          ))}
        </div>
      </FilterSection>

      {/* Color Filter */}
      <FilterSection
        title="Color"
        isOpen={openSections.color}
        onToggle={() => toggleSection("color")}
      >
        <div className="flex flex-wrap gap-3">
          {colors.map((color) => (
            <motion.button
              key={color.name}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleColorToggle(color.name)}
              className="relative"
              title={color.name}
            >
              <div
                className="w-8 h-8 rounded-full border-2 transition-all"
                style={{
                  backgroundColor: color.value,
                  borderColor: filters.colors?.includes(color.name)
                    ? "var(--color-primary)"
                    : "var(--border-primary)",
                  borderWidth: filters.colors?.includes(color.name) ? "3px" : "2px",
                }}
              />
            </motion.button>
          ))}
        </div>
      </FilterSection>
    </motion.div>
  );
};

// Filter Section Component
const FilterSection = ({ title, isOpen, onToggle, children }) => {
  return (
    <div
      className="border-t pt-4"
      style={{ borderColor: "var(--border-primary)" }}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between mb-3"
      >
        <h4
          className="font-semibold text-sm"
          style={{ color: "var(--text-primary)" }}
        >
          {title}
        </h4>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <FiChevronDown size={16} style={{ color: "var(--text-secondary)" }} />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Mobile Filters Panel
const MobileFiltersPanel = ({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  onClearFilters,
  categories,
  onCategoryToggle,
  resultsCount,
}) => {
  const sizes = ["XS", "S", "M", "L", "XL", "XXL"];
  const colors = [
    { name: "Black", value: "#000000" },
    { name: "White", value: "#FFFFFF" },
    { name: "Gray", value: "#808080" },
    { name: "Navy", value: "#000080" },
    { name: "Beige", value: "#F5F5DC" },
    { name: "Brown", value: "#8B4513" },
  ];

  const handleSizeToggle = (size) => {
    const sizes = filters.sizes || [];
    const newSizes = sizes.includes(size)
      ? sizes.filter((s) => s !== size)
      : [...sizes, size];
    onFilterChange({ ...filters, sizes: newSizes });
  };

  const handleColorToggle = (color) => {
    const colors = filters.colors || [];
    const newColors = colors.includes(color)
      ? colors.filter((c) => c !== color)
      : [...colors, color];
    onFilterChange({ ...filters, colors: newColors });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 w-full max-w-sm z-50 lg:hidden overflow-y-auto"
            style={{ backgroundColor: "var(--bg-primary)" }}
          >
            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h2
                  className="text-xl font-bold"
                  style={{ color: "var(--text-primary)" }}
                >
                  Filters
                </h2>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: "var(--bg-secondary)" }}
                >
                  <FiX size={20} style={{ color: "var(--text-primary)" }} />
                </motion.button>
              </div>

              {/* Categories */}
              <div>
                <h3
                  className="font-semibold mb-3"
                  style={{ color: "var(--text-primary)" }}
                >
                  Category
                </h3>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <motion.button
                      key={cat}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onCategoryToggle(cat)}
                      className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      style={{
                        backgroundColor: filters.categories?.includes(cat)
                          ? "var(--color-primary)"
                          : "var(--bg-secondary)",
                        color: filters.categories?.includes(cat)
                          ? "white"
                          : "var(--text-secondary)",
                      }}
                    >
                      {cat}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Sizes */}
              <div>
                <h3
                  className="font-semibold mb-3"
                  style={{ color: "var(--text-primary)" }}
                >
                  Size
                </h3>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => (
                    <motion.button
                      key={size}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleSizeToggle(size)}
                      className="w-12 h-12 rounded-lg text-sm font-medium transition-colors"
                      style={{
                        backgroundColor: filters.sizes?.includes(size)
                          ? "var(--color-primary)"
                          : "var(--bg-secondary)",
                        color: filters.sizes?.includes(size)
                          ? "white"
                          : "var(--text-secondary)",
                      }}
                    >
                      {size}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Colors */}
              <div>
                <h3
                  className="font-semibold mb-3"
                  style={{ color: "var(--text-primary)" }}
                >
                  Color
                </h3>
                <div className="flex flex-wrap gap-3">
                  {colors.map((color) => (
                    <motion.button
                      key={color.name}
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleColorToggle(color.name)}
                      className="relative"
                      title={color.name}
                    >
                      <div
                        className="w-10 h-10 rounded-full border-2 transition-all"
                        style={{
                          backgroundColor: color.value,
                          borderColor: filters.colors?.includes(color.name)
                            ? "var(--color-primary)"
                            : "var(--border-primary)",
                          borderWidth: filters.colors?.includes(color.name)
                            ? "3px"
                            : "2px",
                        }}
                      />
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClearFilters}
                  className="flex-1 py-3 rounded-lg font-semibold text-sm transition-colors"
                  style={{
                    border: "2px solid var(--border-primary)",
                    color: "var(--text-primary)",
                  }}
                >
                  Clear All
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="flex-1 py-3 rounded-lg font-semibold text-sm text-white transition-colors"
                  style={{ backgroundColor: "var(--color-primary)" }}
                >
                  Show {resultsCount} Results
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Error state: API failed
const NewArrivalsErrorState = ({ message, onRetry }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className="text-center py-16"
  >
    <div
      className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
      style={{ backgroundColor: "var(--bg-secondary)" }}
    >
      <FiRefreshCw size={32} style={{ color: "var(--text-tertiary)" }} />
    </div>
    <h3 className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
      Something went wrong
    </h3>
    <p className="text-sm mb-6 max-w-md mx-auto" style={{ color: "var(--text-secondary)" }}>
      {message}
    </p>
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onRetry}
      className="px-6 py-3 rounded-lg font-semibold text-sm text-white transition-colors"
      style={{ backgroundColor: "var(--color-primary)" }}
    >
      Try again
    </motion.button>
  </motion.div>
);

// Empty state: collection has no products
const NewArrivalsEmptyState = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className="text-center py-16"
  >
    <div
      className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
      style={{ backgroundColor: "var(--bg-secondary)" }}
    >
      <FiGrid size={32} style={{ color: "var(--text-tertiary)" }} />
    </div>
    <h3 className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
      No new arrivals yet
    </h3>
    <p className="text-sm mb-6 max-w-md mx-auto" style={{ color: "var(--text-secondary)" }}>
      Check back soon or explore our full collection.
    </p>
    <Link
      to="/"
      className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm text-white transition-colors"
      style={{ backgroundColor: "var(--color-primary)" }}
    >
      Shop all products
      <FiArrowRight size={18} />
    </Link>
  </motion.div>
);

// Empty results: filters returned no products
const EmptyResults = ({ onClearFilters }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-16"
    >
      <div
        className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
        style={{ backgroundColor: "var(--bg-secondary)" }}
      >
        <FiFilter size={32} style={{ color: "var(--text-tertiary)" }} />
      </div>
      <h3
        className="text-xl font-bold mb-2"
        style={{ color: "var(--text-primary)" }}
      >
        No products found
      </h3>
      <p
        className="text-sm mb-6 max-w-md mx-auto"
        style={{ color: "var(--text-secondary)" }}
      >
        Try adjusting your filters to find what you're looking for.
      </p>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClearFilters}
        className="px-6 py-3 rounded-lg font-semibold text-sm text-white transition-colors"
        style={{ backgroundColor: "var(--color-primary)" }}
      >
        Clear All Filters
      </motion.button>
    </motion.div>
  );
};

export default NewArrivals;
