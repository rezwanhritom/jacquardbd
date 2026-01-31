import express from "express";
import { getProducts, getProductById, createProduct } from "../controller/productController.js";

const router = express.Router();

router.get("/", getProducts);
router.get("/:identifier", getProductById);
router.post("/", createProduct);

export default router;
