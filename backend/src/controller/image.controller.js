import crypto from "crypto";
import Product from "../models/Product.js";
import User from "../models/User.js";
import { getImageKit, isImageKitConfigured } from "../config/imagekit.js";

const MONGO_ID_REGEX = /^[a-fA-F0-9]{24}$/;

function ensureImageKit(req, res, next) {
  if (!isImageKitConfigured()) {
    return res.status(503).json({ success: false, message: "Image upload service not configured" });
  }
  try {
    getImageKit();
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/images/upload/product/:productId
 * Upload multiple images for a product. Folder: /products/:productId
 */
export async function uploadProductImages(req, res, next) {
  // Debug: confirm files and productId reached the controller
  if (process.env.NODE_ENV !== "production") {
    console.log("[ImageKit] uploadProductImages called", {
      filesCount: req.files?.length ?? 0,
      productId: req.params?.productId,
    });
  }
  if (!req.files?.length) {
    return res.status(400).json({ success: false, message: "No files uploaded" });
  }
  const { productId } = req.params;
  if (!productId || !MONGO_ID_REGEX.test(productId)) {
    return res.status(400).json({ success: false, message: "Valid product ID required" });
  }
  const product = await Product.findById(productId).lean();
  if (!product) return res.status(404).json({ success: false, message: "Product not found" });

  const imagekit = getImageKit();
  const folder = `products/${productId}`;
  const urls = [];
  try {
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const ext = (file.mimetype && file.mimetype.split("/")[1]) || "jpg";
      const result = await imagekit.upload({
        file: file.buffer,
        fileName: `img_${Date.now()}_${i}.${ext}`,
        folder,
      });
      if (process.env.NODE_ENV !== "production" && result?.url) {
        console.log("[ImageKit] uploaded file", i + 1, result.url);
      }
      if (result?.url) urls.push(result.url);
    }
    if (urls.length === 0) {
      return res.status(500).json({ success: false, message: "ImageKit returned no URLs" });
    }
    // If product had only the default placeholder, replace; otherwise append
    const hadOnlyDefault = product.images?.length === 1;
    const update = hadOnlyDefault
      ? { $set: { images: urls } }
      : { $push: { images: { $each: urls } } };
    await Product.updateOne({ _id: productId }, update);
    const updated = await Product.findById(productId).select("images").lean();
    res.status(201).json({ success: true, message: "Images uploaded", images: urls, productImages: updated?.images || [] });
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[ImageKit] upload error", err?.message || err);
    }
    next(err);
  }
}

/**
 * POST /api/images/upload/profile
 * Upload single profile image. Folder: /users/:userId
 */
export async function uploadProfileImage(req, res, next) {
  if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });
  const userId = req.user._id.toString();
  const imagekit = getImageKit();
  const folder = `users/${userId}`;
  try {
    const result = await imagekit.upload({
      file: req.file.buffer,
      fileName: `profile_${Date.now()}.${req.file.mimetype.split("/")[1] || "jpg"}`,
      folder,
    });
    if (!result?.url) return res.status(500).json({ success: false, message: "Upload failed" });
    const oldUrl = req.user.avatar;
    if (oldUrl) {
      try {
        const fileId = oldUrl.split("/").pop()?.split("?")[0];
        if (fileId) await imagekit.deleteFile(fileId);
      } catch (_) {}
    }
    await User.updateOne({ _id: userId }, { $set: { avatar: result.url } });
    res.status(201).json({ success: true, message: "Profile image uploaded", url: result.url });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/images/:fileId
 * Delete file from ImageKit by fileId (from URL or stored id).
 */
export async function deleteImage(req, res, next) {
  const { fileId } = req.params;
  if (!fileId) return res.status(400).json({ success: false, message: "File ID required" });
  try {
    const imagekit = getImageKit();
    await imagekit.deleteFile(fileId);
    res.json({ success: true, message: "Image deleted" });
  } catch (err) {
    if (err?.response?.statusCode === 404) {
      return res.status(404).json({ success: false, message: "Image not found" });
    }
    next(err);
  }
}

/**
 * PUT /api/images/product/:productId
 * Replace product images: body { imageUrls: string[] } (full ImageKit URLs). Removes old refs and sets new.
 */
export async function updateProductImages(req, res, next) {
  const { productId } = req.params;
  const { imageUrls } = req.body;
  if (!productId || !MONGO_ID_REGEX.test(productId)) {
    return res.status(400).json({ success: false, message: "Valid product ID required" });
  }
  if (!Array.isArray(imageUrls)) {
    return res.status(400).json({ success: false, message: "imageUrls array required" });
  }
  const product = await Product.findById(productId).lean();
  if (!product) return res.status(404).json({ success: false, message: "Product not found" });
  await Product.updateOne({ _id: productId }, { $set: { images: imageUrls.filter(Boolean) } });
  const updated = await Product.findById(productId).select("images").lean();
  res.json({ success: true, message: "Product images updated", productImages: updated?.images || [] });
}

/**
 * GET /api/images/upload-params (optional: for client-side signed upload)
 * Returns token, expire, signature for ImageKit client upload. Server keeps private key safe.
 */
export function getUploadParams(req, res, next) {
  if (!isImageKitConfigured()) {
    return res.status(503).json({ success: false, message: "Image upload service not configured" });
  }
  try {
    const imagekit = getImageKit();
    const token = crypto.randomBytes(16).toString("hex");
    const expire = Math.floor(Date.now() / 1000) + 3600;
    const auth = imagekit.getAuthenticationParameters(token, expire);
    res.json({ success: true, ...auth });
  } catch (err) {
    next(err);
  }
}

export const imageKitReady = [ensureImageKit];
