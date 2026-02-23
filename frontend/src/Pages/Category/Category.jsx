/**
 * Category page: /category/:categoryName (men, women, ...) with optional /:section?/:subcategory?
 * Gender routes fetch from API (with optional section/subcategory); others use local data.
 * Structure: section → subcategory → products; empty sections/subcategories are not rendered.
 */
import { useState, useMemo, useEffect, useRef } from "react";
import { useParams } from "react-router";
import {
  Container,
  ProductGrid,
  ProductFilters,
  ProductSort,
  Pagination,
  QuickView,
  ProductCardSkeleton,
} from "../../components";
import { FiGrid, FiList, FiFilter, FiChevronDown } from "react-icons/fi";
import { productsData } from "../../data/products";
import { categoriesData } from "../../data/categories";
import { motion, AnimatePresence } from "framer-motion";
import { fadeInUp, staggerContainer } from "../../utils/animations";
import {
  filterProducts,
  sortProducts,
  paginateProducts,
  getLevel2Category,
  getLevel3Category,
  mapApiProduct,
  toCategorySlug,
} from "../../utils/productUtils";
import { getProductsByGender } from "../../services/productApi";

const isGenderCategory = (name) => name === "men" || name === "women";

/** Slug to display name: "winter-wear" -> "Winter Wear". */
function slugToDisplayName(slug) {
  if (!slug) return "";
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

/** Find category from route param using categoriesData. */
function findCategoryBySlug(categoryName, categoriesData) {
  const normalized = categoryName?.toLowerCase();
  if (!normalized) return null;
  return categoriesData.find((cat) => {
    const catNorm = cat.name.toLowerCase().replace(/\s+/g, "-").replace("'s", "").replace("'", "");
    return catNorm === normalized || cat.name.toLowerCase().includes(normalized);
  }) ?? null;
}

const Category = () => {
  const { categoryName, section: sectionSlug, subcategory: subcategorySlug } = useParams();
  const [filters, setFilters] = useState({
    priceRange: { min: "", max: "" },
    sizes: [],
    colors: [],
  });
  const [sortOption, setSortOption] = useState("default");
  const [viewMode, setViewMode] = useState("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const filterDropdownRef = useRef(null);
  const [apiProducts, setApiProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const itemsPerPage = 12;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(e.target)) {
        setFilterDropdownOpen(false);
      }
    };
    if (filterDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [filterDropdownOpen]);

  const normalizedCategoryName = categoryName?.toLowerCase();
  const category = findCategoryBySlug(categoryName, categoriesData);
  const useBackendForGender = isGenderCategory(normalizedCategoryName);
  const isDirectSubcategory = useBackendForGender && sectionSlug && subcategorySlug;

  useEffect(() => {
    if (!useBackendForGender || !normalizedCategoryName) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    const options = {};
    if (sectionSlug) options.section = sectionSlug;
    if (subcategorySlug) options.subcategory = subcategorySlug;
    getProductsByGender(normalizedCategoryName, options)
      .then((res) => {
        if (cancelled) return;
        setLoading(false);
        if (res.success)
          setApiProducts((res.products || []).map(mapApiProduct));
        else setError(res.message || "Failed to load products");
      })
      .catch((err) => {
        if (cancelled) return;
        setLoading(false);
        setError(err?.message || "Failed to load products");
      });
    return () => {
      cancelled = true;
    };
  }, [normalizedCategoryName, useBackendForGender, sectionSlug, subcategorySlug]);

  const categoryProducts = useMemo(() => {
    if (useBackendForGender) return apiProducts;
    return productsData.filter((product) => {
      const productCategory = (product.category || "").toLowerCase();
      return (
        productCategory === normalizedCategoryName ||
        productCategory.includes(normalizedCategoryName) ||
        (normalizedCategoryName === "accessories" && productCategory === "accessories") ||
        (normalizedCategoryName === "footwear" && productCategory === "footwear")
      );
    });
  }, [useBackendForGender, apiProducts, normalizedCategoryName]);

  const filteredProducts = useMemo(() => filterProducts(categoryProducts, filters), [categoryProducts, filters]);
  const sortedProducts = useMemo(() => sortProducts(filteredProducts, sortOption), [filteredProducts, sortOption]);
  const { paginatedProducts, totalPages } = useMemo(
    () => paginateProducts(sortedProducts, currentPage, itemsPerPage),
    [sortedProducts, currentPage, itemsPerPage]
  );

  /** Sections with subcategories that have products only. For gender full view (no section/sub in URL). */
  const sectionsWithSubcategories = useMemo(() => {
    if (!useBackendForGender || sortedProducts.length === 0) return [];
    const sectionMap = new Map(); // sectionName -> Map(subcategoryName -> products[])
    const sectionOrder = [];
    for (const product of sortedProducts) {
      const sec = getLevel2Category(product);
      const sub = getLevel3Category(product);
      if (!sectionMap.has(sec)) {
        sectionOrder.push(sec);
        sectionMap.set(sec, new Map());
      }
      const subMap = sectionMap.get(sec);
      if (!subMap.has(sub)) subMap.set(sub, []);
      subMap.get(sub).push(product);
    }
    return sectionOrder.map((sectionName) => ({
      sectionName,
      subcategories: Array.from(sectionMap.get(sectionName).entries()).map(([subName, products]) => ({
        subcategoryName: subName,
        products,
      })),
    }));
  }, [useBackendForGender, sortedProducts]);

  /** Single section with subcategories (when URL has section only). */
  const sectionWithSubcategories = useMemo(() => {
    if (!useBackendForGender || !sectionSlug || subcategorySlug || sortedProducts.length === 0) return null;
    const sectionName = slugToDisplayName(sectionSlug);
    const subcategories = [];
    const subMap = new Map();
    for (const product of sortedProducts) {
      if (toCategorySlug(getLevel2Category(product)) !== sectionSlug) continue;
      const sub = getLevel3Category(product);
      if (!subMap.has(sub)) {
        subMap.set(sub, []);
        subcategories.push(sub);
      }
      subMap.get(sub).push(product);
    }
    if (subcategories.length === 0) return null;
    return {
      sectionName,
      subcategories: subcategories.map((subName) => ({
        subcategoryName: subName,
        products: subMap.get(subName),
      })),
    };
  }, [useBackendForGender, sectionSlug, subcategorySlug, sortedProducts]);

  const hasProducts = categoryProducts.length > 0;
  /** Flag: show filter sidebar only when products are present. */
  const showFilter = hasProducts;
  /** Flag: no products → show hierarchy + "Stay tuned, coming soon." (never show blank). */
  const showNoProductsMessage =
    useBackendForGender && !loading && !error && !hasProducts;

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters({ priceRange: { min: "", max: "" }, sizes: [], colors: [] });
    setCurrentPage(1);
  };

  const handleSortChange = (newSort) => {
    setSortOption(newSort);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!category) {
    return (
      <div className="min-h-[60vh] py-16">
        <Container>
          <h1 className="text-4xl font-bold" style={{ color: "var(--color-primary)" }}>
            Category not found
          </h1>
        </Container>
      </div>
    );
  }

  /* Flag: no products → show hierarchy + "Stay tuned, coming soon." (no animations so content is never hidden). */
  if (showNoProductsMessage) {
    return (
      <div className="min-h-screen py-16">
        <Container>
          <div className="max-w-2xl mx-auto text-center space-y-3">
            <h1 className="text-3xl md:text-4xl font-bold" style={{ color: "var(--color-primary)" }}>
              {category.name}
            </h1>
            {sectionSlug && (
              <p className="text-xl md:text-2xl font-semibold" style={{ color: "var(--text-secondary)" }}>
                {slugToDisplayName(sectionSlug)}
              </p>
            )}
            {subcategorySlug && (
              <p className="text-base md:text-lg font-medium" style={{ color: "var(--text-primary)" }}>
                {slugToDisplayName(subcategorySlug)}
              </p>
            )}
            <p className="text-2xl md:text-4xl font-semibold pt-8" style={{ color: "var(--text-primary)" }}>
              Stay tuned, coming soon.
            </p>
          </div>
        </Container>
      </div>
    );
  }

  /* Hierarchy line for header */
  const sectionDisplay = sectionSlug ? slugToDisplayName(sectionSlug) : null;
  const subcategoryDisplay = subcategorySlug ? slugToDisplayName(subcategorySlug) : null;

  return (
    <div className="min-h-screen py-16">
      <Container>
        <motion.div initial="initial" animate="animate" variants={staggerContainer} className="space-y-8">
          {/* Header: category (boldest/biggest) → sub category → sub sub category (smallest/lightest) */}
          <motion.div variants={fadeInUp} className="text-center space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold" style={{ color: "var(--color-primary)" }}>
              {category.name}
            </h1>
            {sectionDisplay && (
              <p className="text-xl md:text-2xl font-semibold" style={{ color: "var(--text-secondary)" }}>
                {sectionDisplay}
              </p>
            )}
            {subcategoryDisplay && (
              <p className="text-base md:text-lg font-medium" style={{ color: "var(--text-primary)" }}>
                {subcategoryDisplay}
              </p>
            )}
          </motion.div>

          {/* Main: filter is always in toolbar as dropdown (mobile + desktop) */}
          <div className="grid grid-cols-1 gap-8">
            <div className="space-y-6">
              {/* Sort and count: only when products */}
              {hasProducts && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  {!useBackendForGender && (
                    <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                      Showing {paginatedProducts.length} of {sortedProducts.length} products
                    </p>
                  )}
                  {useBackendForGender && !sectionSlug && sectionsWithSubcategories.length === 0 && (
                    <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                      {sortedProducts.length} products
                    </p>
                  )}
                  <div className="sm:ml-auto flex items-center gap-3 flex-wrap">
                    {/* Filter dropdown — mobile + desktop */}
                    {showFilter && (
                      <div className="relative" ref={filterDropdownRef}>
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setFilterDropdownOpen((o) => !o)}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors"
                          style={{
                            backgroundColor: filterDropdownOpen ? "var(--color-primary)" : "var(--bg-secondary)",
                            color: filterDropdownOpen ? "white" : "var(--text-primary)",
                            borderColor: "var(--border-primary)",
                          }}
                          aria-expanded={filterDropdownOpen}
                          aria-haspopup="true"
                          aria-label="Open filters"
                        >
                          <FiFilter size={18} />
                          <span className="font-medium">Filter</span>
                          <FiChevronDown
                            size={16}
                            style={{ transform: filterDropdownOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}
                          />
                        </motion.button>
                        <AnimatePresence>
                          {filterDropdownOpen && (
                            <motion.div
                              initial={{ opacity: 0, y: -8 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -8 }}
                              transition={{ duration: 0.15 }}
                              className="absolute left-0 top-full mt-2 z-30 p-4 rounded-xl shadow-lg border"
                              style={{
                                backgroundColor: "var(--bg-secondary)",
                                borderColor: "var(--border-primary)",
                              }}
                            >
                              <ProductFilters
                                variant="dropdown"
                                filters={filters}
                                onFilterChange={handleFilterChange}
                                onClearFilters={handleClearFilters}
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                    <div className="flex items-center gap-1" role="group" aria-label="View mode">
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setViewMode("grid")}
                        className="p-2 rounded-lg transition-colors"
                        style={{
                          backgroundColor: viewMode === "grid" ? "var(--color-primary)" : "var(--bg-secondary)",
                          color: viewMode === "grid" ? "white" : "var(--text-secondary)",
                        }}
                        aria-label="Grid view"
                        aria-pressed={viewMode === "grid"}
                      >
                        <FiGrid size={20} />
                      </motion.button>
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setViewMode("list")}
                        className="p-2 rounded-lg transition-colors"
                        style={{
                          backgroundColor: viewMode === "list" ? "var(--color-primary)" : "var(--bg-secondary)",
                          color: viewMode === "list" ? "white" : "var(--text-secondary)",
                        }}
                        aria-label="List view"
                        aria-pressed={viewMode === "list"}
                      >
                        <FiList size={20} />
                      </motion.button>
                    </div>
                    <ProductSort currentSort={sortOption} onSortChange={handleSortChange} />
                  </div>
                </div>
              )}

              {useBackendForGender && loading && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <ProductCardSkeleton key={i} />
                  ))}
                </div>
              )}

              {useBackendForGender && !loading && error && (
                <motion.div
                  variants={fadeInUp}
                  className="py-12 text-center rounded-xl border"
                  style={{
                    backgroundColor: "var(--bg-secondary)",
                    borderColor: "var(--border-primary)",
                    color: "var(--text-secondary)",
                  }}
                >
                  <p className="font-medium">{error}</p>
                  <p className="text-sm mt-2" style={{ color: "var(--text-tertiary)" }}>
                    Please try again later.
                  </p>
                </motion.div>
              )}

              {/* Fallback: gender + no products (same as early return so we never show blank) */}
              {useBackendForGender && !loading && !error && !hasProducts && (
                <div className="max-w-2xl mx-auto text-center space-y-3 pt-8">
                  <h2 className="text-2xl md:text-3xl font-bold" style={{ color: "var(--color-primary)" }}>
                    {category.name}
                  </h2>
                  {sectionSlug && (
                    <p className="text-xl md:text-2xl font-semibold" style={{ color: "var(--text-secondary)" }}>
                      {slugToDisplayName(sectionSlug)}
                    </p>
                  )}
                  {subcategorySlug && (
                    <p className="text-base md:text-lg font-medium" style={{ color: "var(--text-primary)" }}>
                      {slugToDisplayName(subcategorySlug)}
                    </p>
                  )}
                  <p className="text-2xl md:text-4xl font-semibold pt-8" style={{ color: "var(--text-primary)" }}>
                    Stay tuned, coming soon.
                  </p>
                </div>
              )}

              {(!useBackendForGender || (!loading && !error)) && hasProducts && (
                <>
                  {/* Direct subcategory view: single product grid with sort/filter already above */}
                  {isDirectSubcategory && (
                    <>
                      <ProductGrid
                        products={sortedProducts}
                        viewMode={viewMode}
                        onViewModeChange={setViewMode}
                        onQuickView={setQuickViewProduct}
                        hideViewToggle
                      />
                      {totalPages > 1 && (
                        <Pagination
                          currentPage={currentPage}
                          totalPages={totalPages}
                          onPageChange={handlePageChange}
                        />
                      )}
                    </>
                  )}

                  {/* Section-only view: one section with its subcategory blocks */}
                  {useBackendForGender && sectionSlug && !subcategorySlug && sectionWithSubcategories && (
                    <div className="space-y-8">
                      <section className="space-y-6">
                        <div className="pb-3 border-b" style={{ borderColor: "var(--border-primary)" }}>
                          <h2 className="text-xl font-bold tracking-tight uppercase" style={{ color: "var(--text-primary)", letterSpacing: "0.08em" }}>
                            {sectionWithSubcategories.sectionName}
                          </h2>
                        </div>
                        {sectionWithSubcategories.subcategories.map(({ subcategoryName, products }) => (
                          <div key={subcategoryName} className="space-y-4">
                            <div className="pb-3 border-b" style={{ borderColor: "var(--border-primary)" }}>
                              <h3 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                                {subcategoryName}
                              </h3>
                            </div>
                            <ProductGrid products={products} onQuickView={setQuickViewProduct} hideViewToggle />
                          </div>
                        ))}
                      </section>
                    </div>
                  )}

                  {/* Full gender view: sections → subcategories → products */}
                  {useBackendForGender && !sectionSlug && sectionsWithSubcategories.length > 0 && (
                    <div className="space-y-8">
                      {sectionsWithSubcategories.map(({ sectionName, subcategories }) => (
                        <section key={sectionName} className="space-y-6">
                          <div className="pb-3 border-b" style={{ borderColor: "var(--border-primary)" }}>
                            <h2 className="text-xl font-bold tracking-tight uppercase" style={{ color: "var(--text-primary)", letterSpacing: "0.08em" }}>
                              {sectionName}
                            </h2>
                          </div>
                          {subcategories.map(({ subcategoryName, products }) => (
                            <div key={subcategoryName} className="space-y-4">
                              <div className="pb-3 border-b" style={{ borderColor: "var(--border-primary)" }}>
                                <h3 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                                  {subcategoryName}
                                </h3>
                              </div>
                              <ProductGrid products={products} onQuickView={setQuickViewProduct} hideViewToggle />
                            </div>
                          ))}
                        </section>
                      ))}
                    </div>
                  )}

                  {/* Non-gender or flat list */}
                  {(!useBackendForGender || (useBackendForGender && !sectionSlug && sectionsWithSubcategories.length === 0)) && !isDirectSubcategory && (
                    <>
                      <ProductGrid
                        products={paginatedProducts}
                        viewMode={viewMode}
                        onViewModeChange={setViewMode}
                        onQuickView={setQuickViewProduct}
                        hideViewToggle
                      />
                      {totalPages > 1 && (
                        <Pagination
                          currentPage={currentPage}
                          totalPages={totalPages}
                          onPageChange={handlePageChange}
                        />
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </motion.div>
      </Container>

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

export default Category;
