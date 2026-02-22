import express from "express";
import {
  createOrder,
  getMyOrders,
  getMyOrderById,
  getAdminOrders,
  updateOrderStatus,
} from "../controller/order.controller.js";
import { protect, requireRole } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", protect, createOrder);
router.get("/me", protect, getMyOrders);
router.get("/me/:orderId", protect, getMyOrderById);
router.get("/admin/list", protect, requireRole(["admin"]), getAdminOrders);
router.put("/:id/status", protect, requireRole(["admin"]), updateOrderStatus);

export default router;
