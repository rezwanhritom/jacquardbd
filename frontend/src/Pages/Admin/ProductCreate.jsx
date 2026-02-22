import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiChevronRight,
  FiSave,
  FiX,
  FiPackage,
  FiImage,
  FiCreditCard,
  FiGrid,
  FiTag,
  FiEye,
  FiInfo,
  FiAlertCircle,
  FiList,
} from "react-icons/fi";
import { ImageUpload, TagInput, CascadingCategorySelect } from "../../components/Admin";
import { fadeInUp, staggerContainer } from "../../utils/animations";
import toast from "react-hot-toast";
import { createProduct as createProductApi, uploadProductImages as uploadProductImagesApi } from "../../services/productApi";
import { categoryTree } from "../../data/categoryTree";

const availableSizes = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];

/** Preset colors for quick pick (name, hex). Picker auto-fills hex; name can be edited. */
const presetColors = [
  { name: "Black", hex: "#000000" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Navy", hex: "#1e3a5f" },
  { name: "Red", hex: "#c41e3a" },
  { name: "Burgundy", hex: "#800020" },
  { name: "Gray", hex: "#6b7280" },
  { name: "Charcoal", hex: "#36454f" },
  { name: "Beige", hex: "#f5f5dc" },
  { name: "Brown", hex: "#8b4513" },
  { name: "Olive", hex: "#808000" },
  { name: "Blue", hex: "#2563eb" },
  { name: "Sky Blue", hex: "#0ea5e9" },
  { name: "Green", hex: "#16a34a" },
  { name: "Mustard", hex: "#e4a853" },
  { name: "Pink", hex: "#ec4899" },
  { name: "Purple", hex: "#7c3aed" },
  { name: "Orange", hex: "#ea580c" },
  { name: "Yellow", hex: "#eab308" },
];

/** Single collection for filtering. Values match backend enum. */
const collectionOptions = [
  { value: "regular", label: "Regular" },
  { value: "new-arrivals", label: "New Arrivals" },
  { value: "sale", label: "Sale" },
  { value: "campaigns", label: "Campaigns" },
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
    variantMatrix: [], // [{ size, color, colorHex, stock }]
    category: "",
    collection: "regular",
    collections: [],
    tags: [],
    isActive: true,
    isFeatured: false,
    attributes: {
      composition: "",
      sizeAndFit: "",
      care: "",
      traceability: "",
    },
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

  const addVariantRow = () => {
    setFormData((prev) => ({
      ...prev,
      variantMatrix: [...prev.variantMatrix, { size: "", color: "", colorHex: "", stock: 0 }],
    }));
  };

  const updateVariantRow = (index, field, value) => {
    setFormData((prev) => {
      const next = [...prev.variantMatrix];
      if (!next[index]) return prev;
      next[index] = { ...next[index], [field]: value };
      return { ...prev, variantMatrix: next };
    });
  };

  const setVariantRowPreset = (index, preset, currentColorName) => {
    setFormData((prev) => {
      const next = [...prev.variantMatrix];
      if (!next[index]) return prev;
      next[index] = {
        ...next[index],
        colorHex: preset.hex,
        color: currentColorName?.trim() ? next[index].color : preset.name,
      };
      return { ...prev, variantMatrix: next };
    });
  };

  const removeVariantRow = (index) => {
    setFormData((prev) => ({
      ...prev,
      variantMatrix: prev.variantMatrix.filter((_, i) => i !== index),
    }));
  };

  const handleCollectionChange = (e) => {
    setFormData((prev) => ({ ...prev, collection: e.target.value }));
  };

  // Final price = Original Price - (Original Price * Discount / 100)
  const finalPrice = useMemo(() => {
    const original = parseFloat(formData.originalPrice);
    const discountPct = parseFloat(formData.discount) || 0;
    if (Number.isNaN(original) || original < 0) return null;
    const value = original * (1 - discountPct / 100);
    return Math.round(value * 100) / 100;
  }, [formData.originalPrice, formData.discount]);

  // Stock status from variant matrix (for display only)
  const totalStock = useMemo(
    () => formData.variantMatrix.reduce((sum, row) => sum + (Number(row.stock) || 0), 0),
    [formData.variantMatrix]
  );
  const stockStatus = useMemo(() => {
    if (totalStock === 0) return { label: "Out of Stock", color: "var(--color-tertiary)" };
    if (totalStock <= 10) return { label: "Low Stock", color: "#f59e0b" };
    return { label: "In Stock", color: "var(--color-secondary)" };
  }, [totalStock]);

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
    collection: formData.collection || "regular",
    collections: formData.collections,
    tags: formData.tags,
    variantMatrix: formData.variantMatrix
      .filter((r) => (r.size || r.color) && (Number(r.stock) || 0) >= 0)
      .map((r) => ({
        size: String(r.size || "").trim(),
        color: String(r.color || "").trim(),
        colorHex: String(r.colorHex || "").trim(),
        stock: Math.max(0, Number(r.stock) || 0),
      })),
    isFeatured: formData.isFeatured,
    status: isDraft ? "draft" : formData.isActive ? "active" : "draft",
    sku: formData.sku.trim() || undefined,
    attributes: {
      composition: formData.attributes.composition.trim() ? formData.attributes.composition.trim().split("\n").map((s) => s.trim()).filter(Boolean) : [],
      sizeAndFit: formData.attributes.sizeAndFit.trim() ? formData.attributes.sizeAndFit.trim().split("\n").map((s) => s.trim()).filter(Boolean) : [],
      care: formData.attributes.care.trim() ? formData.attributes.care.trim().split("\n").map((s) => s.trim()).filter(Boolean) : [],
      traceability: formData.attributes.traceability.trim() ? formData.attributes.traceability.trim().split("\n").map((s) => s.trim()).filter(Boolean) : [],
    },
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

    if (!result.success) {
      setIsSubmitting(false);
      const msg = result.errors?.length ? result.errors.join(". ") : result.message;
      if (msg?.toLowerCase().includes("authorized") || msg?.toLowerCase().includes("forbidden")) {
        toast.error("Please log in as admin and try again.");
      } else {
        toast.error(msg || "Failed to create product");
      }
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
      return;
    }

    const productId = result.product?._id;
    const filesToUpload = images.filter((img) => img?.file instanceof File).map((img) => img.file);

    if (productId && filesToUpload.length > 0) {
      const uploadResult = await uploadProductImagesApi(productId, filesToUpload);
      if (!uploadResult.success) {
        const um = uploadResult.message || "";
        if (um.toLowerCase().includes("authorized") || um.toLowerCase().includes("forbidden")) {
          toast.error("Please log in as admin to upload images.");
        } else {
          toast.error(um || "Product created but image upload failed");
        }
      } else {
        toast.success(isDraft ? "Draft saved successfully!" : "Product created successfully!");
      }
    } else {
      toast.success(isDraft ? "Draft saved successfully!" : "Product created successfully!");
    }

    setIsSubmitting(false);
    if (!isDraft) {
      navigate("/admin/products");
    }
  };

  const sections = [
    { id: "basic", label: "Basic Info", icon: FiPackage },
    { id: "media", label: "Media", icon: FiImage },
    { id: "pricing", label: "Pricing", icon: FiCreditCard },
    { id: "variants", label: "Variants", icon: FiGrid },
    { id: "attributes", label: "Attributes", icon: FiList },
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

          {/* Pricing */}
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
                <FiCreditCard size={20} style={{ color: "var(--color-primary)" }} />
              </div>
              <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                Pricing
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Original Price */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>
                  Original Price (৳) <span style={{ color: "var(--color-tertiary)" }}>*</span>
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
                  Final Price (৳)
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
            </div>
          </motion.section>

          {/* Variants (size × color × stock) */}
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
                Variants
              </h2>
            </div>
            <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
              Add each size–color combination with its stock. Stock status is calculated from the total below.
            </p>
            <div className="space-y-3">
              {formData.variantMatrix.map((row, index) => (
                <div
                  key={index}
                  className="p-3 rounded-lg border space-y-2"
                  style={{ borderColor: "var(--border-primary)", backgroundColor: "var(--bg-secondary)" }}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={row.size}
                      onChange={(e) => updateVariantRow(index, "size", e.target.value)}
                      className="px-3 py-2 rounded-lg border-2 text-sm"
                      style={{
                        borderColor: "var(--border-primary)",
                        backgroundColor: "var(--bg-primary)",
                        color: "var(--text-primary)",
                      }}
                    >
                      <option value="">Size</option>
                      {availableSizes.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={row.color}
                      onChange={(e) => updateVariantRow(index, "color", e.target.value)}
                      placeholder="Color name"
                      className="w-28 px-3 py-2 rounded-lg border-2 text-sm"
                      style={{
                        borderColor: "var(--border-primary)",
                        backgroundColor: "var(--bg-primary)",
                        color: "var(--text-primary)",
                      }}
                    />
                    <div className="flex items-center gap-1" title="Pick color – auto-fills hex">
                      <input
                        type="color"
                        value={row.colorHex && /^#[0-9A-Fa-f]{6}$/.test(row.colorHex) ? row.colorHex : "#000000"}
                        onChange={(e) => updateVariantRow(index, "colorHex", e.target.value)}
                        title="Pick color"
                        className="w-9 h-9 rounded-lg border-2 cursor-pointer p-0"
                        style={{ borderColor: "var(--border-primary)" }}
                      />
                      <input
                        type="text"
                        value={row.colorHex}
                        onChange={(e) => updateVariantRow(index, "colorHex", e.target.value)}
                        placeholder="#hex (auto from picker)"
                        className="w-24 px-2 py-2 rounded-lg border-2 text-sm font-mono"
                        style={{
                          borderColor: "var(--border-primary)",
                          backgroundColor: "var(--bg-primary)",
                          color: "var(--text-primary)",
                        }}
                      />
                    </div>
                    <input
                      type="number"
                      min="0"
                      value={row.stock}
                      onChange={(e) => updateVariantRow(index, "stock", e.target.value)}
                      placeholder="Stock"
                      className="w-20 px-3 py-2 rounded-lg border-2 text-sm"
                      style={{
                        borderColor: "var(--border-primary)",
                        backgroundColor: "var(--bg-primary)",
                        color: "var(--text-primary)",
                      }}
                    />
                    <motion.button
                      type="button"
                      onClick={() => removeVariantRow(index)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2 rounded-lg"
                      style={{ color: "var(--color-tertiary)" }}
                    >
                      <FiX size={18} />
                    </motion.button>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>Quick pick:</span>
                    {presetColors.map((preset) => (
                      <button
                        key={preset.hex}
                        type="button"
                        title={`${preset.name} ${preset.hex}`}
                        className="w-6 h-6 rounded-full border-2 shrink-0 focus:outline-none focus:ring-2 focus:ring-offset-1"
                        style={{
                          backgroundColor: preset.hex,
                          borderColor: (row.colorHex || "").toUpperCase() === preset.hex.toUpperCase() ? "var(--color-primary)" : "var(--border-primary)",
                        }}
                        onClick={() => setVariantRowPreset(index, preset, row.color)}
                      />
                    ))}
                  </div>
                </div>
              ))}
              <motion.button
                type="button"
                onClick={addVariantRow}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 rounded-lg border-2 border-dashed font-medium text-sm"
                style={{
                  borderColor: "var(--border-primary)",
                  color: "var(--text-secondary)",
                }}
              >
                + Add variant (size + color + stock)
              </motion.button>
            </div>
            {formData.variantMatrix.length > 0 && (
              <div className="mt-4 pt-4 border-t flex items-center gap-2" style={{ borderColor: "var(--border-primary)" }}>
                <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Total stock:</span>
                <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{totalStock}</span>
                <span
                  className="px-2 py-0.5 text-xs font-semibold rounded"
                  style={{ backgroundColor: stockStatus.color + "20", color: stockStatus.color }}
                >
                  {stockStatus.label}
                </span>
              </div>
            )}
          </motion.section>

          {/* Attributes (composition, size & fit, care, traceability) */}
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
                <FiList size={20} style={{ color: "var(--color-primary)" }} />
              </div>
              <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                Attributes
              </h2>
            </div>
            <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
              One line per bullet. Shown on the product page under COMPOSITION, SIZE &amp; FIT, CARE, and TRACEABILITY.
            </p>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>
                  COMPOSITION
                </label>
                <textarea
                  value={formData.attributes.composition}
                  onChange={(e) => setFormData((prev) => ({
                    ...prev,
                    attributes: { ...prev.attributes, composition: e.target.value },
                  }))}
                  placeholder={"Outer: 65% Cotton\n30% Polyester\nInner: Brushed thermal lining"}
                  rows={4}
                  className="w-full px-4 py-3 border-2 rounded-lg outline-none resize-none text-sm"
                  style={{
                    borderColor: "var(--border-primary)",
                    backgroundColor: "var(--bg-primary)",
                    color: "var(--text-primary)",
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>
                  SIZE &amp; FIT
                </label>
                <textarea
                  value={formData.attributes.sizeAndFit}
                  onChange={(e) => setFormData((prev) => ({
                    ...prev,
                    attributes: { ...prev.attributes, sizeAndFit: e.target.value },
                  }))}
                  placeholder={"Regular fit\nTrue to size\nComfortable stretch for ease of movement"}
                  rows={3}
                  className="w-full px-4 py-3 border-2 rounded-lg outline-none resize-none text-sm"
                  style={{
                    borderColor: "var(--border-primary)",
                    backgroundColor: "var(--bg-primary)",
                    color: "var(--text-primary)",
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>
                  CARE
                </label>
                <textarea
                  value={formData.attributes.care}
                  onChange={(e) => setFormData((prev) => ({
                    ...prev,
                    attributes: { ...prev.attributes, care: e.target.value },
                  }))}
                  placeholder={"Machine wash at 30°C\nWash inside out with similar colours\nDo not bleach"}
                  rows={4}
                  className="w-full px-4 py-3 border-2 rounded-lg outline-none resize-none text-sm"
                  style={{
                    borderColor: "var(--border-primary)",
                    backgroundColor: "var(--bg-primary)",
                    color: "var(--text-primary)",
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>
                  TRACEABILITY
                </label>
                <textarea
                  value={formData.attributes.traceability}
                  onChange={(e) => setFormData((prev) => ({
                    ...prev,
                    attributes: { ...prev.attributes, traceability: e.target.value },
                  }))}
                  placeholder={"Fabric sourced from responsibly selected suppliers\nManufactured in ethically audited facilities"}
                  rows={3}
                  className="w-full px-4 py-3 border-2 rounded-lg outline-none resize-none text-sm"
                  style={{
                    borderColor: "var(--border-primary)",
                    backgroundColor: "var(--bg-primary)",
                    color: "var(--text-primary)",
                  }}
                />
              </div>
            </div>
          </motion.section>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Organization */}
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

              {/* Collection (for New Arrivals / Sale / Featured filtering) */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>
                  Collection
                </label>
                <select
                  name="collection"
                  value={formData.collection}
                  onChange={handleCollectionChange}
                  className="w-full max-w-xs px-4 py-2.5 rounded-lg border-2 text-sm font-medium transition-colors"
                  style={{
                    borderColor: "var(--border-primary)",
                    backgroundColor: "var(--bg-primary)",
                    color: "var(--text-primary)",
                  }}
                >
                  {collectionOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>
                  e.g. &quot;New Arrivals&quot; shows this product on /new-arrivals
                </p>
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
