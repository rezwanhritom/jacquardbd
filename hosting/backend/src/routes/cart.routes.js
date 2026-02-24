import express from "express";
import { getCart, addToCart, updateCartQuantity, removeFromCart, mergeCart } from "../controller/cart.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.get("/", getCart);
router.post("/merge", mergeCart);
router.post("/:productId", addToCart);
router.put("/:productId", updateCartQuantity);
router.delete("/:productId", removeFromCart);

export default router;
