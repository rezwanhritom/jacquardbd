import express from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  getProductsByCollection,
  getHomeProducts,
  getNavMenu,
  getAdminProducts,
  updateProduct,
  deleteProduct,
  searchProducts,
} from "../controller/productController.js";
import { protect, requireRole } from "../middlewares/auth.middleware.js";

const router = express.Router();

// List by gender (query: ?gender=men|women) or all active
router.get("/", getProducts);
// Search: ?q=... (products + category; fuzzy / suggestedQuery)
router.get("/search", searchProducts);
// Homepage: latest 4 + top 2 best sellers
router.get("/home", getHomeProducts);
// Mega menu photos (must be before /:identifier)
router.get("/nav", getNavMenu);
// List by collection (e.g. new-arrivals) - must be before /:identifier
router.get("/collection/:collectionName", getProductsByCollection);
// Admin: list all products (active + draft)
router.get("/admin/list", protect, requireRole(["admin"]), getAdminProducts);
// Single product by slug or MongoDB _id
router.get("/:identifier", getProductById);
// Create product (JSON body) – admin only
router.post("/", protect, requireRole(["admin"]), createProduct);
// Update product by id – admin only
router.put("/:id", protect, requireRole(["admin"]), updateProduct);
// Delete product by id – admin only
router.delete("/:id", protect, requireRole(["admin"]), deleteProduct);

export default router;
