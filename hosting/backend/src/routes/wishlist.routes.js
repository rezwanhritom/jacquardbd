import express from "express";
import { getWishlist, addToWishlist, removeFromWishlist, mergeWishlist } from "../controller/wishlist.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.get("/", getWishlist);
router.post("/merge", mergeWishlist);
router.post("/:productId", addToWishlist);
router.delete("/:productId", removeFromWishlist);

export default router;
