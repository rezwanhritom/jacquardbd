import Product from "../models/Product.js";
import Campaign from "../models/Campaign.js";
import Order from "../models/Order.js";
import { PAYMENT_STATUS } from "../models/Order.js";
import { slugify } from "../utils/slugify.js";
import { validateProductBody } from "../utils/productValidation.js";
import { parseOriginalPrice, parseDiscount, computeFinalPrice, resolveSellingPrice } from "../utils/priceUtils.js";
import { parseCategoryPath } from "../utils/categoryUtils.js";
import { DEFAULT_PRODUCT_IMAGE_URL } from "../constants/defaults.js";
import { applyCampaignToProduct, removeCampaignFromProduct } from "../utils/campaignProductSync.js";

const MONGO_ID_REGEX = /^[a-fA-F0-9]{24}$/;
const ALLOWED_COLLECTIONS = ["regular", "new-arrivals", "featured", "campaigns"];

/**
 * GET /api/products/home
 * Public. Returns { newArrivals: latest 4 products, bestSellers: top 2 by quantity sold or latest 2 }.
 */
export async function getHomeProducts(req, res, next) {
  try {
    const latest = await Product.find({ status: "active" })
      .populate("campaign", "name")
      .lean()
      .sort({ createdAt: -1 })
      .limit(4);
    const newArrivals = latest.map((p) => ({
      ...p,
      campaignName: p.campaign?.name ?? null,
    }));

    const topByQuantity = await Order.aggregate([
      { $match: { $or: [{ paymentStatus: PAYMENT_STATUS.PAID }, { status: "paid" }] } },
      { $unwind: "$items" },
      { $group: { _id: "$items.productId", quantitySold: { $sum: "$items.quantity" } } },
      { $sort: { quantitySold: -1 } },
      { $limit: 2 },
    ]);
    const topIds = topByQuantity.map((t) => t._id).filter(Boolean);
    let bestSellers = [];
    if (topIds.length > 0) {
      const soldProducts = await Product.find({ _id: { $in: topIds }, status: "active" })
        .populate("campaign", "name")
        .lean();
      const order = topIds.map((id) => soldProducts.find((p) => p._id.toString() === id.toString())).filter(Boolean);
      bestSellers = order.map((p) => ({ ...p, campaignName: p.campaign?.name ?? null }));
    }
    if (bestSellers.length < 2) {
      const need = 2 - bestSellers.length;
      const excludeIds = bestSellers.map((p) => p._id);
      const fill = await Product.find({
        status: "active",
        _id: { $nin: excludeIds },
      })
        .populate("campaign", "name")
        .lean()
        .sort({ createdAt: -1 })
        .limit(need);
      bestSellers = [...bestSellers, ...fill.map((p) => ({ ...p, campaignName: p.campaign?.name ?? null }))];
    }
    res.json({ success: true, newArrivals, bestSellers });
  } catch (err) {
    next(err);
  }
}

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
    let product = isMongoId
      ? await Product.findById(identifier).populate("campaign", "name").lean()
      : await Product.findOne({ slug: identifier, status: "active" }).populate("campaign", "name").lean();

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    const campaignName = product.campaign?.name ?? null;
    if (campaignName) product = { ...product, campaignName };

    res.json({ success: true, product });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/products/collection/:collectionName
 * Returns active products where collection matches. Sorted by createdAt desc.
 * For "new-arrivals", only products created in the last 30 days are returned.
 */
export async function getProductsByCollection(req, res, next) {
  try {
    const collectionName = (req.params.collectionName || "").toLowerCase().replace(/\s+/g, "-");
    if (!ALLOWED_COLLECTIONS.includes(collectionName)) {
      return res.status(400).json({
        success: false,
        message: "Invalid collection name",
        allowed: ALLOWED_COLLECTIONS,
      });
    }
    const collectionFilter = collectionName === "campaigns"
      ? "campaigns"
      : collectionName;
    const filter = { status: "active", collection: collectionFilter };
    if (collectionName === "new-arrivals") {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      filter.createdAt = { $gte: thirtyDaysAgo };
    }
    let products = await Product.find(filter).populate("campaign", "name").lean().sort({ createdAt: -1 });
    if (collectionName === "campaigns") {
      products = products.map((p) => ({ ...p, campaignName: p.campaign?.name ?? null }));
    }
    res.json({ success: true, products });
  } catch (err) {
    next(err);
  }
}

