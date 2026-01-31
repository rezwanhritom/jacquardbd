import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiChevronRight,
  FiSave,
  FiX,
  FiPackage,
  FiImage,
  FiDollarSign,
  FiGrid,
  FiTag,
  FiEye,
  FiInfo,
  FiAlertCircle,
  FiCheck,
} from "react-icons/fi";
import { ImageUpload, TagInput, ColorSwatch, CascadingCategorySelect } from "../../components/Admin";
import { fadeInUp, staggerContainer } from "../../utils/animations";
import toast from "react-hot-toast";
import { createProduct as createProductApi } from "../../services/productApi";
import { categoryTree } from "../../data/categoryTree";

const availableSizes = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];
const collections = [
  "New Arrivals",
  "Best Sellers",
  "Summer Collection",
  "Winter Collection",
  "Limited Edition",
  "Sale",
];

const ProductCreate = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeSection, setActiveSection] = useState("basic");

  // Form state (originalPrice + discount; finalPrice is calculated)
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    sku: "",
    shortDescription: "",
    fullDescription: "",
    originalPrice: "",
    discount: "",
    stockQuantity: "",
    sizes: [],
    colors: [],
    material: "",
    fit: "",
    category: "",
    collections: [],
    tags: [],
    isActive: true,
    isFeatured: false,
  });

  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState({});

  // Auto-generate slug from name
  const handleNameChange = (e) => {
    const name = e.target.value;
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    setFormData((prev) => ({ ...prev, name, slug }));
    if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const toggleSize = (size) => {
    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size],
    }));
  };

  const toggleCollection = (collection) => {
    setFormData((prev) => ({
      ...prev,
      collections: prev.collections.includes(collection)
        ? prev.collections.filter((c) => c !== collection)
        : [...prev.collections, collection],
    }));
  };

  // Final price = Original Price - (Original Price * Discount / 100)
  const finalPrice = useMemo(() => {
    const original = parseFloat(formData.originalPrice);
    const discountPct = parseFloat(formData.discount) || 0;
    if (Number.isNaN(original) || original < 0) return null;
    const value = original * (1 - discountPct / 100);
    return Math.round(value * 100) / 100;
  }, [formData.originalPrice, formData.discount]);

  // Stock status
  const stockStatus = useMemo(() => {
    const qty = parseInt(formData.stockQuantity) || 0;
    if (qty === 0) return { label: "Out of Stock", color: "var(--color-tertiary)" };
    if (qty <= 10) return { label: "Low Stock", color: "#f59e0b" };
    return { label: "In Stock", color: "var(--color-secondary)" };
  }, [formData.stockQuantity]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Product name is required";
    const orig = parseFloat(formData.originalPrice);
    if (formData.originalPrice === "" || formData.originalPrice == null || Number.isNaN(orig) || orig < 0) {
      newErrors.originalPrice = "Original price is required";
    }
    const disc = parseFloat(formData.discount);
    if (formData.discount !== "" && !Number.isNaN(disc) && (disc < 0 || disc > 100)) {
      newErrors.discount = "Discount must be 0–100";
    }
    if (!formData.category) newErrors.category = "Category is required";
    // Images not required: backend uses default placeholder
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const buildProductPayload = (isDraft) => ({
    name: formData.name.trim(),
    shortDescription: formData.shortDescription.trim(),
    description: formData.fullDescription.trim(),
    originalPrice: formData.originalPrice || undefined,
    discount: formData.discount !== "" ? formData.discount : undefined,
    category: formData.category || undefined,
    collections: formData.collections,
    tags: formData.tags,
    variants: { size: formData.sizes, color: formData.colors },
    stockQuantity: parseInt(formData.stockQuantity, 10) || 0,
    isFeatured: formData.isFeatured,
    status: isDraft ? "draft" : formData.isActive ? "active" : "draft",
    sku: formData.sku.trim() || undefined,
    material: formData.material.trim() || undefined,
    fit: formData.fit || undefined,
  });

  const handleSubmit = async (isDraft = false) => {
    if (!isDraft && !validateForm()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    const payload = buildProductPayload(isDraft);
    const result = await createProductApi(payload);

    setIsSubmitting(false);

    if (result.success) {
      toast.success(isDraft ? "Draft saved successfully!" : "Product created successfully!");
      if (!isDraft) {
        navigate("/admin/products");
      }
    } else {
      const msg = result.errors?.length ? result.errors.join(". ") : result.message;
      toast.error(msg || "Failed to create product");
      if (result.errors?.length) {
        const newErrors = {};
        result.errors.forEach((e) => {
          const lower = e.toLowerCase();
          if (lower.includes("name")) newErrors.name = e;
          else if (lower.includes("original price")) newErrors.originalPrice = e;
          else if (lower.includes("discount")) newErrors.discount = e;
          else if (lower.includes("category")) newErrors.category = e;
        });
        if (Object.keys(newErrors).length) setErrors(newErrors);
      }
    }
  };

  const sections = [
    { id: "basic", label: "Basic Info", icon: FiPackage },
    { id: "media", label: "Media", icon: FiImage },
    { id: "pricing", label: "Pricing", icon: FiDollarSign },
    { id: "variants", label: "Variants", icon: FiGrid },
    { id: "organization", label: "Organization", icon: FiTag },
    { id: "visibility", label: "Visibility", icon: FiEye },
  ];

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={staggerContainer}
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm mb-2">
            <Link
              to="/admin"
              className="transition-colors"
              style={{ color: "var(--text-tertiary)" }}
              onMouseEnter={(e) => (e.target.style.color = "var(--color-primary)")}
              onMouseLeave={(e) => (e.target.style.color = "var(--text-tertiary)")}
            >
              Dashboard
            </Link>
            <FiChevronRight size={14} style={{ color: "var(--text-tertiary)" }} />
            <Link
              to="/admin/products"
              className="transition-colors"
              style={{ color: "var(--text-tertiary)" }}
              onMouseEnter={(e) => (e.target.style.color = "var(--color-primary)")}
              onMouseLeave={(e) => (e.target.style.color = "var(--text-tertiary)")}
            >
              Products
            </Link>
            <FiChevronRight size={14} style={{ color: "var(--text-tertiary)" }} />
            <span style={{ color: "var(--text-primary)" }}>Add New</span>
          </nav>
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
            Add New Product
          </h1>
        </div>

        {/* Desktop Action Buttons */}
        <div className="hidden sm:flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/admin/products")}
            className="px-5 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2 border-2"
            style={{
              borderColor: "var(--border-primary)",
              color: "var(--text-secondary)",
              backgroundColor: "transparent",
            }}
          >
            <FiX size={16} />
            Cancel
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSubmit(true)}
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2"
            style={{
              backgroundColor: "var(--bg-secondary)",
              color: "var(--text-primary)",
            }}
          >
            Save as Draft
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSubmit(false)}
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2 text-white relative"
            style={{ backgroundColor: "var(--color-primary)" }}
          >
            {isSubmitting ? (
              <>
                <motion.div
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                Saving...
              </>
            ) : (
              <>
                <FiSave size={16} />
                Save Product
              </>
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* Section Navigation (Mobile) */}
      <motion.div
        variants={fadeInUp}
        className="flex overflow-x-auto gap-2 pb-2 lg:hidden scrollbar-hide"
      >
        {sections.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;
          return (
            <motion.button
              key={section.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                isActive ? "text-white" : ""
              }`}
              style={{
                backgroundColor: isActive ? "var(--color-primary)" : "var(--bg-secondary)",
                color: isActive ? "white" : "var(--text-secondary)",
              }}
            >
              <Icon size={16} />
              {section.label}
            </motion.button>
          );
        })}
      </motion.div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <motion.section
            variants={fadeInUp}
            className="rounded-xl p-6 border"
            style={{
              backgroundColor: "var(--bg-primary)",
              borderColor: "var(--border-primary)",
            }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div
                className="p-2 rounded-lg"
                style={{ backgroundColor: "var(--bg-secondary)" }}
              >
                <FiPackage size={20} style={{ color: "var(--color-primary)" }} />
              </div>
              <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                Basic Information
              </h2>
            </div>

            <div className="space-y-5">
              {/* Product Name */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>
                  Product Name <span style={{ color: "var(--color-tertiary)" }}>*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleNameChange}
                  placeholder="Enter product name"
                  className="w-full px-4 py-3 border-2 rounded-lg outline-none transition-colors text-sm"
                  style={{
                    borderColor: errors.name ? "var(--color-tertiary)" : "var(--border-primary)",
                    backgroundColor: "var(--bg-primary)",
                    color: "var(--text-primary)",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "var(--color-primary)")}
                  onBlur={(e) =>
                    (e.target.style.borderColor = errors.name
                      ? "var(--color-tertiary)"
                      : "var(--border-primary)")
                  }
                />
                {errors.name && (
                  <p className="text-xs mt-1 flex items-center gap-1" style={{ color: "var(--color-tertiary)" }}>
                    <FiAlertCircle size={12} /> {errors.name}
                  </p>
                )}
              </div>

              {/* Slug & SKU */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>
                    Slug
                  </label>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    placeholder="auto-generated-slug"
                    className="w-full px-4 py-3 border-2 rounded-lg outline-none transition-colors text-sm"
                    style={{
                      borderColor: "var(--border-primary)",
                      backgroundColor: "var(--bg-secondary)",
                      color: "var(--text-tertiary)",
                    }}
                    readOnly
                  />
                  <p className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>
                    Auto-generated from product name
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>
                    SKU
                  </label>
                  <input
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={handleChange}
                    placeholder="e.g., PROD-001"
                    className="w-full px-4 py-3 border-2 rounded-lg outline-none transition-colors text-sm"
                    style={{
                      borderColor: "var(--border-primary)",
                      backgroundColor: "var(--bg-primary)",
                      color: "var(--text-primary)",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "var(--color-primary)")}
                    onBlur={(e) => (e.target.style.borderColor = "var(--border-primary)")}
                  />
                </div>
              </div>

              {/* Short Description */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>
                  Short Description
                </label>
                <input
                  type="text"
                  name="shortDescription"
                  value={formData.shortDescription}
                  onChange={handleChange}
                  placeholder="Brief product summary (max 160 characters)"
                  maxLength={160}
                  className="w-full px-4 py-3 border-2 rounded-lg outline-none transition-colors text-sm"
                  style={{
                    borderColor: "var(--border-primary)",
                    backgroundColor: "var(--bg-primary)",
                    color: "var(--text-primary)",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "var(--color-primary)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--border-primary)")}
                />
                <p className="text-xs mt-1 text-right" style={{ color: "var(--text-tertiary)" }}>
                  {formData.shortDescription.length}/160
                </p>
              </div>

              {/* Full Description */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>
                  Full Description
                </label>
                <textarea
                  name="fullDescription"
                  value={formData.fullDescription}
                  onChange={handleChange}
                  placeholder="Detailed product description..."
                  rows={5}
                  className="w-full px-4 py-3 border-2 rounded-lg outline-none transition-colors text-sm resize-none"
                  style={{
                    borderColor: "var(--border-primary)",
                    backgroundColor: "var(--bg-primary)",
                    color: "var(--text-primary)",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "var(--color-primary)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--border-primary)")}
                />
              </div>
            </div>
          </motion.section>

          {/* Media Upload */}
          <motion.section
            variants={fadeInUp}
            className="rounded-xl p-6 border"
            style={{
              backgroundColor: "var(--bg-primary)",
              borderColor: errors.images ? "var(--color-tertiary)" : "var(--border-primary)",
            }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div
                className="p-2 rounded-lg"
                style={{ backgroundColor: "var(--bg-secondary)" }}
              >
                <FiImage size={20} style={{ color: "var(--color-primary)" }} />
              </div>
              <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                Media
              </h2>
              {errors.images && (
                <span className="text-xs flex items-center gap-1" style={{ color: "var(--color-tertiary)" }}>
                  <FiAlertCircle size={12} /> {errors.images}
                </span>
              )}
            </div>

            <ImageUpload images={images} setImages={setImages} />
          </motion.section>

          {/* Pricing & Inventory */}
          <motion.section
            variants={fadeInUp}
            className="rounded-xl p-6 border"
            style={{
              backgroundColor: "var(--bg-primary)",
              borderColor: "var(--border-primary)",
            }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div
                className="p-2 rounded-lg"
                style={{ backgroundColor: "var(--bg-secondary)" }}
              >
                <FiDollarSign size={20} style={{ color: "var(--color-primary)" }} />
              </div>
              <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                Pricing & Inventory
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Original Price */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>
                  Original Price <span style={{ color: "var(--color-tertiary)" }}>*</span>
                </label>
                <div className="relative">
                  <span
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-sm"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    ৳
                  </span>
                  <input
                    type="number"
                    name="originalPrice"
                    value={formData.originalPrice}
                    onChange={handleChange}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="w-full pl-8 pr-4 py-3 border-2 rounded-lg outline-none transition-colors text-sm"
                    style={{
                      borderColor: errors.originalPrice ? "var(--color-tertiary)" : "var(--border-primary)",
                      backgroundColor: "var(--bg-primary)",
                      color: "var(--text-primary)",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "var(--color-primary)")}
                    onBlur={(e) =>
                      (e.target.style.borderColor = errors.originalPrice
                        ? "var(--color-tertiary)"
                        : "var(--border-primary)")
                    }
                  />
                </div>
                {errors.originalPrice && (
                  <p className="text-xs mt-1 flex items-center gap-1" style={{ color: "var(--color-tertiary)" }}>
                    <FiAlertCircle size={12} /> {errors.originalPrice}
                  </p>
                )}
              </div>

              {/* Discount (%) */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>
                  Discount (%)
                </label>
                <input
                  type="number"
                  name="discount"
                  value={formData.discount}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  max="100"
                  step="0.5"
                  className="w-full px-4 py-3 border-2 rounded-lg outline-none transition-colors text-sm"
                  style={{
                    borderColor: errors.discount ? "var(--color-tertiary)" : "var(--border-primary)",
                    backgroundColor: "var(--bg-primary)",
                    color: "var(--text-primary)",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "var(--color-primary)")}
                  onBlur={(e) =>
                    (e.target.style.borderColor = errors.discount
                      ? "var(--color-tertiary)"
                      : "var(--border-primary)")
                  }
                />
                {errors.discount && (
                  <p className="text-xs mt-1 flex items-center gap-1" style={{ color: "var(--color-tertiary)" }}>
                    <FiAlertCircle size={12} /> {errors.discount}
                  </p>
                )}
              </div>

              {/* Final Price (calculated, read-only) */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>
                  Final Price
                </label>
                <div
                  className="w-full px-4 py-3 border-2 rounded-lg text-sm font-semibold"
                  style={{
                    borderColor: "var(--border-primary)",
                    backgroundColor: "var(--bg-secondary)",
                    color: "var(--color-primary)",
                  }}
                >
                  {finalPrice != null ? `৳ ${finalPrice.toFixed(2)}` : "—"}
                </div>
                <p className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>
                  Original Price − (Original Price × Discount ÷ 100)
                </p>
              </div>

              {/* Stock Quantity */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>
                  Stock Quantity
                </label>
                <input
                  type="number"
                  name="stockQuantity"
                  value={formData.stockQuantity}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  className="w-full px-4 py-3 border-2 rounded-lg outline-none transition-colors text-sm"
                  style={{
                    borderColor: "var(--border-primary)",
                    backgroundColor: "var(--bg-primary)",
                    color: "var(--text-primary)",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "var(--color-primary)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--border-primary)")}
                />
              </div>

              {/* Stock Status Badge */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>
                  Stock Status
                </label>
                <div
                  className="px-4 py-3 border-2 rounded-lg flex items-center gap-2"
                  style={{
                    borderColor: "var(--border-primary)",
                    backgroundColor: "var(--bg-secondary)",
                  }}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: stockStatus.color }}
                  />
                  <span className="text-sm font-medium" style={{ color: stockStatus.color }}>
                    {stockStatus.label}
                  </span>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Variants & Attributes */}
          <motion.section
            variants={fadeInUp}
            className="rounded-xl p-6 border"
            style={{
              backgroundColor: "var(--bg-primary)",
              borderColor: "var(--border-primary)",
            }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div
                className="p-2 rounded-lg"
                style={{ backgroundColor: "var(--bg-secondary)" }}
              >
                <FiGrid size={20} style={{ color: "var(--color-primary)" }} />
              </div>
              <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                Variants & Attributes
              </h2>
            </div>

            <div className="space-y-6">
              {/* Sizes */}
              <div>
                <label className="block text-sm font-medium mb-3" style={{ color: "var(--text-primary)" }}>
                  Available Sizes
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map((size) => {
                    const isSelected = formData.sizes.includes(size);
                    return (
                      <motion.button
                        key={size}
                        type="button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => toggleSize(size)}
                        className={`px-4 py-2 rounded-lg font-medium text-sm border-2 transition-colors ${
                          isSelected ? "text-white" : ""
                        }`}
                        style={{
                          borderColor: isSelected ? "var(--color-primary)" : "var(--border-primary)",
                          backgroundColor: isSelected ? "var(--color-primary)" : "transparent",
                          color: isSelected ? "white" : "var(--text-secondary)",
                        }}
                      >
                        {size}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Colors */}
              <div>
                <label className="block text-sm font-medium mb-3" style={{ color: "var(--text-primary)" }}>
                  Available Colors
                </label>
                <ColorSwatch
                  selectedColors={formData.colors}
                  setSelectedColors={(colors) => setFormData((prev) => ({ ...prev, colors }))}
                />
              </div>

              {/* Material & Fit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>
                    Material
                  </label>
                  <input
                    type="text"
                    name="material"
                    value={formData.material}
                    onChange={handleChange}
                    placeholder="e.g., 100% Cotton"
                    className="w-full px-4 py-3 border-2 rounded-lg outline-none transition-colors text-sm"
                    style={{
                      borderColor: "var(--border-primary)",
                      backgroundColor: "var(--bg-primary)",
                      color: "var(--text-primary)",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "var(--color-primary)")}
                    onBlur={(e) => (e.target.style.borderColor = "var(--border-primary)")}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>
                    Fit
                  </label>
                  <select
                    name="fit"
                    value={formData.fit}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 rounded-lg outline-none transition-colors text-sm appearance-none cursor-pointer"
                    style={{
                      borderColor: "var(--border-primary)",
                      backgroundColor: "var(--bg-primary)",
                      color: formData.fit ? "var(--text-primary)" : "var(--text-tertiary)",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "var(--color-primary)")}
                    onBlur={(e) => (e.target.style.borderColor = "var(--border-primary)")}
                  >
                    <option value="">Select fit type</option>
                    <option value="slim">Slim Fit</option>
                    <option value="regular">Regular Fit</option>
                    <option value="relaxed">Relaxed Fit</option>
                    <option value="oversized">Oversized</option>
                  </select>
                </div>
              </div>
            </div>
          </motion.section>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Organization */}
          <motion.section
            variants={fadeInUp}
            className="rounded-xl p-6 border sticky top-24"
            style={{
              backgroundColor: "var(--bg-primary)",
              borderColor: "var(--border-primary)",
            }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div
                className="p-2 rounded-lg"
                style={{ backgroundColor: "var(--bg-secondary)" }}
              >
                <FiTag size={20} style={{ color: "var(--color-primary)" }} />
              </div>
              <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                Organization
              </h2>
            </div>

            <div className="space-y-5">
              {/* Category (gender-based cascading) */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>
                  Category <span style={{ color: "var(--color-tertiary)" }}>*</span>
                </label>
                <CascadingCategorySelect
                  categoryTree={categoryTree}
                  value={formData.category}
                  onChange={(fullPath) => {
                    setFormData((prev) => ({ ...prev, category: fullPath }));
                    if (errors.category) setErrors((prev) => ({ ...prev, category: "" }));
                  }}
                  error={errors.category}
                />
              </div>

              {/* Collections */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>
                  Collections
                </label>
                <div className="flex flex-wrap gap-2">
                  {collections.map((collection) => {
                    const isSelected = formData.collections.includes(collection);
                    return (
                      <motion.button
                        key={collection}
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => toggleCollection(collection)}
                        className="px-3 py-1.5 rounded-full text-xs font-medium border transition-colors"
                        style={{
                          borderColor: isSelected ? "var(--color-primary)" : "var(--border-primary)",
                          backgroundColor: isSelected ? "var(--color-primary)" : "transparent",
                          color: isSelected ? "white" : "var(--text-secondary)",
                        }}
                      >
                        {collection}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>
                  Product Tags
                </label>
                <TagInput
                  tags={formData.tags}
                  setTags={(tags) => setFormData((prev) => ({ ...prev, tags }))}
                  placeholder="Add tags..."
                />
              </div>
            </div>
          </motion.section>

          {/* Visibility & Status */}
          <motion.section
            variants={fadeInUp}
            className="rounded-xl p-6 border"
            style={{
              backgroundColor: "var(--bg-primary)",
              borderColor: "var(--border-primary)",
            }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div
                className="p-2 rounded-lg"
                style={{ backgroundColor: "var(--bg-secondary)" }}
              >
                <FiEye size={20} style={{ color: "var(--color-primary)" }} />
              </div>
              <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                Visibility
              </h2>
            </div>

            <div className="space-y-4">
              {/* Active Toggle */}
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                    Active
                  </span>
                  <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                    (visible to customers)
                  </span>
                </div>
                <motion.button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, isActive: !prev.isActive }))}
                  className="relative w-12 h-6 rounded-full transition-colors"
                  style={{
                    backgroundColor: formData.isActive ? "var(--color-primary)" : "var(--bg-tertiary)",
                  }}
                >
                  <motion.div
                    className="absolute top-1 w-4 h-4 rounded-full bg-white"
                    animate={{ left: formData.isActive ? 28 : 4 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                </motion.button>
              </label>

              {/* Featured Toggle */}
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                    Featured
                  </span>
                  <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                    (show on homepage)
                  </span>
                </div>
                <motion.button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, isFeatured: !prev.isFeatured }))}
                  className="relative w-12 h-6 rounded-full transition-colors"
                  style={{
                    backgroundColor: formData.isFeatured ? "var(--color-primary)" : "var(--bg-tertiary)",
                  }}
                >
                  <motion.div
                    className="absolute top-1 w-4 h-4 rounded-full bg-white"
                    animate={{ left: formData.isFeatured ? 28 : 4 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                </motion.button>
              </label>
            </div>

            {/* Info box */}
            <div
              className="mt-4 p-3 rounded-lg flex items-start gap-2"
              style={{ backgroundColor: "var(--bg-secondary)" }}
            >
              <FiInfo size={16} style={{ color: "var(--text-tertiary)" }} className="mt-0.5" />
              <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                Draft products are saved but not visible to customers until marked as active.
              </p>
            </div>
          </motion.section>
        </div>
      </div>

      {/* Mobile Sticky Action Bar */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-0 left-0 right-0 p-4 border-t sm:hidden z-50"
        style={{
          backgroundColor: "var(--bg-primary)",
          borderColor: "var(--border-primary)",
        }}
      >
        <div className="flex gap-3">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSubmit(true)}
            disabled={isSubmitting}
            className="flex-1 py-3 rounded-lg font-medium text-sm"
            style={{
              backgroundColor: "var(--bg-secondary)",
              color: "var(--text-primary)",
            }}
          >
            Save Draft
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSubmit(false)}
            disabled={isSubmitting}
            className="flex-1 py-3 rounded-lg font-medium text-sm text-white flex items-center justify-center gap-2"
            style={{ backgroundColor: "var(--color-primary)" }}
          >
            {isSubmitting ? (
              <motion.div
                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            ) : (
              <>
                <FiSave size={16} />
                Save
              </>
            )}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ProductCreate;
