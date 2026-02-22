import express from "express";
import { protect, sameUser, requireRole } from "../middlewares/auth.middleware.js";
import {
  getProfile,
  updateProfile,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  getAdminCustomers,
  deleteUserAdmin,
} from "../controller/user.controller.js";

const router = express.Router();

router.use(protect);

router.get("/admin/list", requireRole(["admin"]), getAdminCustomers);
router.delete("/admin/:userId", requireRole(["admin"]), deleteUserAdmin);

router.get("/:userId", sameUser, getProfile);
router.put("/:userId", sameUser, updateProfile);
router.get("/:userId/wishlist", sameUser, getWishlist);
router.post("/:userId/wishlist/:productId", sameUser, addToWishlist);
router.delete("/:userId/wishlist/:productId", sameUser, removeFromWishlist);

export default router;
