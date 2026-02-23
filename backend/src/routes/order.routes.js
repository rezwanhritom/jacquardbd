import express from "express";
import {
  createOrder,
  getMyOrders,
  getMyOrderById,
  getAdminOrders,
  getAdminOrderById,
  updateOrderStatus,
  deleteOrder,
  updateOrder,
} from "../controller/order.controller.js";
import { protect, requireRole } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", protect, createOrder);
router.get("/me", protect, getMyOrders);
router.get("/me/:orderId", protect, getMyOrderById);
router.get("/admin/list", protect, requireRole(["admin"]), getAdminOrders);
router.get("/admin/:id", protect, requireRole(["admin"]), getAdminOrderById);
router.put("/:id/status", protect, requireRole(["admin"]), updateOrderStatus);
router.put("/:id", protect, requireRole(["admin"]), updateOrder);
router.delete("/:id", protect, requireRole(["admin"]), deleteOrder);

export default router;
