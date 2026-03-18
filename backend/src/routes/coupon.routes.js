import express from "express";
import {
  previewCoupon,
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from "../controller/coupon.controller.js";
import { protect, requireRole, optionalAuth } from "../middlewares/auth.middleware.js";
import { ensureGuestSession } from "../middlewares/guestSession.middleware.js";

const router = express.Router();

router.post("/preview", ensureGuestSession, optionalAuth, previewCoupon);
router.get("/", protect, requireRole(["admin"]), getCoupons);
router.post("/", protect, requireRole(["admin"]), createCoupon);
router.put("/:id", protect, requireRole(["admin"]), updateCoupon);
router.delete("/:id", protect, requireRole(["admin"]), deleteCoupon);

export default router;
