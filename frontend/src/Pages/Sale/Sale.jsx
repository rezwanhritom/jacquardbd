import { useState, useMemo } from "react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiFilter,
  FiX,
  FiChevronDown,
  FiClock,
  FiPercent,
  FiZap,
  FiTrendingDown,
  FiTag,
  FiAlertCircle,
} from "react-icons/fi";
import {
  Container,
  ProductGrid,
  Pagination,
  QuickView,
} from "../../components";
import { productsData } from "../../data/products";
import { fadeInUp, staggerContainer } from "../../utils/animations";
import { filterProducts, paginateProducts } from "../../utils/productUtils";

// Create sale products with enhanced discount data
const saleProducts = productsData
  .map((product) => ({
    ...product,
    // Ensure all products have discounts for the sale page
    discount: product.discount || Math.floor(Math.random() * 40) + 15,
    originalPrice: product.originalPrice || product.price * (1 + Math.random() * 0.5),
    badge: "Sale",
    // Add urgency indicators
    isLimitedTime: Math.random() > 0.7,
    isLowStock: Math.random() > 0.75,
    stockCount: Math.floor(Math.random() * 10) + 1,
    // Calculate discounted price
  }))
  .map((product) => ({
    ...product,
    price: product.originalPrice * (1 - product.discount / 100),
  }));

// Sort options specific to sale page
const sortOptions = [
  { value: "discount-high", label: "Biggest Discount" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "popular", label: "Most Popular" },
  { value: "ending-soon", label: "Ending Soon" },
];

