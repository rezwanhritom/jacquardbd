import express from "express";
import { getProducts, getProductById, createProduct, getProductsByCollection } from "../controller/productController.js";

const router = express.Router();

// List by gender (query: ?gender=men|women) or all active
router.get("/", getProducts);
// List by collection (e.g. new-arrivals) - must be before /:identifier
router.get("/collection/:collectionName", getProductsByCollection);
// Single product by slug or MongoDB _id
router.get("/:identifier", getProductById);
// Create product (JSON body)
router.post("/", createProduct);

export default router;
