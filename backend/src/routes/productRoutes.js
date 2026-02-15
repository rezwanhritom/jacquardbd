import express from "express";
import { getProducts, getProductById, createProduct } from "../controller/productController.js";
import { protect, requireRole } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", getProducts);
router.get("/:identifier", getProductById);
router.post("/", protect, requireRole(["admin"]), createProduct);

export default router;