/** Slugify for matching: lowercase, spaces to hyphens. */
function toSlug(s) {
  if (s == null || typeof s !== "string") return "";
  return s.trim().toLowerCase().replace(/\s+/g, "-");
}

/**
 * GET /api/products?gender=men|women&section=winter-wear&subcategory=sweatshirts
 * Returns active products by gender; optional section and/or subcategory filter by categoryPath[1] and [2].
 */
export async function getProducts(req, res, next) {
  try {
    const gender = (req.query.gender || "").toLowerCase();
    const sectionSlug = (req.query.section || "").toLowerCase().replace(/\s+/g, "-");
    const subcategorySlug = (req.query.subcategory || "").toLowerCase().replace(/\s+/g, "-");

    const filter = { status: "active" };
    if (gender === "men") filter["categoryPath.0"] = "Male";
    else if (gender === "women") filter["categoryPath.0"] = "Female";

    let products = await Product.find(filter).populate("campaign", "name").lean().sort({ createdAt: -1 });
    products = products.map((p) => ({ ...p, campaignName: p.campaign?.name ?? null }));

    if (sectionSlug || subcategorySlug) {
      products = products.filter((p) => {
        const path = p.categoryPath || [];
        const pSection = path[1];
        const pSub = path[2];
        if (sectionSlug && toSlug(pSection) !== sectionSlug) return false;
        if (subcategorySlug && toSlug(pSub) !== subcategorySlug) return false;
        return true;
      });
    }

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

    const collectionValue = (body.collection || "regular").toLowerCase().trim();
    const collection = ALLOWED_COLLECTIONS.includes(collectionValue) ? collectionValue : "regular";

    const variantMatrix = Array.isArray(body.variantMatrix)
      ? body.variantMatrix.filter((v) => v && (v.size || v.color) && Number(v.stock) >= 0).map((v) => ({
          size: String(v.size || "").trim(),
          color: String(v.color || "").trim(),
          colorHex: String(v.colorHex || "").trim(),
          stock: Math.max(0, Number(v.stock) || 0),
        }))
      : [];
    const stockFromMatrix = variantMatrix.reduce((sum, v) => sum + (v.stock || 0), 0);
    const stockQuantity = variantMatrix.length > 0 ? stockFromMatrix : Math.max(0, Number(body.stockQuantity) || 0);

    const attrs = body.attributes || {};
    const toLines = (v) => (Array.isArray(v) ? v : typeof v === "string" ? v.split("\n").map((s) => s.trim()).filter(Boolean) : []);

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
      collection,
      collections: Array.isArray(body.collections) ? body.collections : [],
      tags: Array.isArray(body.tags) ? body.tags : [],
      variants: {
        size: Array.isArray(body.variants?.size) ? body.variants.size : [...new Set(variantMatrix.map((v) => v.size).filter(Boolean))],
        color: Array.isArray(body.variants?.color) ? body.variants.color : [...new Set(variantMatrix.map((v) => v.color).filter(Boolean))],
      },
      variantMatrix: variantMatrix,
      stockQuantity,
      isFeatured: Boolean(body.isFeatured),
      status: body.status === "active" ? "active" : "draft",
      images: [DEFAULT_PRODUCT_IMAGE_URL],
      sku: (body.sku || "").trim(),
      attributes: {
        composition: toLines(attrs.composition),
        sizeAndFit: toLines(attrs.sizeAndFit),
        care: toLines(attrs.care),
        traceability: toLines(attrs.traceability),
      },
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

/**
 * GET /api/products/admin/list
 * Admin only. Returns all products (active + draft), newest first.
 */
export async function getAdminProducts(req, res, next) {
  try {
    const products = await Product.find({}).populate("campaign", "name").lean().sort({ createdAt: -1 });
    const list = products.map((p) => ({
      ...p,
      campaignName: p.campaign?.name ?? null,
    }));
    res.json({ success: true, products: list });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/products/:id
 * Admin only. Update product by MongoDB _id. Body: same shape as create (partial ok).
 */
export async function updateProduct(req, res, next) {
  try {
    const { id } = req.params;
    const body = req.body;
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    if (body.name !== undefined) {
      const name = (body.name || "").trim();
      if (!name) {
        return res.status(400).json({ success: false, message: "Product name cannot be empty" });
      }
      product.name = name;
      let slug = slugify(name);
      if (slug) {
        const existing = await Product.findOne({ slug, _id: { $ne: id } });
        if (existing) slug = `${slug}-${Date.now()}`;
        product.slug = slug;
      }
    }
    if (body.shortDescription !== undefined) product.shortDescription = (body.shortDescription || "").trim();
    if (body.description !== undefined) product.description = (body.description || "").trim();
    if (body.category !== undefined) {
      const categoryStr = (body.category || "").trim();
      product.category = categoryStr;
      product.categoryPath = parseCategoryPath(categoryStr);
    }
    if (body.collection !== undefined) {
      const collectionValue = (body.collection || "regular").toLowerCase().trim();
      product.collection = ALLOWED_COLLECTIONS.includes(collectionValue) ? collectionValue : "regular";
    }
    if (body.originalPrice !== undefined || body.discount !== undefined) {
      const originalPrice = parseOriginalPrice(body.originalPrice !== undefined ? body.originalPrice : product.originalPrice);
      const discount = parseDiscount(body.discount !== undefined ? body.discount : product.discount);
      product.originalPrice = originalPrice;
      product.discount = discount;
      const finalPrice = computeFinalPrice(originalPrice, discount);
      product.finalPrice = finalPrice != null ? finalPrice : undefined;
      product.price = resolveSellingPrice(originalPrice, discount);
    }
    if (body.variantMatrix !== undefined && Array.isArray(body.variantMatrix)) {
      const variantMatrix = body.variantMatrix
        .filter((v) => v && (v.size || v.color) && Number(v.stock) >= 0)
        .map((v) => ({
          size: String(v.size || "").trim(),
          color: String(v.color || "").trim(),
          colorHex: String(v.colorHex || "").trim(),
          stock: Math.max(0, Number(v.stock) || 0),
        }));
      product.variantMatrix = variantMatrix;
      product.variants = {
        size: [...new Set(variantMatrix.map((v) => v.size).filter(Boolean))],
        color: [...new Set(variantMatrix.map((v) => v.color).filter(Boolean))],
      };
      product.stockQuantity = variantMatrix.reduce((sum, v) => sum + (v.stock || 0), 0);
    } else if (body.stockQuantity !== undefined) {
      product.stockQuantity = Math.max(0, Number(body.stockQuantity) || 0);
    }
    if (body.attributes !== undefined) {
      const attrs = body.attributes;
      const toLines = (v) => (Array.isArray(v) ? v : typeof v === "string" ? v.split("\n").map((s) => s.trim()).filter(Boolean) : []);
      product.attributes = {
        composition: toLines(attrs.composition),
        sizeAndFit: toLines(attrs.sizeAndFit),
        care: toLines(attrs.care),
        traceability: toLines(attrs.traceability),
      };
    }
    if (body.status !== undefined) product.status = body.status === "active" ? "active" : "draft";
    if (body.images !== undefined && Array.isArray(body.images)) product.images = body.images;
    if (body.isFeatured !== undefined) product.isFeatured = Boolean(body.isFeatured);

    if (body.removeFromCampaign === true && product.campaign) {
      const campaignId = product.campaign.toString();
      const restorePrice = product.originalPrice ?? product.price ?? 0;
      product.campaign = undefined;
      product.originalPrice = null;
      product.discount = 0;
      product.finalPrice = null;
      product.price = restorePrice;
      product.collection = "regular";
      const campaign = await Campaign.findById(campaignId);
      if (campaign) {
        campaign.products = (campaign.products || []).filter((pid) => pid.toString() !== id);
        await campaign.save();
      }
    }
    await product.save();

    if (body.addToCampaign && String(body.addToCampaign).match(/^[a-fA-F0-9]{24}$/)) {
      const campaign = await Campaign.findById(body.addToCampaign);
      if (campaign) {
        const pid = id;
        if (!(campaign.products || []).map((p) => p.toString()).includes(pid)) {
          campaign.products = [...(campaign.products || []), pid];
          await campaign.save();
        }
        await applyCampaignToProduct(pid, campaign._id.toString(), campaign.discount ?? 0);
      }
    }
    let updated = await Product.findById(id).populate("campaign", "name").lean();
    if (updated.campaign?.name) updated = { ...updated, campaignName: updated.campaign.name };
    res.json({ success: true, message: "Product updated successfully", product: updated });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/products/:id
 * Admin only. Delete product by MongoDB _id.
 */
export async function deleteProduct(req, res, next) {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    res.json({ success: true, message: "Product deleted successfully" });
  } catch (err) {
    next(err);
  }
}