const Sale = () => {
  const [filters, setFilters] = useState({
    priceRange: { min: 0, max: 500 },
    sizes: [],
    colors: [],
    categories: [],
    discountRange: { min: 0, max: 100 },
  });
  const [sortOption, setSortOption] = useState("discount-high");
  const [currentPage, setCurrentPage] = useState(1);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const itemsPerPage = 8;

  // Apply filters
  const filteredProducts = useMemo(() => {
    let result = filterProducts(saleProducts, filters);

    // Filter by category
    if (filters.categories && filters.categories.length > 0) {
      result = result.filter((product) =>
        filters.categories.includes(product.category)
      );
    }

    // Filter by discount range
    if (filters.discountRange) {
      result = result.filter(
        (product) =>
          product.discount >= filters.discountRange.min &&
          product.discount <= filters.discountRange.max
      );
    }

    return result;
  }, [filters]);

  // Apply sorting
  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts];

    switch (sortOption) {
      case "discount-high":
        return sorted.sort((a, b) => b.discount - a.discount);
      case "price-low":
        return sorted.sort((a, b) => a.price - b.price);
      case "price-high":
        return sorted.sort((a, b) => b.price - a.price);
      case "popular":
        return sorted.sort((a, b) => (b.badge === "Best Seller" ? 1 : -1));
      case "ending-soon":
        return sorted.sort((a, b) => (a.isLimitedTime ? -1 : 1));
      default:
        return sorted;
    }
  }, [filteredProducts, sortOption]);

  // Paginate
  const { paginatedProducts, totalPages } = useMemo(() => {
    return paginateProducts(sortedProducts, currentPage, itemsPerPage);
  }, [sortedProducts, currentPage, itemsPerPage]);

  // Calculate stats
  const stats = useMemo(() => {
    const maxDiscount = Math.max(...saleProducts.map((p) => p.discount));
    const totalSavings = saleProducts.reduce(
      (acc, p) => acc + (p.originalPrice - p.price),
      0
    );
    return { maxDiscount, totalSavings };
  }, []);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters({
      priceRange: { min: 0, max: 500 },
      sizes: [],
      colors: [],
      categories: [],
      discountRange: { min: 0, max: 100 },
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

  const handleDiscountFilter = (min, max) => {
    handleFilterChange({ ...filters, discountRange: { min, max } });
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
    (filters.discountRange && filters.discountRange.min > 0);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative overflow-hidden py-16 md:py-24"
        style={{ backgroundColor: "var(--color-tertiary)" }}
      >
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05, duration: 0.5 }}
              className="absolute text-white font-bold"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                fontSize: `${Math.random() * 40 + 20}px`,
                transform: `rotate(${Math.random() * 40 - 20}deg)`,
              }}
            >
              %
            </motion.div>
          ))}
        </div>

        <Container>
          <div className="relative z-10 text-center">
            {/* Sale Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className="inline-block mb-6"
            >
              <div className="relative">
                <div className="px-6 py-3 bg-white rounded-full shadow-xl">
                  <span className="text-2xl md:text-3xl font-black" style={{ color: "var(--color-tertiary)" }}>
                    UP TO {stats.maxDiscount}% OFF
                  </span>
                </div>
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute -top-3 -right-3 w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center"
                >
                  <FiZap className="text-yellow-900" size={20} />
                </motion.div>
              </div>
            </motion.div>

            {/* Main Title */}
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-5xl md:text-7xl font-black text-white mb-4 tracking-tight"
            >
              MEGA SALE
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto"
            >
              Don't miss out on incredible savings. Limited time offers on premium fashion.
            </motion.p>

            {/* Countdown Timer (Mock) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex items-center justify-center gap-2 mb-8"
            >
              <FiClock className="text-white" size={20} />
              <span className="text-white font-medium">Sale ends in:</span>
              <div className="flex gap-2">
                {[
                  { value: "02", label: "Days" },
                  { value: "14", label: "Hours" },
                  { value: "36", label: "Mins" },
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 + idx * 0.1 }}
                    className="bg-white/20 backdrop-blur-sm px-3 py-2 rounded-lg text-center min-w-[60px]"
                  >
                    <div className="text-2xl font-bold text-white">{item.value}</div>
                    <div className="text-xs text-white/70 uppercase">{item.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="flex flex-wrap justify-center gap-6 text-white"
            >
              <div className="flex items-center gap-2">
                <FiTag size={18} />
                <span>{saleProducts.length} Items on Sale</span>
              </div>
              <div className="flex items-center gap-2">
                <FiTrendingDown size={18} />
                <span>Save up to ${stats.totalSavings.toFixed(0)}</span>
              </div>
            </motion.div>
          </div>
        </Container>

        {/* Decorative Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" className="w-full">
            <path
              d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              style={{ fill: "var(--bg-primary)" }}
            />
          </svg>
        </div>
      </motion.section>

      {/* Discount Quick Filters */}
      <section className="py-8 border-b" style={{ borderColor: "var(--border-primary)" }}>
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-3"
          >
            <span className="text-sm font-medium mr-2" style={{ color: "var(--text-secondary)" }}>
              Shop by discount:
            </span>
            {[
              { label: "All Deals", min: 0, max: 100 },
              { label: "10-20% Off", min: 10, max: 20 },
              { label: "20-30% Off", min: 20, max: 30 },
              { label: "30-50% Off", min: 30, max: 50 },
              { label: "50%+ Off", min: 50, max: 100 },
            ].map((range, idx) => {
              const isActive =
                filters.discountRange?.min === range.min &&
                filters.discountRange?.max === range.max;
              return (
                <motion.button
                  key={idx}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDiscountFilter(range.min, range.max)}
                  className="px-4 py-2 rounded-full text-sm font-medium transition-all"
                  style={{
                    backgroundColor: isActive ? "var(--color-tertiary)" : "var(--bg-secondary)",
                    color: isActive ? "white" : "var(--text-secondary)",
                  }}
                >
                  {range.label}
                </motion.button>
              );
            })}
          </motion.div>
        </Container>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <Container>
          <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="space-y-8"
          >
            {/* Sticky Toolbar */}
            <motion.div
              variants={fadeInUp}
              className="sticky top-0 z-30 py-4 -mx-4 px-4 backdrop-blur-md"
              style={{ backgroundColor: "var(--bg-primary-alpha, var(--bg-primary))" }}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  {/* Mobile Filter Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setMobileFiltersOpen(true)}
                    className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm"
                    style={{
                      backgroundColor: "var(--color-tertiary)",
                      color: "white",
                    }}
                  >
                    <FiFilter size={18} />
                    Filters
                    {hasActiveFilters && (
                      <span className="w-5 h-5 rounded-full text-xs flex items-center justify-center bg-white text-red-500 font-bold">
                        !
                      </span>
                    )}
                  </motion.button>

                  {/* Results */}
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                    <span className="font-bold" style={{ color: "var(--color-tertiary)" }}>
                      {sortedProducts.length}
                    </span>{" "}
                    deals found
                  </p>
                </div>

                {/* Sort Dropdown */}
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm border-2"
                    style={{
                      borderColor: "var(--border-primary)",
                      backgroundColor: "var(--bg-primary)",
                      color: "var(--text-primary)",
                    }}
                  >
                    Sort: {sortOptions.find((o) => o.value === sortOption)?.label}
                    <motion.div animate={{ rotate: sortDropdownOpen ? 180 : 0 }}>
                      <FiChevronDown size={18} />
                    </motion.div>
                  </motion.button>

                  <AnimatePresence>
                    {sortDropdownOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setSortDropdownOpen(false)}
                        />
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute top-full right-0 mt-2 w-56 rounded-lg shadow-xl z-20 overflow-hidden"
                          style={{
                            backgroundColor: "var(--bg-primary)",
                            border: "1px solid var(--border-primary)",
                          }}
                        >
                          {sortOptions.map((option) => (
                            <motion.button
                              key={option.value}
                              whileHover={{ backgroundColor: "var(--bg-secondary)" }}
                              onClick={() => {
                                setSortOption(option.value);
                                setSortDropdownOpen(false);
                                setCurrentPage(1);
                              }}
                              className="w-full text-left px-4 py-3 text-sm"
                              style={{
                                color:
                                  sortOption === option.value
                                    ? "var(--color-tertiary)"
                                    : "var(--text-secondary)",
                                fontWeight: sortOption === option.value ? 600 : 400,
                              }}
                            >
                              {option.label}
                            </motion.button>
                          ))}
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Active Filters */}
              <AnimatePresence>
                {hasActiveFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex flex-wrap items-center gap-2 mt-4"
                  >
                    {filters.categories?.map((cat) => (
                      <motion.span
                        key={cat}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer"
                        style={{
                          backgroundColor: "var(--color-tertiary)",
                          color: "white",
                        }}
                        onClick={() => handleCategoryToggle(cat)}
                      >
                        {cat}
                        <FiX size={14} />
                      </motion.span>
                    ))}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      onClick={handleClearFilters}
                      className="text-xs font-medium underline"
                      style={{ color: "var(--color-tertiary)" }}
                    >
                      Clear all
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Desktop Sidebar */}
              <motion.aside
                variants={fadeInUp}
                className="hidden lg:block lg:col-span-1"
              >
                <div className="sticky top-32">
                  <SaleFilters
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onClearFilters={handleClearFilters}
                    categories={categories}
                    onCategoryToggle={handleCategoryToggle}
                  />
                </div>
              </motion.aside>

              {/* Products */}
              <div className="lg:col-span-3">
                {paginatedProducts.length > 0 ? (
                  <>
                    {/* Custom Sale Product Grid */}
                    <motion.div
                      variants={staggerContainer}
                      initial="initial"
                      animate="animate"
                      className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
                    >
                      {paginatedProducts.map((product, index) => (
                        <SaleProductCard
                          key={product.id}
                          product={product}
                          index={index}
                          onQuickView={setQuickViewProduct}
                        />
                      ))}
                    </motion.div>

                    {/* Pagination */}
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
                  <EmptySaleResults onClearFilters={handleClearFilters} />
                )}
              </div>
            </div>
          </motion.div>
        </Container>
      </section>

      {/* Promo Banner */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="py-12"
        style={{ backgroundColor: "var(--bg-secondary)" }}
      >
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: FiPercent,
                title: "Extra 10% Off",
                desc: "Use code EXTRA10 at checkout",
                color: "var(--color-primary)",
              },
              {
                icon: FiZap,
                title: "Flash Deals",
                desc: "New deals every hour",
                color: "var(--color-tertiary)",
              },
              {
                icon: FiTag,
                title: "Price Match",
                desc: "We'll match any lower price",
                color: "var(--color-secondary)",
              },
            ].map((promo, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ scale: 1.02, y: -4 }}
                className="p-6 rounded-xl text-center"
                style={{ backgroundColor: "var(--bg-primary)" }}
              >
                <div
                  className="w-14 h-14 mx-auto mb-4 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: promo.color }}
                >
                  <promo.icon size={24} className="text-white" />
                </div>
                <h3
                  className="font-bold text-lg mb-1"
                  style={{ color: "var(--text-primary)" }}
                >
                  {promo.title}
                </h3>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  {promo.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </Container>
      </motion.section>

      {/* Mobile Filters Drawer */}
      <MobileSaleFilters
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

// Sale Product Card with Enhanced Discount Display
const SaleProductCard = ({ product, index, onQuickView }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group relative rounded-xl overflow-hidden"
      style={{ backgroundColor: "var(--bg-secondary)" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Discount Badge - Prominent */}
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: index * 0.05 + 0.2, type: "spring" }}
        className="absolute top-3 left-3 z-20"
      >
        <div
          className="px-3 py-1.5 rounded-lg font-bold text-white text-sm shadow-lg"
          style={{ backgroundColor: "var(--color-tertiary)" }}
        >
          -{product.discount}%
        </div>
      </motion.div>

      {/* Urgency Badges */}
      <div className="absolute top-3 right-3 z-20 flex flex-col gap-2">
        {product.isLimitedTime && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 + 0.3 }}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-yellow-500 text-yellow-900"
          >
            <FiClock size={12} />
            Limited
          </motion.div>
        )}
        {product.isLowStock && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 + 0.35 }}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-orange-500 text-white"
          >
            <FiAlertCircle size={12} />
            Only {product.stockCount} left
          </motion.div>
        )}
      </div>

      {/* Product Image */}
      <Link to={`/product/${product.id}`}>
        <div className="relative aspect-[3/4] overflow-hidden">
          <motion.img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover"
            animate={{ scale: isHovered ? 1.08 : 1 }}
            transition={{ duration: 0.4 }}
          />

          {/* Hover Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end justify-center pb-6"
          >
            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: isHovered ? 0 : 20, opacity: isHovered ? 1 : 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.preventDefault();
                onQuickView(product);
              }}
              className="px-6 py-2.5 rounded-lg font-semibold text-sm text-white backdrop-blur-sm"
              style={{ backgroundColor: "var(--color-tertiary)" }}
            >
              Quick View
            </motion.button>
          </motion.div>
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-4">
        <p
          className="text-xs uppercase tracking-wider mb-1"
          style={{ color: "var(--text-tertiary)" }}
        >
          {product.category}
        </p>
        <Link to={`/product/${product.id}`}>
          <h3
            className="font-semibold text-base mb-3 line-clamp-1 hover:underline"
            style={{ color: "var(--text-primary)" }}
          >
            {product.name}
          </h3>
        </Link>

        {/* Price Display - Emphasized */}
        <div className="flex items-center gap-3">
          <motion.span
            animate={{ scale: isHovered ? 1.1 : 1 }}
            className="text-xl font-bold"
            style={{ color: "var(--color-tertiary)" }}
          >
            ${product.price.toFixed(2)}
          </motion.span>
          <span
            className="text-sm line-through"
            style={{ color: "var(--text-tertiary)" }}
          >
            ${product.originalPrice.toFixed(2)}
          </span>
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded"
            style={{
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              color: "var(--color-tertiary)",
            }}
          >
            Save ${(product.originalPrice - product.price).toFixed(2)}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

