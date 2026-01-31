import Product from "../models/Product.js";
import { slugify } from "../utils/slugify.js";
import { validateProductBody } from "../utils/productValidation.js";
import { DEFAULT_PRODUCT_IMAGE_URL } from "../constants/defaults.js";

/**
 * POST /api/products
 * Accept JSON body, validate, generate slug, assign default image, save to MongoDB.
 * Ready to extend later with Multer/Cloudinary/multiple images.
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

    // Ensure unique slug (future: could append id or random suffix)
    const existing = await Product.findOne({ slug });
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    const price = Number(body.price);
    const originalPrice =
      body.originalPrice !== undefined && body.originalPrice !== ""
        ? Number(body.originalPrice)
        : null;
    const stockQuantity = Number(body.stockQuantity) || 0;
    const status = body.status === "active" ? "active" : "draft";
    const isFeatured = Boolean(body.isFeatured);
    const collections = Array.isArray(body.collections) ? body.collections : [];
    const tags = Array.isArray(body.tags) ? body.tags : [];
    const variants = {
      size: Array.isArray(body.variants?.size) ? body.variants.size : [],
      color: Array.isArray(body.variants?.color) ? body.variants.color : [],
    };

    const product = new Product({
      name,
      slug,
      shortDescription: (body.shortDescription || "").trim(),
      description: (body.description || "").trim(),
      price,
      originalPrice,
      category: (body.category || "").trim(),
      collections,
      tags,
      variants,
      stockQuantity,
      isFeatured,
      status,
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
