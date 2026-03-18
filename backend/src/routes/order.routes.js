import express from "express";
import {
  createOrder,
  createGuestOrder,
  getGuestOrders,
  getGuestOrderById,
  getMyOrders,
  getMyOrderById,
  getAdminOrders,
  getAdminOrderById,
  updateOrderStatus,
  deleteOrder,
  updateOrder,
} from "../controller/order.controller.js";
import { protect, requireRole } from "../middlewares/auth.middleware.js";
import { ensureGuestSession, readGuestSession } from "../middlewares/guestSession.middleware.js";

const router = express.Router();

router.post("/guest", ensureGuestSession, createGuestOrder);
router.get("/guest/me", readGuestSession, getGuestOrders);
router.get("/guest/:orderId", readGuestSession, getGuestOrderById);

router.post("/", protect, createOrder);
router.get("/me", protect, getMyOrders);
router.get("/me/:orderId", protect, getMyOrderById);
router.get("/admin/list", protect, requireRole(["admin"]), getAdminOrders);
router.get("/admin/:id", protect, requireRole(["admin"]), getAdminOrderById);
router.put("/:id/status", protect, requireRole(["admin"]), updateOrderStatus);
router.put("/:id", protect, requireRole(["admin"]), updateOrder);
router.delete("/:id", protect, requireRole(["admin"]), deleteOrder);

export default router;
