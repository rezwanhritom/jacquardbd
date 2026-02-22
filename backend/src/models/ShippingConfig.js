import mongoose from "mongoose";

const shippingOptionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    price: { type: Number, default: null },
    description: { type: String, trim: true, default: "" },
    priceLabel: { type: String, trim: true, default: "" },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

const shippingConfigSchema = new mongoose.Schema(
  {
    options: [shippingOptionSchema],
  },
  { timestamps: true }
);

const DEFAULT_OPTIONS = [
  { id: "standard", name: "Standard Shipping", price: 60, description: "5-7 business days", priceLabel: "", order: 0 },
  { id: "express", name: "Express Shipping", price: 100, description: "2-3 business days", priceLabel: "", order: 1 },
  { id: "overnight", name: "Overnight Shipping", price: null, description: "Only available in Dhaka", priceLabel: "Based on distance", order: 2 },
];

export async function getDefaultOptions() {
  return DEFAULT_OPTIONS.map((o) => ({ ...o }));
}

const ShippingConfig = mongoose.model("ShippingConfig", shippingConfigSchema);

export async function findOrCreateShippingConfig() {
  let doc = await ShippingConfig.findOne().lean();
  if (!doc || !Array.isArray(doc.options) || doc.options.length === 0) {
    if (!doc) {
      await ShippingConfig.create({ options: DEFAULT_OPTIONS });
    } else {
      await ShippingConfig.updateOne({ _id: doc._id }, { $set: { options: DEFAULT_OPTIONS } });
    }
    doc = await ShippingConfig.findOne().lean();
  }
  return doc;
}

export default ShippingConfig;
