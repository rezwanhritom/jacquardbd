import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fadeInUp, staggerContainer } from "../../utils/animations";
import { FiEdit, FiTrash2, FiPlus, FiX, FiSave, FiSearch, FiFilter } from "react-icons/fi";
import { productsData } from "../../data/products";
import { EmptyState } from "../../components";
import toast from "react-hot-toast";

const Products = () => {
  const [products, setProducts] = useState(productsData);
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "Men",
    price: "",
    originalPrice: "",
    discount: "",
    description: "",
    inStock: true,
    badge: "",
  });

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (product) => {
    setEditingProduct(product.id);
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      originalPrice: product.originalPrice?.toString() || "",
      discount: product.discount?.toString() || "",
      description: product.description || "",
      inStock: product.inStock,
      badge: product.badge || "",
    });
    setShowForm(true);
  };

  const handleDelete = (id) => {
    const product = products.find((p) => p.id === id);
    if (window.confirm(`Are you sure you want to delete "${product?.name}"?`)) {
      setProducts(products.filter((p) => p.id !== id));
      toast.success(`"${product?.name}" deleted successfully`);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingProduct) {
      setProducts(
        products.map((p) =>
          p.id === editingProduct
            ? {
                ...p,
                ...formData,
                price: parseFloat(formData.price),
                originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
                discount: formData.discount ? parseFloat(formData.discount) : null,
              }
            : p
        )
      );
      toast.success(`"${formData.name}" updated successfully`);
    } else {
      setProducts([
        ...products,
        {
          id: products.length + 1,
          ...formData,
          price: parseFloat(formData.price),
          originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
          discount: formData.discount ? parseFloat(formData.discount) : null,
          images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80"],
        },
      ]);
      toast.success(`"${formData.name}" added successfully`);
    }
    handleCancel();
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingProduct(null);
    setFormData({
      name: "",
      category: "Men",
      price: "",
      originalPrice: "",
      discount: "",
      description: "",
      inStock: true,
      badge: "",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
          Products Management
        </h2>
        <div className="flex items-center gap-3">
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
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setShowForm(true);
              setEditingProduct(null);
            }}
            className="flex items-center gap-2 px-4 py-2 text-white font-semibold rounded-lg"
            style={{ backgroundColor: "var(--color-primary)" }}
          >
            <FiPlus size={18} />
            Add Product
          </motion.button>
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
                    <option value="Men">Men</option>
                    <option value="Women">Women</option>
                    <option value="Kids">Kids</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                    Price *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
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
                    Original Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
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
                    Badge
                  </label>
                  <input
                    type="text"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    placeholder="e.g., Best Seller, New"
                    className="w-full px-4 py-3 border-2 rounded-lg outline-none"
                    style={{
                      borderColor: "var(--border-primary)",
                      backgroundColor: "var(--bg-primary)",
                      color: "var(--text-primary)",
                    }}
                  />
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
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="inStock"
                    checked={formData.inStock}
                    onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                    className="w-5 h-5"
                    style={{ accentColor: "var(--color-primary)" }}
                  />
                  <label htmlFor="inStock" className="text-sm" style={{ color: "var(--text-secondary)" }}>
                    In Stock
                  </label>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 px-6 py-3 text-white font-semibold rounded-lg"
                  style={{ backgroundColor: "var(--color-primary)" }}
                >
                  <FiSave size={18} />
                  {editingProduct ? "Update Product" : "Add Product"}
                </motion.button>
                <motion.button
                  type="button"
                  onClick={handleCancel}
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
                <th className="text-left py-3 px-4 font-semibold" style={{ color: "var(--text-primary)" }}>Product</th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: "var(--text-primary)" }}>Category</th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: "var(--text-primary)" }}>Price</th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: "var(--text-primary)" }}>Status</th>
                <th className="text-right py-3 px-4 font-semibold" style={{ color: "var(--text-primary)" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product, index) => (
                <motion.tr
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b" style={{ borderColor: "var(--border-primary)" }}
                  whileHover={{ backgroundColor: "var(--bg-tertiary)" }}
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 flex-shrink-0 overflow-hidden rounded-lg" style={{ backgroundColor: "var(--bg-tertiary)" }}>
                        <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
                          {product.name}
                        </p>
                        {product.badge && (
                          <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: "var(--color-primary)20", color: "var(--color-primary)" }}>
                            {product.badge}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                      {product.category}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div>
                      <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
                        ${product.price.toFixed(2)}
                      </span>
                      {product.originalPrice && (
                        <span className="text-sm line-through ml-2" style={{ color: "var(--text-tertiary)" }}>
                          ${product.originalPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className="px-3 py-1 text-xs font-semibold rounded-lg"
                      style={{
                        backgroundColor: product.inStock ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)",
                        color: product.inStock ? "rgb(34, 197, 94)" : "rgb(239, 68, 68)",
                      }}
                    >
                      {product.inStock ? "In Stock" : "Out of Stock"}
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
                        onClick={() => handleDelete(product.id)}
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
            description={searchQuery ? "Try adjusting your search terms" : "No products available"}
          />
        )}
      </motion.div>
    </div>
  );
};

export default Products;
