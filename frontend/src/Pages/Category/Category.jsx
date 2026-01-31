import { useState, useMemo, useEffect } from "react";
import { useParams } from "react-router";
import { Container, ProductGrid, ProductFilters, ProductSort, Pagination, QuickView, ProductCardSkeleton } from "../../components";
import { productsData } from "../../data/products";
import { categoriesData } from "../../data/categories";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "../../utils/animations";
import { filterProducts, sortProducts, paginateProducts } from "../../utils/productUtils";
import { getProductsByGender } from "../../services/productApi";

const isGenderCategory = (name) => name === "men" || name === "women";

/** Map API product to shape expected by ProductCard (id, images, name, price/finalPrice, originalPrice, discount, tag/badge, slug). */
const mapApiProduct = (p) => ({
  ...p,
  id: p._id || p.id,
  images: Array.isArray(p.images) && p.images.length > 0 ? p.images : ["/images/product-placeholder.png"],
  name: p.name || "",
  price: p.finalPrice ?? p.price ?? 0,
  originalPrice: p.originalPrice ?? null,
  discount: p.discount ?? 0,
  badge: p.badge || (Array.isArray(p.tags) && p.tags[0]) || undefined,
  slug: p.slug || "",
});

const Category = () => {
  const { categoryName } = useParams();
  const [filters, setFilters] = useState({
    priceRange: { min: 0, max: 1000 },
    sizes: [],
    colors: [],
  });
  const [sortOption, setSortOption] = useState("default");
  const [currentPage, setCurrentPage] = useState(1);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [apiProducts, setApiProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const itemsPerPage = 12;

  const normalizedCategoryName = categoryName?.toLowerCase();
  const category = categoriesData.find(
    (cat) => {
      const normalized = cat.name.toLowerCase().replace(/\s+/g, "-").replace("'s", "").replace("'", "");
      return normalized === normalizedCategoryName || cat.name.toLowerCase().includes(normalizedCategoryName);
    }
  );

  const useBackendForGender = isGenderCategory(normalizedCategoryName);

  useEffect(() => {
    if (!useBackendForGender || !normalizedCategoryName) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    getProductsByGender(normalizedCategoryName)
      .then((res) => {
        if (cancelled) return;
        setLoading(false);
        if (res.success) setApiProducts((res.products || []).map(mapApiProduct));
        else setError(res.message || "Failed to load products");
      })
      .catch((err) => {
        if (cancelled) return;
        setLoading(false);
        setError(err?.message || "Failed to load products");
      });
    return () => { cancelled = true; };
  }, [normalizedCategoryName, useBackendForGender]);

  const categoryProducts = useMemo(() => {
    if (useBackendForGender) return apiProducts;
    return productsData.filter(
      (product) => {
        const productCategory = product.category.toLowerCase();
        return (
          productCategory === normalizedCategoryName ||
          productCategory.includes(normalizedCategoryName) ||
          (normalizedCategoryName === "accessories" && productCategory === "accessories") ||
          (normalizedCategoryName === "footwear" && productCategory === "footwear")
        );
      }
    );
  }, [useBackendForGender, apiProducts, normalizedCategoryName]);

  const filteredProducts = useMemo(() => {
    return filterProducts(categoryProducts, filters);
  }, [categoryProducts, filters]);

  const sortedProducts = useMemo(() => {
    return sortProducts(filteredProducts, sortOption);
  }, [filteredProducts, sortOption]);

  const { paginatedProducts, totalPages } = useMemo(() => {
    return paginateProducts(sortedProducts, currentPage, itemsPerPage);
  }, [sortedProducts, currentPage, itemsPerPage]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
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
              {category.name}
            </h1>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: "var(--text-secondary)" }}>
              {category.description}
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

              {/* Loading state (men/women only) */}
              {useBackendForGender && loading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <ProductCardSkeleton key={i} />
                  ))}
                </div>
              )}

              {/* Error state (men/women only) */}
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

              {/* Product Grid (when not loading and no error for gender pages) */}
              {(!useBackendForGender || (!loading && !error)) && (
                <>
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
                </>
              )}
            </div>
          </div>
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

export default Category;
