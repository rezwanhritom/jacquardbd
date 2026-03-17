import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router";
import { Container, ProductGrid, ProductFilters, ProductSort, Pagination, QuickView } from "../../components";
import { searchProducts } from "../../services/productApi";
import { mapApiProduct, filterProducts, sortProducts, paginateProducts } from "../../utils/productUtils";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "../../utils/animations";
import { FiSearch } from "react-icons/fi";

const Search = () => {
  const [searchParams] = useSearchParams();
  const q = searchParams.get("q") || "";
  const [loading, setLoading] = useState(!!q);
  const [products, setProducts] = useState([]);
  const [matchType, setMatchType] = useState("none");
  const [suggestedQuery, setSuggestedQuery] = useState(null);
  const [categoryExists, setCategoryExists] = useState(false);
  const [filters, setFilters] = useState({
    priceRange: { min: 0, max: 10000 },
    sizes: [],
    colors: [],
  });
  const [sortOption, setSortOption] = useState("default");
  const [currentPage, setCurrentPage] = useState(1);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const itemsPerPage = 12;

  useEffect(() => {
    if (!q.trim()) {
      setProducts([]);
      setMatchType("none");
      setSuggestedQuery(null);
      setCategoryExists(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    searchProducts(q)
      .then((res) => {
        if (res.success) {
          setProducts(res.products || []);
          setMatchType(res.matchType || "none");
          setSuggestedQuery(res.suggestedQuery || null);
          setCategoryExists(res.categoryExists === true);
        } else {
          setProducts([]);
          setMatchType("none");
          setSuggestedQuery(null);
          setCategoryExists(false);
        }
      })
      .catch(() => {
        setProducts([]);
        setMatchType("none");
        setSuggestedQuery(null);
        setCategoryExists(false);
      })
      .finally(() => setLoading(false));
  }, [q]);

  const mappedProducts = products.map(mapApiProduct);
  const filteredProducts = filterProducts(mappedProducts, filters);
  const sortedProducts = sortProducts(filteredProducts, sortOption);
  const { paginatedProducts, totalPages } = paginateProducts(sortedProducts, currentPage, itemsPerPage);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters({
      priceRange: { min: 0, max: 10000 },
      sizes: [],
      colors: [],
    });
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

  const hasQuery = q.trim().length > 0;
  const hasResults = sortedProducts.length > 0;
  const noResults = hasQuery && !loading && !hasResults;

  const noCategoryMessage = noResults && !categoryExists;
  const categoryNoProductsMessage = noResults && categoryExists;

  return (
    <div className="min-h-screen py-8 md:py-16">
      <Container>
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerContainer}
          className="space-y-4 md:space-y-8"
        >
          <motion.div variants={fadeInUp} className="space-y-1 md:space-y-4">
            <h1 className="text-3xl md:text-5xl font-bold" style={{ color: "var(--color-primary)" }}>
              Search
            </h1>
            <p className="text-base md:text-lg" style={{ color: "var(--text-secondary)" }}>
              {hasQuery ? `Results for "${q}"` : "Search for products, categories, or brands"}
            </p>
          </motion.div>

          {!hasQuery && (
            <motion.div variants={fadeInUp} className="flex flex-col items-center justify-center min-h-[40vh] text-center">
              <p style={{ color: "var(--text-secondary)" }}>
                Enter a search term in the header to find products
              </p>
            </motion.div>
          )}

          {loading && (
            <motion.div variants={fadeInUp} className="flex justify-center py-8 md:py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-t-transparent" style={{ borderColor: "var(--color-primary)" }} />
            </motion.div>
          )}

          {noResults && (
            <div
              className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4"
              role="region"
              aria-live="polite"
            >
              {noCategoryMessage && (
                <>
                  <div className="text-center py-16 space-y-6">
                    <div className="flex justify-center">
                      <div className="p-6 rounded-full" style={{ backgroundColor: "var(--bg-secondary)" }}>
                        <FiSearch size={64} style={{ color: "var(--text-tertiary)" }} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                        No results found for the search &quot;{q}&quot;
                      </h3>
                      <p className="text-sm max-w-md mx-auto" style={{ color: "var(--text-secondary)" }}>
                        No such category or product name matches your search.
                      </p>
                    </div>
                    <div>
                      <Link
                        to="/"
                        className="inline-block px-8 py-4 text-white font-semibold uppercase tracking-wider rounded-lg transition-colors"
                        style={{ backgroundColor: "var(--color-primary)" }}
                      >
                        Browse Home
                      </Link>
                    </div>
                  </div>
                  {suggestedQuery && (
                    <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                      <span style={{ color: "var(--text-secondary)" }}>Did you mean</span>
                      <Link
                        to={`/search?q=${encodeURIComponent(suggestedQuery)}`}
                        className="px-4 py-2 rounded-lg font-semibold underline"
                        style={{ color: "var(--color-primary)", backgroundColor: "var(--bg-secondary)" }}
                      >
                        {suggestedQuery}
                      </Link>
                      <span style={{ color: "var(--text-secondary)" }}>?</span>
                    </div>
                  )}
                </>
              )}
              {categoryNoProductsMessage && (
                <>
                  <div className="text-center py-16 space-y-6">
                    <div className="flex justify-center">
                      <div className="p-6 rounded-full" style={{ backgroundColor: "var(--bg-secondary)" }}>
                        <FiSearch size={64} style={{ color: "var(--text-tertiary)" }} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                        Stay tuned for further product updates
                      </h3>
                      <p className="text-sm max-w-md mx-auto" style={{ color: "var(--text-secondary)" }}>
                        No results found for the search &quot;{q}&quot;. This category exists but has no products listed yet.
                      </p>
                    </div>
                    <div>
                      <Link
                        to="/"
                        className="inline-block px-8 py-4 text-white font-semibold uppercase tracking-wider rounded-lg transition-colors"
                        style={{ backgroundColor: "var(--color-primary)" }}
                      >
                        Browse Home
                      </Link>
                    </div>
                  </div>
                  {suggestedQuery && (
                    <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                      <span style={{ color: "var(--text-secondary)" }}>Did you mean</span>
                      <Link
                        to={`/search?q=${encodeURIComponent(suggestedQuery)}`}
                        className="px-4 py-2 rounded-lg font-semibold underline"
                        style={{ color: "var(--color-primary)", backgroundColor: "var(--bg-secondary)" }}
                      >
                        {suggestedQuery}
                      </Link>
                      <span style={{ color: "var(--text-secondary)" }}>?</span>
                    </div>
                  )}
                </>
              )}
              {!noCategoryMessage && !categoryNoProductsMessage && (
                <>
                  <div className="text-center py-16 space-y-6">
                    <div className="flex justify-center">
                      <div className="p-6 rounded-full" style={{ backgroundColor: "var(--bg-secondary)" }}>
                        <FiSearch size={64} style={{ color: "var(--text-tertiary)" }} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                        No results found for the search &quot;{q}&quot;
                      </h3>
                      <p className="text-sm max-w-md mx-auto" style={{ color: "var(--text-secondary)" }}>
                        {suggestedQuery ? "Try the suggestion below." : "Try a different search term or browse categories."}
                      </p>
                    </div>
                    <div>
                      <Link
                        to="/"
                        className="inline-block px-8 py-4 text-white font-semibold uppercase tracking-wider rounded-lg transition-colors"
                        style={{ backgroundColor: "var(--color-primary)" }}
                      >
                        Browse Home
                      </Link>
                    </div>
                  </div>
                  {suggestedQuery && (
                    <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                      <span style={{ color: "var(--text-secondary)" }}>Did you mean</span>
                      <Link
                        to={`/search?q=${encodeURIComponent(suggestedQuery)}`}
                        className="px-4 py-2 rounded-lg font-semibold underline"
                        style={{ color: "var(--color-primary)", backgroundColor: "var(--bg-secondary)" }}
                      >
                        {suggestedQuery}
                      </Link>
                      <span style={{ color: "var(--text-secondary)" }}>?</span>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {hasQuery && !loading && hasResults && (
            <>
              {suggestedQuery && matchType === "fuzzy" && (
                <div
                  className="flex flex-wrap items-center justify-center gap-2 py-4 px-4 rounded-xl border"
                  style={{ borderColor: "var(--color-primary)", backgroundColor: "var(--bg-secondary)" }}
                >
                  <span className="text-base font-medium" style={{ color: "var(--text-secondary)" }}>
                    Did you mean
                  </span>
                  <Link
                    to={`/search?q=${encodeURIComponent(suggestedQuery)}`}
                    className="font-semibold underline text-lg"
                    style={{ color: "var(--color-primary)" }}
                  >
                    {suggestedQuery}
                  </Link>
                  <span className="text-base font-medium" style={{ color: "var(--text-secondary)" }}>
                    ?
                  </span>
                </div>
              )}
              <motion.div variants={fadeInUp} className="flex flex-wrap items-center gap-2">
                <p className="text-base md:text-lg" style={{ color: "var(--text-secondary)" }}>
                  {matchType === "fuzzy" ? "Showing results close to your search — " : ""}
                  {sortedProducts.length} result{sortedProducts.length !== 1 ? "s" : ""} for &quot;{q}&quot;
                </p>
              </motion.div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-8">
                <motion.aside variants={fadeInUp} className="lg:col-span-1 hidden lg:block">
                  <div className="sticky top-24">
                    <ProductFilters
                      filters={filters}
                      onFilterChange={handleFilterChange}
                      onClearFilters={handleClearFilters}
                    />
                  </div>
                </motion.aside>

                <div className="lg:col-span-3 space-y-4 md:space-y-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                      Showing {paginatedProducts.length} of {sortedProducts.length} products
                    </p>
                    <ProductSort currentSort={sortOption} onSortChange={handleSortChange} />
                  </div>

                  <ProductGrid products={paginatedProducts} onQuickView={setQuickViewProduct} />

                  {totalPages > 1 && (
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
                  )}
                </div>
              </div>
            </>
          )}
        </motion.div>
      </Container>

      <QuickView
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={() => setQuickViewProduct(null)}
        onAddToWishlist={() => {}}
      />
    </div>
  );
};

export default Search;
