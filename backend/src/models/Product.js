import mongoose from "mongoose";

/**
 * Product schema: name, slug, pricing (price/originalPrice/discount/finalPrice),
 * category path for filtering, variants, status. Used by productController and API.
 */
const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    shortDescription: { type: String, default: "" },
    description: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 }, // selling price (same as finalPrice when discount set)
    originalPrice: { type: Number, min: 0, default: null },
    discount: { type: Number, min: 0, max: 100, default: 0 }, // percentage 0-100
    finalPrice: { type: Number, min: 0, default: null }, // originalPrice - (originalPrice * discount / 100)
    category: { type: String, default: "" }, // full path e.g. "Male > Winter Wear > Jackets > Leather Jacket"
    categoryPath: [{ type: String }], // parsed path for filtering e.g. ["Male", "Winter Wear", "Jackets", "Leather Jacket"]
    collections: [{ type: String }],
    /** Single collection for filtering. Values: regular | new-arrivals | campaigns (featured kept for backward compat) */
    collection: {
      type: String,
      enum: ["regular", "new-arrivals", "featured", "campaigns"],
      default: "regular",
    },
    /** When set, product is in this campaign; discount/originalPrice/finalPrice are driven by campaign. */
    campaign: { type: mongoose.Schema.Types.ObjectId, ref: "Campaign", default: null },
    tags: [{ type: String }],
    /** Legacy: flat lists of size/color names. Kept for backward compat. */
    variants: {
      size: [{ type: String }],
      color: [{ type: String }],
    },
    /** Per-variant stock: each entry is size + color + stock. Total stockQuantity derived from this when set. */
    variantMatrix: [
      {
        size: { type: String, required: true },
        color: { type: String, required: true },
        colorHex: { type: String, default: "" },
        stock: { type: Number, required: true, min: 0 },
      },
    ],
    stockQuantity: { type: Number, default: 0, min: 0 },
    isFeatured: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["active", "draft"],
      default: "draft",
    },
    images: [{ type: String }],
    sku: { type: String, default: "" },
    /** Product attributes for detail page bullet lists */
    attributes: {
      composition: [{ type: String }],
      sizeAndFit: [{ type: String }],
      care: [{ type: String }],
      traceability: [{ type: String }],
    },
  },
  { timestamps: true }
);

// slug already has unique: true (creates index); avoid duplicate
productSchema.index({ status: 1 });
productSchema.index({ campaign: 1 });

export default mongoose.model("Product", productSchema);
