import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { motion } from "framer-motion";
import { staggerContainer } from "../../utils/animations";
import { FiEdit, FiTrash2, FiSearch, FiFilter } from "react-icons/fi";
import { EmptyState } from "../../components";
import toast from "react-hot-toast";
import { getDisplayCategory } from "../../utils/productUtils";
import { getAdminProducts, deleteProduct } from "../../services/productApi";

const Products = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchProducts = async () => {
    setLoading(true);
    const result = await getAdminProducts();
    if (result.success && result.products) {
      setProducts(result.products);
    } else {
      toast.error(result.message || "Failed to load products");
      setProducts([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(
    (product) =>
      (product.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.category || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.categoryPath || []).some((p) => (p || "").toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleDelete = async (product) => {
    if (!window.confirm(`Are you sure you want to delete "${product?.name}"?`)) return;
    const result = await deleteProduct(product._id);
    if (result.success) {
      setProducts((prev) => prev.filter((p) => p._id !== product._id));
      toast.success(`"${product?.name}" deleted successfully`);
    } else {
      toast.error(result.message || "Failed to delete product");
    }
  };

  const inStock = (product) => (product.stockQuantity != null ? product.stockQuantity > 0 : false);

  if (loading) {
    return (
      <div className="p-6 rounded-lg flex items-center justify-center min-h-[200px]" style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-secondary)" }}>
        Loading products…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
          Products Management
        </h2>
        <div className="flex items-center gap-3 flex-wrap">
          <Link
            to="/admin/products/new"
            className="px-4 py-2 rounded-lg font-semibold text-white inline-block"
            style={{ backgroundColor: "var(--color-primary)" }}
          >
            Add product
          </Link>
        <div className="relative">
          <FiSearch size={20} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-tertiary)" }} />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 border-2 rounded-lg outline-none"
            style={{
              borderColor: "var(--border-primary)",
              backgroundColor: "var(--bg-primary)",
              color: "var(--text-primary)",
            }}
          />
        </div>
        </div>
      </div>

      {/* Products Table */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={staggerContainer}
        className="p-6 rounded-lg space-y-4 overflow-x-auto"
        style={{ backgroundColor: "var(--bg-secondary)" }}
      >
        <div className="min-w-full">
          <table className="w-full">
            <thead>
              <tr className="border-b-2" style={{ borderColor: "var(--border-primary)" }}>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: "var(--text-primary)" }}>
                  Product
                </th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: "var(--text-primary)" }}>
                  Category
                </th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: "var(--text-primary)" }}>
                  Price
                </th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: "var(--text-primary)" }}>
                  Stock
                </th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: "var(--text-primary)" }}>
                  Status
                </th>
                <th className="text-right py-3 px-4 font-semibold" style={{ color: "var(--text-primary)" }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product, index) => (
                <motion.tr
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b"
                  style={{ borderColor: "var(--border-primary)" }}
                  whileHover={{ backgroundColor: "var(--bg-tertiary)" }}
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 flex-shrink-0 overflow-hidden rounded-lg" style={{ backgroundColor: "var(--bg-tertiary)" }}>
                        {product.images?.[0] ? (
                          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs" style={{ color: "var(--text-tertiary)" }}>
                            —
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
                          {product.name}
                        </p>
                        {product.collection && product.collection !== "regular" && (
                          <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: "var(--color-primary)20", color: "var(--color-primary)" }}>
                            {{ "new-arrivals": "New Arrivals", "sale": "Sale", "featured": "Campaigns", "campaigns": "Campaigns" }[product.collection] || product.collection}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                      {getDisplayCategory(product)}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div>
                      <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
                        ৳{(product.price != null ? product.price : 0).toFixed(2)}
                      </span>
                      {product.originalPrice != null && product.originalPrice > (product.price ?? 0) && (
                        <span className="text-sm line-through ml-2" style={{ color: "var(--text-tertiary)" }}>
                          ৳{product.originalPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
                      {product.stockQuantity != null ? Number(product.stockQuantity) : 0}
                    </span>
                    <span className="text-xs ml-1" style={{ color: "var(--text-tertiary)" }}>
                      items
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className="px-3 py-1 text-xs font-semibold rounded-lg"
                      style={{
                        backgroundColor: inStock(product) ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)",
                        color: inStock(product) ? "rgb(34, 197, 94)" : "rgb(239, 68, 68)",
                      }}
                    >
                      {inStock(product) ? "In Stock" : "Out of Stock"}
                    </span>
                    <span className="text-xs ml-1" style={{ color: "var(--text-tertiary)" }}>
                      ({product.status || "draft"})
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => navigate(`/admin/products/${product._id}/edit`)}
                        className="p-2 rounded-lg transition-colors"
                        style={{ color: "var(--color-primary)" }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "var(--bg-tertiary)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                        }}
                        title="Edit product (full form)"
                      >
                        <FiEdit size={18} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDelete(product)}
                        className="p-2 rounded-lg transition-colors"
                        style={{ color: "var(--color-tertiary)" }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "var(--bg-tertiary)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                        }}
                      >
                        <FiTrash2 size={18} />
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredProducts.length === 0 && (
          <EmptyState
            icon={FiFilter}
            title="No products found"
            description={searchQuery ? "Try adjusting your search terms" : "No products in the database yet. Add one above."}
          />
        )}
      </motion.div>
    </div>
  );
};

export default Products;
