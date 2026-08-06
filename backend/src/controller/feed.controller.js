import Product from "../models/Product.js";
import {
  buildProductFeedXml,
  getFeedConfig,
  productToFeedItems,
} from "../utils/productFeed.js";

/**
 * GET /api/feed/products.xml
 * Public RSS/XML product catalog for Google Merchant Center and Meta catalog ads.
 */
export async function getProductFeed(req, res, next) {
  try {
    const config = getFeedConfig();
    const products = await Product.find({ status: "active" })
      .select(
        "name slug shortDescription description price originalPrice discount finalPrice category categoryPath images sku stockQuantity variantMatrix variants"
      )
      .lean()
      .sort({ updatedAt: -1 });

    const items = products.flatMap((product) => productToFeedItems(product, config));
    const xml = buildProductFeedXml(items, config);

    res.set("Content-Type", "application/xml; charset=utf-8");
    res.set("Cache-Control", "public, max-age=3600");
    res.send(xml);
  } catch (err) {
    next(err);
  }
}
