import express from "express";
import { getAdminOrders, updateOrderStatus } from "../controller/order.controller.js";
import { protect, requireRole } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/admin/list", protect, requireRole(["admin"]), getAdminOrders);
router.put("/:id/status", protect, requireRole(["admin"]), updateOrderStatus);

export default router;
