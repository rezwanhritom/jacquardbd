import { DEFAULT_PRODUCT_IMAGE_URL } from "../constants/defaults.js";
import { resolveSellingPrice } from "./priceUtils.js";

const BRAND = "JACQUARD";
const DEFAULT_CURRENCY = "BDT";
const GOOGLE_PRODUCT_CATEGORY = "Apparel & Accessories > Clothing";

/**
 * Escape text for XML element content.
 */
export function escapeXml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function stripHtml(text) {
  return String(text ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeBaseUrl(url) {
  return String(url || "").replace(/\/$/, "");
}

function resolveImageUrl(image, frontendBase) {
  const src = image || DEFAULT_PRODUCT_IMAGE_URL;
  if (/^https?:\/\//i.test(src)) return src;
  return `${frontendBase}${src.startsWith("/") ? src : `/${src}`}`;
}

function resolveSellingAmount(product) {
  const original = product.originalPrice ?? product.price;
  const discount = product.discount ?? 0;
  const selling =
    product.finalPrice ??
    product.price ??
    resolveSellingPrice(original, discount);
  return {
    selling: Number(selling) || 0,
    original: Number(original) || Number(selling) || 0,
    onSale: discount > 0 && Number(original) > Number(selling),
  };
}

function resolveGender(categoryPath = []) {
  const root = String(categoryPath[0] || "").toLowerCase();
  if (root === "male") return "male";
  if (root === "female") return "female";
  return "unisex";
}

function buildDescription(product) {
  const text = stripHtml(product.description || product.shortDescription || product.name);
  return text.slice(0, 5000) || product.name;
}

function buildProductType(product) {
  if (Array.isArray(product.categoryPath) && product.categoryPath.length > 0) {
    return product.categoryPath.join(" > ");
  }
  return product.category || "Clothing";
}

function variantId(product, variant) {
  const base = product.sku || product.slug || product._id?.toString();
  const size = variant?.size ? `-${variant.size}` : "";
  const color = variant?.color ? `-${variant.color.replace(/\s+/g, "-")}` : "";
  return `${base}${size}${color}`.slice(0, 100);
}

function variantTitle(product, variant) {
  const parts = [product.name];
  if (variant?.color) parts.push(variant.color);
  if (variant?.size) parts.push(`Size ${variant.size}`);
  return parts.join(" - ").slice(0, 150);
}

function xmlElement(name, value, { cdata = false } = {}) {
  if (value == null || value === "") return "";
  if (cdata) {
    const safe = String(value).replace(/]]>/g, "]]]]><![CDATA[>");
    return `<${name}><![CDATA[${safe}]]></${name}>`;
  }
  return `<${name}>${escapeXml(value)}</${name}>`;
}

function googleElement(name, value, options) {
  return xmlElement(`g:${name}`, value, options);
}

/**
 * Expand one product into feed rows (one per variant, or one for the whole product).
 */
export function productToFeedItems(product, { frontendBase, currency = DEFAULT_CURRENCY }) {
  const groupId = product._id?.toString() || product.slug;
  const link = `${frontendBase}/product/${encodeURIComponent(product.slug || groupId)}`;
  const imageLink = resolveImageUrl(product.images?.[0], frontendBase);
  const additionalImages = (product.images || [])
    .slice(1, 11)
    .map((img) => resolveImageUrl(img, frontendBase));
  const { selling, original, onSale } = resolveSellingAmount(product);
  const priceStr = `${original.toFixed(2)} ${currency}`;
  const salePriceStr = onSale ? `${selling.toFixed(2)} ${currency}` : null;
  const description = buildDescription(product);
  const productType = buildProductType(product);
  const gender = resolveGender(product.categoryPath);

  const baseFields = {
    link,
    imageLink,
    additionalImages,
    priceStr,
    salePriceStr,
    description,
    productType,
    gender,
    groupId,
    brand: BRAND,
    condition: "new",
  };

  const matrix = Array.isArray(product.variantMatrix) ? product.variantMatrix.filter(Boolean) : [];

  if (matrix.length > 0) {
    return matrix.map((variant) => ({
      ...baseFields,
      id: variantId(product, variant),
      title: variantTitle(product, variant),
      availability: variant.stock > 0 ? "in stock" : "out of stock",
      color: variant.color || undefined,
      size: variant.size || undefined,
    }));
  }

  const stock = Number(product.stockQuantity) || 0;
  return [
    {
      ...baseFields,
      id: (product.sku || product.slug || groupId).slice(0, 100),
      title: product.name.slice(0, 150),
      availability: stock > 0 ? "in stock" : "out of stock",
      color: product.variants?.color?.[0] || undefined,
      size: product.variants?.size?.[0] || undefined,
    },
  ];
}

function itemToXml(item) {
  const lines = [
    "    <item>",
    googleElement("id", item.id),
    googleElement("title", item.title, { cdata: true }),
    googleElement("description", item.description, { cdata: true }),
    googleElement("link", item.link),
    googleElement("image_link", item.imageLink),
    ...item.additionalImages.map((url) => googleElement("additional_image_link", url)),
    googleElement("availability", item.availability),
    googleElement("price", item.priceStr),
    item.salePriceStr ? googleElement("sale_price", item.salePriceStr) : "",
    googleElement("condition", item.condition),
    googleElement("brand", item.brand),
    googleElement("google_product_category", GOOGLE_PRODUCT_CATEGORY),
    googleElement("product_type", item.productType, { cdata: true }),
    googleElement("item_group_id", item.groupId),
    googleElement("gender", item.gender),
    item.color ? googleElement("color", item.color) : "",
    item.size ? googleElement("size", item.size) : "",
    googleElement("identifier_exists", "no"),
    "    </item>",
  ];
  return lines.filter(Boolean).join("\n");
}

/**
 * Build RSS 2.0 XML with Google namespace (Google Merchant + Meta catalog compatible).
 */
export function buildProductFeedXml(items, { frontendBase, storeName = BRAND }) {
  const channelTitle = `${storeName} Product Feed`;
  const itemXml = items.map(itemToXml).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${escapeXml(channelTitle)}</title>
    <link>${escapeXml(frontendBase)}</link>
    <description>${escapeXml(`${storeName} product catalog for Google and Meta ads`)}</description>
${itemXml}
  </channel>
</rss>
`;
}

export function getFeedConfig() {
  const frontendBase = normalizeBaseUrl(process.env.FRONTEND_URL || "http://localhost:5173");
  const currency = (process.env.FEED_CURRENCY || DEFAULT_CURRENCY).toUpperCase();
  const storeName = process.env.FEED_STORE_NAME || BRAND;
  return { frontendBase, currency, storeName };
}
