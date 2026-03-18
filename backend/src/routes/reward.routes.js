import express from "express";
import {
  listPublicRewardRules,
  getRewardAccount,
  previewReward,
  redeemRewardForLater,
  adminListRewardRules,
  adminCreateRewardRule,
  adminUpdateRewardRule,
  adminDeleteRewardRule,
} from "../controller/reward.controller.js";
import { protect, requireRole } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/rules", listPublicRewardRules);
router.get("/account", protect, getRewardAccount);
router.post("/preview", protect, previewReward);
router.post("/redeem-later", protect, redeemRewardForLater);

router.get("/admin/rules", protect, requireRole(["admin"]), adminListRewardRules);
router.post("/admin/rules", protect, requireRole(["admin"]), adminCreateRewardRule);
router.put("/admin/rules/:id", protect, requireRole(["admin"]), adminUpdateRewardRule);
router.delete("/admin/rules/:id", protect, requireRole(["admin"]), adminDeleteRewardRule);

export default router;
