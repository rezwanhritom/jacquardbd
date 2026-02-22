import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fadeInUp, staggerContainer } from "../../utils/animations";
import { FiEdit, FiTrash2, FiX, FiSave, FiSearch, FiFilter } from "react-icons/fi";
import { EmptyState } from "../../components";
import toast from "react-hot-toast";
import { getDisplayCategory } from "../../utils/productUtils";
import { getAdminProducts, createProduct, updateProduct, deleteProduct } from "../../services/productApi";

const CATEGORY_OPTIONS = [
  { value: "Male", label: "Men" },
  { value: "Female", label: "Women" },
  { value: "Kids", label: "Kids" },
  { value: "Accessories", label: "Accessories" },
];

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "Male",
    price: "",
    originalPrice: "",
    discount: "",
    description: "",
    stockQuantity: "0",
    status: "draft",
  });

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

  const handleEdit = (product) => {
    const categoryPath = product.categoryPath || [];
    const category = product.category || (categoryPath[0] || "Male");
    setEditingProduct(product._id);
    setFormData({
      name: product.name || "",
      category: CATEGORY_OPTIONS.some((o) => o.value === category) ? category : "Male",
      price: (product.price != null ? product.price : "").toString(),
      originalPrice: (product.originalPrice != null ? product.originalPrice : product.price ?? "").toString(),
      discount: (product.discount != null ? product.discount : 0).toString(),
      description: product.description || "",
      stockQuantity: (product.stockQuantity != null ? product.stockQuantity : 0).toString(),
      status: product.status === "active" ? "active" : "draft",
    });
    setShowForm(true);
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const originalPrice = formData.originalPrice ? parseFloat(formData.originalPrice) : parseFloat(formData.price) || 0;
    const discount = formData.discount ? parseFloat(formData.discount) : 0;
    const payload = {
      name: formData.name.trim(),
      category: formData.category,
      originalPrice,
      discount,
      description: (formData.description || "").trim(),
      stockQuantity: Math.max(0, parseInt(formData.stockQuantity, 10) || 0),
      status: formData.status,
    };

    if (editingProduct) {
      const result = await updateProduct(editingProduct, {
        ...payload,
        originalPrice,
        discount,
      });
      if (result.success) {
        const updated = result.product;
        setProducts((prev) => prev.map((p) => (p._id === editingProduct ? { ...p, ...updated } : p)));
        toast.success(`"${formData.name}" updated successfully`);
        handleCancel();
      } else {
        toast.error(result.message || "Failed to update product");
      }
    } else {
      const result = await createProduct(payload);
      if (result.success) {
        const newProduct = result.product;
        if (newProduct) setProducts((prev) => [newProduct, ...prev]);
        toast.success(`"${formData.name}" added successfully`);
        handleCancel();
      } else {
        toast.error(result.message || "Failed to add product");
      }
    }
    setSubmitting(false);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingProduct(null);
    setFormData({
      name: "",
      category: "Male",
      price: "",
      originalPrice: "",
      discount: "",
      description: "",
      stockQuantity: "0",
      status: "draft",
    });
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
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setEditingProduct(null);
              setFormData({
                name: "",
                category: "Male",
                price: "",
                originalPrice: "",
                discount: "",
                description: "",
                stockQuantity: "0",
                status: "draft",
              });
              setShowForm(true);
            }}
            className="px-4 py-2 rounded-lg font-semibold text-white"
            style={{ backgroundColor: "var(--color-primary)" }}
          >
            Add product
          </motion.button>
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

      {/* Add/Edit Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="p-6 rounded-lg space-y-4"
            style={{ backgroundColor: "var(--bg-secondary)" }}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                {editingProduct ? "Edit Product" : "Add New Product"}
              </h3>
              <motion.button
                type="button"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleCancel}
                className="p-2 rounded-lg"
                style={{ color: "var(--text-secondary)" }}
              >
                <FiX size={20} />
              </motion.button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                    Product Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-4 py-3 border-2 rounded-lg outline-none"
                    style={{
                      borderColor: "var(--border-primary)",
                      backgroundColor: "var(--bg-primary)",
                      color: "var(--text-primary)",
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                    className="w-full px-4 py-3 border-2 rounded-lg outline-none"
                    style={{
                      borderColor: "var(--border-primary)",
                      backgroundColor: "var(--bg-primary)",
                      color: "var(--text-primary)",
                    }}
                  >
                    {CATEGORY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                    Original Price * (৳)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                    required
                    className="w-full px-4 py-3 border-2 rounded-lg outline-none"
                    style={{
                      borderColor: "var(--border-primary)",
                      backgroundColor: "var(--bg-primary)",
                      color: "var(--text-primary)",
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                    Discount (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                    className="w-full px-4 py-3 border-2 rounded-lg outline-none"
                    style={{
                      borderColor: "var(--border-primary)",
                      backgroundColor: "var(--bg-primary)",
                      color: "var(--text-primary)",
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                    className="w-full px-4 py-3 border-2 rounded-lg outline-none"
                    style={{
                      borderColor: "var(--border-primary)",
                      backgroundColor: "var(--bg-primary)",
                      color: "var(--text-primary)",
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-3 border-2 rounded-lg outline-none"
                    style={{
                      borderColor: "var(--border-primary)",
                      backgroundColor: "var(--bg-primary)",
                      color: "var(--text-primary)",
                    }}
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 border-2 rounded-lg outline-none resize-none"
                    style={{
                      borderColor: "var(--border-primary)",
                      backgroundColor: "var(--bg-primary)",
                      color: "var(--text-primary)",
                    }}
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <motion.button
                  type="submit"
                  disabled={submitting}
                  whileHover={!submitting ? { scale: 1.02 } : {}}
                  whileTap={!submitting ? { scale: 0.98 } : {}}
                  className="flex items-center gap-2 px-6 py-3 text-white font-semibold rounded-lg disabled:opacity-60"
                  style={{ backgroundColor: "var(--color-primary)" }}
                >
                  <FiSave size={18} />
                  {submitting ? "Saving…" : editingProduct ? "Update Product" : "Add Product"}
                </motion.button>
                <motion.button
                  type="button"
                  onClick={handleCancel}
                  disabled={submitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 px-6 py-3 border-2 rounded-lg font-semibold"
                  style={{
                    borderColor: "var(--border-primary)",
                    color: "var(--text-primary)",
                  }}
                >
                  <FiX size={18} />
                  Cancel
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

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
                        onClick={() => handleEdit(product)}
                        className="p-2 rounded-lg transition-colors"
                        style={{ color: "var(--color-primary)" }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "var(--bg-tertiary)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                        }}
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
