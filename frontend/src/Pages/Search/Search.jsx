import { useState, useMemo } from "react";
import { useSearchParams } from "react-router";
import { Container, ProductGrid, ProductFilters, ProductSort, Pagination, QuickView } from "../../components";
import { productsData } from "../../data/products";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "../../utils/animations";
import { FiSearch } from "react-icons/fi";
import { filterProducts, sortProducts, paginateProducts } from "../../utils/productUtils";

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [filters, setFilters] = useState({
    priceRange: { min: 0, max: 1000 },
    sizes: [],
    colors: [],
  });
  const [sortOption, setSortOption] = useState("default");
  const [currentPage, setCurrentPage] = useState(1);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const itemsPerPage = 12;

  const filteredByQuery = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return productsData.filter(
      (product) =>
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const filteredProducts = useMemo(() => {
    return filterProducts(filteredByQuery, filters);
  }, [filteredByQuery, filters]);

  const sortedProducts = useMemo(() => {
    return sortProducts(filteredProducts, sortOption);
  }, [filteredProducts, sortOption]);

  const { paginatedProducts, totalPages } = useMemo(() => {
    return paginateProducts(sortedProducts, currentPage, itemsPerPage);
  }, [sortedProducts, currentPage, itemsPerPage]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams({ q: searchQuery });
    setCurrentPage(1);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters({
      priceRange: { min: 0, max: 1000 },
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

  return (
    <div className="min-h-screen py-16">
      <Container>
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerContainer}
          className="space-y-8"
        >
          {/* Search Header */}
          <motion.div variants={fadeInUp} className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold" style={{ color: "var(--color-primary)" }}>
              Search Products
            </h1>
            <form onSubmit={handleSearch} className="max-w-2xl">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for products..."
                  className="w-full px-6 py-4 pr-12 border-2 rounded-lg outline-none transition-colors text-sm"
                  style={{
                    borderColor: "var(--border-primary)",
                    backgroundColor: "var(--bg-primary)",
                    color: "var(--text-primary)",
                  }}
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded"
                  style={{ color: "var(--color-primary)" }}
                >
                  <FiSearch size={24} />
                </button>
              </div>
            </form>
          </motion.div>

          {searchQuery && (
            <motion.div variants={fadeInUp}>
              <p className="text-lg mb-6" style={{ color: "var(--text-secondary)" }}>
                {sortedProducts.length > 0
                  ? `Found ${sortedProducts.length} result${sortedProducts.length > 1 ? "s" : ""} for "${searchQuery}"`
                  : `No results found for "${searchQuery}"`}
              </p>
            </motion.div>
          )}

          {searchQuery && sortedProducts.length > 0 && (
            <>
              {/* Main Content */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Filters Sidebar */}
                <motion.aside
                  variants={fadeInUp}
                  className="lg:col-span-1"
                >
                  <div className="sticky top-24">
                    <ProductFilters
                      filters={filters}
                      onFilterChange={handleFilterChange}
                      onClearFilters={handleClearFilters}
                    />
                  </div>
                </motion.aside>

                {/* Products Section */}
                <div className="lg:col-span-3 space-y-6">
                  {/* Sort and Results */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                      Showing {paginatedProducts.length} of {sortedProducts.length} products
                    </p>
                    <ProductSort
                      currentSort={sortOption}
                      onSortChange={handleSortChange}
                    />
                  </div>

                  {/* Product Grid */}
                  <ProductGrid
                    products={paginatedProducts}
                    onQuickView={setQuickViewProduct}
                  />

                  {/* Pagination */}
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

          {!searchQuery && (
            <motion.div variants={fadeInUp} className="text-center py-12">
              <p style={{ color: "var(--text-secondary)" }}>
                Enter a search term to find products
              </p>
            </motion.div>
          )}
        </motion.div>
      </Container>

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

export default Search;