// Sale Filters Component
const SaleFilters = ({
  filters,
  onFilterChange,
  onClearFilters,
  categories,
  onCategoryToggle,
}) => {
  const [openSections, setOpenSections] = useState({
    category: true,
    price: true,
    size: false,
  });

  const toggleSection = (section) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const sizes = ["XS", "S", "M", "L", "XL", "XXL"];

  const handleSizeToggle = (size) => {
    const sizes = filters.sizes || [];
    const newSizes = sizes.includes(size)
      ? sizes.filter((s) => s !== size)
      : [...sizes, size];
    onFilterChange({ ...filters, sizes: newSizes });
  };

  const handlePriceChange = (min, max) => {
    onFilterChange({ ...filters, priceRange: { min, max } });
  };

  const hasActiveFilters =
    (filters.sizes && filters.sizes.length > 0) ||
    (filters.categories && filters.categories.length > 0) ||
    (filters.priceRange && (filters.priceRange.min > 0 || filters.priceRange.max < 500));

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="p-6 rounded-xl"
      style={{ backgroundColor: "var(--bg-secondary)" }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
          Refine Results
        </h3>
        {hasActiveFilters && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClearFilters}
            className="text-xs font-medium flex items-center gap-1"
            style={{ color: "var(--color-tertiary)" }}
          >
            <FiX size={14} />
            Clear
          </motion.button>
        )}
      </div>

      {/* Category */}
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
              className="w-full flex items-center justify-between py-2 text-sm"
              style={{
                color: filters.categories?.includes(cat)
                  ? "var(--color-tertiary)"
                  : "var(--text-secondary)",
              }}
            >
              <span className={filters.categories?.includes(cat) ? "font-semibold" : ""}>
                {cat}
              </span>
              {filters.categories?.includes(cat) && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: "var(--color-tertiary)" }}
                />
              )}
            </motion.button>
          ))}
        </div>
      </FilterSection>

      {/* Price */}
      <FilterSection
        title="Price Range"
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
                  filters.priceRange?.max || 500
                )
              }
              className="w-full px-3 py-2 text-sm border rounded-lg outline-none"
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
                  parseFloat(e.target.value) || 500
                )
              }
              className="w-full px-3 py-2 text-sm border rounded-lg outline-none"
              style={{
                borderColor: "var(--border-primary)",
                backgroundColor: "var(--bg-primary)",
                color: "var(--text-primary)",
              }}
            />
          </div>
        </div>
      </FilterSection>

      {/* Size */}
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
                  ? "var(--color-tertiary)"
                  : "var(--bg-primary)",
                color: filters.sizes?.includes(size) ? "white" : "var(--text-secondary)",
              }}
            >
              {size}
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
    <div className="border-t pt-4 mt-4" style={{ borderColor: "var(--border-primary)" }}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between mb-3"
      >
        <h4 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
          {title}
        </h4>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
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

