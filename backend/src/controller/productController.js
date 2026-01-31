import Product from "../models/Product.js";
import { slugify } from "../utils/slugify.js";
import { validateProductBody } from "../utils/productValidation.js";
import { parseOriginalPrice, parseDiscount, computeFinalPrice, resolveSellingPrice } from "../utils/priceUtils.js";
import { parseCategoryPath } from "../utils/categoryUtils.js";
import { DEFAULT_PRODUCT_IMAGE_URL } from "../constants/defaults.js";

const MONGO_ID_REGEX = /^[a-fA-F0-9]{24}$/;

/**
 * GET /api/products/:identifier
 * Fetch a single product by slug or by MongoDB _id.
 */
export async function getProductById(req, res, next) {
  try {
    const { identifier } = req.params;
    if (!identifier) {
      return res.status(400).json({ success: false, message: "Product identifier required" });
    }

    const isMongoId = MONGO_ID_REGEX.test(identifier);
    const product = isMongoId
      ? await Product.findById(identifier).lean()
      : await Product.findOne({ slug: identifier, status: "active" }).lean();

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, product });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/products?gender=men|women
 * Returns active products filtered by categoryPath[0] (Male = men, Female = women).
 */
export async function getProducts(req, res, next) {
  try {
    const gender = (req.query.gender || "").toLowerCase();
    const filter = { status: "active" };

    if (gender === "men") filter["categoryPath.0"] = "Male";
    else if (gender === "women") filter["categoryPath.0"] = "Female";

    const products = await Product.find(filter).lean().sort({ createdAt: -1 });
    res.json({ success: true, products });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/products
 * Validate body, compute slug/price/categoryPath, save product. Default image used until upload flow exists.
 */
export async function createProduct(req, res, next) {
  try {
    const body = req.body;
    const validation = validateProductBody(body);
    if (!validation.valid) {
      const err = new Error("Validation failed");
      err.statusCode = 400;
      err.errors = validation.errors;
      return next(err);
    }

    const name = (body.name || "").trim();
    let slug = slugify(name);
    if (!slug) {
      const err = new Error("Validation failed");
      err.statusCode = 400;
      err.errors = ["Product name must contain at least one alphanumeric character"];
      return next(err);
    }

    const existing = await Product.findOne({ slug });
    if (existing) slug = `${slug}-${Date.now()}`;

    const originalPrice = parseOriginalPrice(body.originalPrice);
    const discount = parseDiscount(body.discount);
    const finalPrice = computeFinalPrice(originalPrice, discount);
    const price = resolveSellingPrice(originalPrice, discount);

    const categoryStr = (body.category || "").trim();
    const categoryPath = parseCategoryPath(categoryStr);

    const product = new Product({
      name,
      slug,
      shortDescription: (body.shortDescription || "").trim(),
      description: (body.description || "").trim(),
      price,
      originalPrice,
      discount,
      finalPrice: finalPrice != null ? finalPrice : undefined,
      category: categoryStr,
      categoryPath,
      collections: Array.isArray(body.collections) ? body.collections : [],
      tags: Array.isArray(body.tags) ? body.tags : [],
      variants: {
        size: Array.isArray(body.variants?.size) ? body.variants.size : [],
        color: Array.isArray(body.variants?.color) ? body.variants.color : [],
      },
      stockQuantity: Number(body.stockQuantity) || 0,
      isFeatured: Boolean(body.isFeatured),
      status: body.status === "active" ? "active" : "draft",
      images: [DEFAULT_PRODUCT_IMAGE_URL],
      sku: (body.sku || "").trim(),
      material: (body.material || "").trim(),
      fit: (body.fit || "").trim(),
    });

    await product.save();

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (err) {
    next(err);
  }
}
