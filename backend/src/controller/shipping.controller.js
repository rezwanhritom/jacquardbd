import ShippingConfig, { findOrCreateShippingConfig, getDefaultOptions } from "../models/ShippingConfig.js";

/**
 * GET /api/shipping
 * Public. Returns shipping options (from DB or default).
 */
export async function getShipping(req, res, next) {
  try {
    const doc = await findOrCreateShippingConfig();
    const options = Array.isArray(doc.options) ? doc.options : await getDefaultOptions();
    options.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    res.json({ success: true, options });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/shipping
 * Admin only. Body: { options: [{ id, name, price?, description?, priceLabel?, order? }] }
 */
export async function updateShipping(req, res, next) {
  try {
    const { options } = req.body || {};
    if (!Array.isArray(options)) {
      return res.status(400).json({ success: false, message: "options must be an array" });
    }
    const normalized = options.map((o, i) => ({
      id: String(o.id || "").trim() || `option-${i}`,
      name: String(o.name || "").trim() || "Shipping",
      price: o.price != null && typeof o.price === "number" ? o.price : null,
      description: String(o.description ?? "").trim(),
      priceLabel: String(o.priceLabel ?? "").trim(),
      order: typeof o.order === "number" ? o.order : i,
    }));
    let doc = await ShippingConfig.findOne();
    if (!doc) {
      await ShippingConfig.create({ options: normalized });
    } else {
      doc.options = normalized;
      await doc.save();
    }
    const updated = await ShippingConfig.findOne().lean();
    const resultOptions = updated?.options ?? normalized;
    resultOptions.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    res.json({ success: true, options: resultOptions });
  } catch (err) {
    next(err);
  }
}