// Mobile Sale Filters Drawer
const MobileSaleFilters = ({
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

  const handleSizeToggle = (size) => {
    const sizes = filters.sizes || [];
    const newSizes = sizes.includes(size)
      ? sizes.filter((s) => s !== size)
      : [...sizes, size];
    onFilterChange({ ...filters, sizes: newSizes });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={onClose}
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full max-w-sm z-50 lg:hidden overflow-y-auto"
            style={{ backgroundColor: "var(--bg-primary)" }}
          >
            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                  Filter Deals
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
                <h3 className="font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
                  Category
                </h3>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <motion.button
                      key={cat}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onCategoryToggle(cat)}
                      className="px-4 py-2 rounded-lg text-sm font-medium"
                      style={{
                        backgroundColor: filters.categories?.includes(cat)
                          ? "var(--color-tertiary)"
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
                <h3 className="font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
                  Size
                </h3>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => (
                    <motion.button
                      key={size}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleSizeToggle(size)}
                      className="w-12 h-12 rounded-lg text-sm font-medium"
                      style={{
                        backgroundColor: filters.sizes?.includes(size)
                          ? "var(--color-tertiary)"
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

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClearFilters}
                  className="flex-1 py-3 rounded-lg font-semibold text-sm"
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
                  className="flex-1 py-3 rounded-lg font-semibold text-sm text-white"
                  style={{ backgroundColor: "var(--color-tertiary)" }}
                >
                  Show {resultsCount} Deals
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Empty Results
const EmptySaleResults = ({ onClearFilters }) => {
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
        <FiPercent size={32} style={{ color: "var(--text-tertiary)" }} />
      </div>
      <h3 className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
        No deals match your filters
      </h3>
      <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
        Try adjusting your filters to find great deals.
      </p>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClearFilters}
        className="px-6 py-3 rounded-lg font-semibold text-sm text-white"
        style={{ backgroundColor: "var(--color-tertiary)" }}
      >
        View All Deals
      </motion.button>
    </motion.div>
  );
};

export default Sale;
