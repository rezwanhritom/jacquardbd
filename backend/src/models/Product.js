import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    shortDescription: { type: String, default: "" },
    description: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, min: 0, default: null },
    category: { type: String, default: "" },
    collections: [{ type: String }],
    tags: [{ type: String }],
    variants: {
      size: [{ type: String }],
      color: [{ type: String }],
    },
    stockQuantity: { type: Number, default: 0, min: 0 },
    isFeatured: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["active", "draft"],
      default: "draft",
    },
    images: [{ type: String }],
    // Optional fields for future use (e.g. SKU, material, fit)
    sku: { type: String, default: "" },
    material: { type: String, default: "" },
    fit: { type: String, default: "" },
  },
  { timestamps: true }
);

// slug already has unique: true (creates index); avoid duplicate
productSchema.index({ status: 1 });

export default mongoose.model("Product", productSchema);
