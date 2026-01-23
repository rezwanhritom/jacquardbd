import { useState, useMemo } from "react";
import { useParams } from "react-router";
import { Container, ProductGrid, ProductFilters, ProductSort, Pagination } from "../../components";
import { productsData } from "../../data/products";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "../../utils/animations";
import { filterProducts, sortProducts, paginateProducts } from "../../utils/productUtils";

const collections = [
  {
    id: "new-arrivals",
    name: "New Arrivals",
    description: "Discover our latest fashion pieces",
    products: productsData.filter((p) => p.badge === "New" || p.id === 2 || p.id === 6 || p.id === 8),
  },
  {
    id: "sale",
    name: "Sale Collection",
    description: "Special discounts on selected items",
    products: productsData.filter((p) => p.discount),
  },
  {
    id: "best-sellers",
    name: "Best Sellers",
    description: "Our most popular items",
    products: productsData.filter((p) => p.badge === "Best Seller" || p.id === 1 || p.id === 3 || p.id === 5),
  },
];

const Collection = () => {
  const { collectionId } = useParams();
  const [filters, setFilters] = useState({
    priceRange: { min: 0, max: 1000 },
    sizes: [],
    colors: [],
  });
  const [sortOption, setSortOption] = useState("default");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const collection = collections.find((col) => col.id === collectionId);

  const filteredProducts = useMemo(() => {
    if (!collection) return [];
    return filterProducts(collection.products, filters);
  }, [collection, filters]);

  const sortedProducts = useMemo(() => {
    return sortProducts(filteredProducts, sortOption);
  }, [filteredProducts, sortOption]);

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

  if (!collection) {
    return (
      <div className="min-h-[60vh] py-16">
        <Container>
          <h1 className="text-4xl font-bold" style={{ color: "var(--color-primary)" }}>
            Collection not found
          </h1>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16">
      <Container>
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerContainer}
          className="space-y-8"
        >
          {/* Header */}
          <motion.div variants={fadeInUp} className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold" style={{ color: "var(--color-primary)" }}>
              {collection.name}
            </h1>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: "var(--text-secondary)" }}>
              {collection.description}
            </p>
            <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
              {sortedProducts.length} product{sortedProducts.length !== 1 ? "s" : ""} found
            </p>
          </motion.div>

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
              <ProductGrid products={paginatedProducts} />

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
        </motion.div>
      </Container>
    </div>
  );
};

export default Collection;
