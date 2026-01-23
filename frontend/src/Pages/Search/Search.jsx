import { useState, useMemo } from "react";
import { useSearchParams } from "react-router";
import { Container } from "../../components";
import { productsData } from "../../data/products";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "../../utils/animations";
import { FiSearch, FiShoppingBag } from "react-icons/fi";
import { Link } from "react-router";

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return productsData.filter(
      (product) =>
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams({ q: searchQuery });
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
                  className="w-full px-6 py-4 pr-12 border-2 rounded-lg outline-none transition-colors"
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
                {filteredProducts.length > 0
                  ? `Found ${filteredProducts.length} result${filteredProducts.length > 1 ? "s" : ""} for "${searchQuery}"`
                  : `No results found for "${searchQuery}"`}
              </p>
            </motion.div>
          )}

          {filteredProducts.length > 0 && (
            <motion.div
              variants={staggerContainer}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {filteredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  variants={fadeInUp}
                  className="group cursor-pointer"
                  style={{ backgroundColor: "var(--bg-primary)" }}
                >
                  <Link to={`/product/${product.id}`}>
                    <div className="relative overflow-hidden aspect-[3/4] mb-4" style={{ backgroundColor: "var(--bg-tertiary)" }}>
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {product.badge && (
                        <span
                          className="absolute top-4 left-4 px-3 py-1 text-xs font-semibold uppercase text-white"
                          style={{ backgroundColor: "var(--color-primary)" }}
                        >
                          {product.badge}
                        </span>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          className="p-3 rounded-full text-white"
                          style={{ backgroundColor: "var(--color-primary)" }}
                        >
                          <FiShoppingBag size={20} />
                        </motion.div>
                      </div>
                    </div>
                    <div className="p-4 space-y-2">
                      <p className="text-xs uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
                        {product.category}
                      </p>
                      <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>
                        {product.name}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold" style={{ color: "var(--color-primary)" }}>
                          ${product.price.toFixed(2)}
                        </span>
                        {product.originalPrice && (
                          <span className="text-sm line-through" style={{ color: "var(--text-tertiary)" }}>
                            ${product.originalPrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
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
    </div>
  );
};

export default Search;
