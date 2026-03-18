/**
 * Category page: /category/:categoryName (men, women, ...) with optional /:section?/:subcategory?
 * Gender routes fetch from API (with optional section/subcategory); others use local data.
 * Structure: section → subcategory → products; empty sections/subcategories are not rendered.
 */
import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useParams } from "react-router";
import {
  Container,
  ProductGrid,
  ProductFilters,
  ProductSort,
  Pagination,
  QuickView,
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
import {
  getCategoryBrowseSequence,
  getNextBrowseIndexAfterLeaf,
  getNextBrowseIndexAfterSectionPage,
  getNextBrowseIndexAfterFullGenderPage,
} from "../../utils/categoryBrowseOrder";

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
  const normalizedCategoryName = categoryName?.toLowerCase();
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
  const [filterPanelPosition, setFilterPanelPosition] = useState(null);
  const filterDropdownRef = useRef(null);
  const [apiProducts, setApiProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const itemsPerPage = 12;

  /** Infinite scroll: append next category leaves after user reaches page end */
  const [appendedBrowseBlocks, setAppendedBrowseBlocks] = useState([]);
  const [nextBrowseIndex, setNextBrowseIndex] = useState(0);
  const [loadingMoreBrowse, setLoadingMoreBrowse] = useState(false);
  const [browseExhausted, setBrowseExhausted] = useState(false);
  const browseSentinelRef = useRef(null);
  const loadingBrowseRef = useRef(false);
  const seenBrowseProductIdsRef = useRef(new Set());
  const routeBrowseKeyRef = useRef("");

  useEffect(() => {
    if (!filterDropdownOpen) {
      setFilterPanelPosition(null);
      return;
    }
    const updatePosition = () => {
      if (!filterDropdownRef.current) return;
      const rect = filterDropdownRef.current.getBoundingClientRect();
      const padding = 16;
      let left = rect.left;
      const panelMinWidth = 280;
      if (left + panelMinWidth > window.innerWidth - padding) left = window.innerWidth - panelMinWidth - padding;
      if (left < padding) left = padding;
      setFilterPanelPosition({ top: rect.bottom + 8, left });
    };
    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [filterDropdownOpen]);

  const category = findCategoryBySlug(categoryName, categoriesData);
  const useBackendForGender = isGenderCategory(normalizedCategoryName);
  const isDirectSubcategory = useBackendForGender && sectionSlug && subcategorySlug;

  const browseSequence = useMemo(() => {
    if (!useBackendForGender) return [];
    return getCategoryBrowseSequence(normalizedCategoryName === "women" ? "women" : "men");
  }, [useBackendForGender, normalizedCategoryName]);

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

  const nextBrowseStart = useMemo(() => {
    if (!useBackendForGender || !hasProducts || browseSequence.length === 0) return null;
    const g = normalizedCategoryName === "women" ? "women" : "men";
    if (isDirectSubcategory) {
      return getNextBrowseIndexAfterLeaf(browseSequence, g, sectionSlug, subcategorySlug);
    }
    if (sectionSlug && !subcategorySlug && sectionWithSubcategories?.subcategories?.length) {
      return getNextBrowseIndexAfterSectionPage(
        browseSequence,
        g,
        sectionSlug,
        sectionWithSubcategories.subcategories.map((x) => x.subcategoryName)
      );
    }
    if (!sectionSlug && sectionsWithSubcategories.length > 0) {
      return getNextBrowseIndexAfterFullGenderPage(browseSequence, g, sectionsWithSubcategories);
    }
    return null;
  }, [
    useBackendForGender,
    hasProducts,
    browseSequence,
    normalizedCategoryName,
    isDirectSubcategory,
    sectionSlug,
    subcategorySlug,
    sectionWithSubcategories,
    sectionsWithSubcategories,
  ]);

  const showBrowseContinuation =
    useBackendForGender && hasProducts && nextBrowseStart != null && nextBrowseStart < browseSequence.length;

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

  const nextBrowseIndexRef = useRef(0);
  const browseExhaustedRef = useRef(false);
  useEffect(() => {
    nextBrowseIndexRef.current = nextBrowseIndex;
  }, [nextBrowseIndex]);
  useEffect(() => {
    browseExhaustedRef.current = browseExhausted;
  }, [browseExhausted]);

  useEffect(() => {
    const key = `${categoryName}|${sectionSlug || ""}|${subcategorySlug || ""}`;
    if (routeBrowseKeyRef.current !== key) {
      routeBrowseKeyRef.current = key;
      setAppendedBrowseBlocks([]);
      setBrowseExhausted(false);
    }
  }, [categoryName, sectionSlug, subcategorySlug]);

  useEffect(() => {
    setAppendedBrowseBlocks([]);
    setBrowseExhausted(false);
  }, [filters, sortOption]);

  useEffect(() => {
    if (nextBrowseStart == null) return;
    setNextBrowseIndex(nextBrowseStart);
  }, [nextBrowseStart, categoryName, sectionSlug, subcategorySlug, filters, sortOption]);

  useEffect(() => {
    const s = new Set();
    const add = (arr) => {
      for (const p of arr || []) {
        const id = p?.id ?? p?._id;
        if (id != null) s.add(String(id));
      }
    };
    add(sortedProducts);
    if (sectionWithSubcategories?.subcategories) {
      for (const { products } of sectionWithSubcategories.subcategories) add(products);
    }
    for (const { subcategories } of sectionsWithSubcategories) {
      for (const { products } of subcategories) add(products);
    }
    seenBrowseProductIdsRef.current = s;
  }, [sortedProducts, sectionWithSubcategories, sectionsWithSubcategories, filters, sortOption]);

  const loadNextBrowse = useCallback(async () => {
    if (!useBackendForGender || loadingBrowseRef.current || browseExhaustedRef.current) return;
    if (nextBrowseIndexRef.current >= browseSequence.length) {
      setBrowseExhausted(true);
      return;
    }
    loadingBrowseRef.current = true;
    setLoadingMoreBrowse(true);
    let idx = nextBrowseIndexRef.current;
    const newBlocks = [];
    try {
      while (idx < browseSequence.length && newBlocks.length === 0) {
        const entry = browseSequence[idx];
        const res = await getProductsByGender(entry.gender, {
          section: entry.sectionSlug,
          subcategory: entry.subcategorySlug,
        });
        let batch = (res.products || []).map(mapApiProduct);
        batch = filterProducts(batch, filters);
        batch = sortProducts(batch, sortOption);
        const deduped = batch.filter((p) => {
          const id = String(p.id ?? p._id);
          if (seenBrowseProductIdsRef.current.has(id)) return false;
          seenBrowseProductIdsRef.current.add(id);
          return true;
        });
        if (deduped.length > 0) {
          newBlocks.push({
            key: `more-${entry.gender}-${entry.sectionSlug}-${entry.subcategorySlug}-${idx}`,
            gender: entry.gender,
            sectionName: entry.sectionName,
            subName: entry.subName,
            products: deduped,
          });
        }
        idx += 1;
      }
      setNextBrowseIndex(idx);
      if (newBlocks.length) {
        setAppendedBrowseBlocks((prev) => [...prev, ...newBlocks]);
      }
      if (idx >= browseSequence.length) {
        setBrowseExhausted(true);
      }
    } finally {
      loadingBrowseRef.current = false;
      setLoadingMoreBrowse(false);
    }
  }, [useBackendForGender, browseSequence, filters, sortOption]);

  useEffect(() => {
    const canBrowse =
      useBackendForGender &&
      hasProducts &&
      nextBrowseStart != null &&
      nextBrowseStart < browseSequence.length;
    if (!canBrowse && appendedBrowseBlocks.length === 0) return;
    const el = browseSentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        if (browseExhaustedRef.current) return;
        if (nextBrowseIndexRef.current >= browseSequence.length) {
          setBrowseExhausted(true);
          return;
        }
        loadNextBrowse();
      },
      { root: null, rootMargin: "280px", threshold: 0 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [
    useBackendForGender,
    hasProducts,
    nextBrowseStart,
    browseSequence.length,
    loadNextBrowse,
    appendedBrowseBlocks.length,
    categoryName,
    sectionSlug,
    subcategorySlug,
  ]);

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
    <div className="min-h-screen py-16 overflow-x-hidden">
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
                  <div className="sm:ml-auto flex items-center gap-2 sm:gap-3 flex-wrap">
                    {/* Filter dropdown — mobile + desktop */}
                    {showFilter && (
                      <div
                        className={`relative ${filterDropdownOpen ? "z-[111]" : ""}`}
                        ref={filterDropdownRef}
                      >
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
                <div className="w-screen max-w-[100vw] relative left-1/2 -translate-x-1/2 overflow-x-clip">
                  <div
                    className="grid grid-cols-2 gap-0 border-b"
                    style={{ borderColor: "var(--border-primary)" }}
                  >
                    <div
                      className="border-r min-h-0"
                      style={{ borderColor: "var(--border-primary)" }}
                    >
                      <div
                        className="aspect-[4/5] sm:aspect-[3/4] animate-pulse"
                        style={{ backgroundColor: "var(--bg-tertiary)" }}
                      />
                      <div className="px-3 py-4 space-y-2">
                        <div className="h-3 rounded w-3/4 mx-auto" style={{ backgroundColor: "var(--bg-tertiary)" }} />
                        <div className="h-4 rounded w-1/2 mx-auto" style={{ backgroundColor: "var(--bg-tertiary)" }} />
                      </div>
                    </div>
                    <div>
                      <div
                        className="aspect-[4/5] sm:aspect-[3/4] animate-pulse"
                        style={{ backgroundColor: "var(--bg-tertiary)" }}
                      />
                      <div className="px-3 py-4 space-y-2">
                        <div className="h-3 rounded w-3/4 mx-auto" style={{ backgroundColor: "var(--bg-tertiary)" }} />
                        <div className="h-4 rounded w-1/2 mx-auto" style={{ backgroundColor: "var(--bg-tertiary)" }} />
                      </div>
                    </div>
                  </div>
                  <div className="border-b" style={{ borderColor: "var(--border-primary)" }}>
                    <div
                      className="min-h-[min(70vh,640px)] sm:min-h-[min(75vh,720px)] animate-pulse"
                      style={{ backgroundColor: "var(--bg-tertiary)" }}
                    />
                    <div className="px-6 py-6 space-y-3 max-w-2xl mx-auto text-center">
                      <div className="h-4 rounded w-2/3 mx-auto" style={{ backgroundColor: "var(--bg-tertiary)" }} />
                      <div className="h-5 rounded w-1/3 mx-auto" style={{ backgroundColor: "var(--bg-tertiary)" }} />
                    </div>
                  </div>
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
                    <ProductGrid
                      products={sortedProducts}
                      viewMode={viewMode}
                      onViewModeChange={setViewMode}
                      onQuickView={setQuickViewProduct}
                      hideViewToggle
                      brickLayout
                    />
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
                            <ProductGrid
                              products={products}
                              viewMode={viewMode}
                              onViewModeChange={setViewMode}
                              onQuickView={setQuickViewProduct}
                              hideViewToggle
                              brickLayout
                            />
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
                              <ProductGrid
                                products={products}
                                viewMode={viewMode}
                                onViewModeChange={setViewMode}
                                onQuickView={setQuickViewProduct}
                                hideViewToggle
                                brickLayout
                              />
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
                        brickLayout
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

                  {useBackendForGender &&
                    hasProducts &&
                    (showBrowseContinuation || appendedBrowseBlocks.length > 0) && (
                      <div
                        className="mt-20 sm:mt-28 md:mt-36 pt-14 sm:pt-20 md:pt-24 pb-4"
                        style={{ borderTop: "2px solid var(--border-primary)" }}
                      >
                        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 md:mb-20 px-4">
                          <h2
                            className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight"
                            style={{ color: "var(--color-primary)" }}
                          >
                            Shop more products
                          </h2>
                          <p
                            className="text-sm sm:text-base mt-3 sm:mt-4 leading-relaxed"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            Explore the rest of our categories—more styles and pieces below, curated from across the store.
                          </p>
                        </div>
                        {appendedBrowseBlocks.map((block) => (
                          <div key={block.key} className="mt-14 sm:mt-20 md:mt-24 first:mt-0 space-y-4">
                            {block.gender !== normalizedCategoryName && (
                              <p
                                className="text-center text-xs font-bold uppercase tracking-[0.2em] mb-1"
                                style={{ color: "var(--color-primary)" }}
                              >
                                {block.gender === "men" ? "Men" : "Women"}
                              </p>
                            )}
                            <div
                              className="w-screen max-w-[100vw] relative left-1/2 -translate-x-1/2 overflow-x-clip px-4 sm:px-6"
                            >
                              <div
                                className="pb-3 border-b max-w-7xl mx-auto"
                                style={{ borderColor: "var(--border-primary)" }}
                              >
                                <h2
                                  className="text-lg sm:text-xl font-bold"
                                  style={{ color: "var(--text-primary)" }}
                                >
                                  {block.sectionName}
                                  <span className="font-normal" style={{ color: "var(--text-tertiary)" }}>
                                    {" "}
                                    ·{" "}
                                  </span>
                                  {block.subName}
                                </h2>
                              </div>
                            </div>
                            <ProductGrid
                              products={block.products}
                              viewMode={viewMode}
                              onViewModeChange={setViewMode}
                              onQuickView={setQuickViewProduct}
                              hideViewToggle
                              brickLayout
                            />
                          </div>
                        ))}
                        <div
                          ref={browseSentinelRef}
                          className="min-h-[100px] flex flex-col items-center justify-center py-10 gap-2"
                          aria-hidden={!loadingMoreBrowse && !browseExhausted}
                        >
                          {loadingMoreBrowse && (
                            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                              Loading more…
                            </p>
                          )}
                          {browseExhausted && appendedBrowseBlocks.length > 0 && (
                            <p
                              className="text-sm text-center max-w-md px-4"
                              style={{ color: "var(--text-tertiary)" }}
                            >
                              You&apos;ve reached the end of our catalogue.
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                </>
              )}
            </div>
          </div>
        </motion.div>
      </Container>

      {/* Filter overlay: portal so it overlaps the whole page (desktop + mobile) */}
      {filterDropdownOpen &&
        filterPanelPosition &&
        createPortal(
          <>
            <div
              className="fixed inset-0 z-[100] bg-black/20"
              onClick={() => setFilterDropdownOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed z-[110] p-4 rounded-xl shadow-xl border min-w-[280px] max-w-[calc(100vw-2rem)] max-h-[min(85vh,600px)] overflow-y-auto"
              style={{
                top: filterPanelPosition.top,
                left: filterPanelPosition.left,
                backgroundColor: "var(--bg-primary)",
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
          </>,
          document.body
        )}

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
