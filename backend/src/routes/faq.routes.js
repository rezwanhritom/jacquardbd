import express from "express";
import {
  getAnsweredFaqs,
  submitQuestion,
  adminGetAll,
  adminUpdate,
  adminDelete,
} from "../controller/faq.controller.js";
import { protect, requireRole, optionalAuth } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public
router.get("/", getAnsweredFaqs);
router.post("/", optionalAuth, submitQuestion);

// Admin only
router.get("/admin", protect, requireRole(["admin"]), adminGetAll);
router.patch("/:id", protect, requireRole(["admin"]), adminUpdate);
router.delete("/:id", protect, requireRole(["admin"]), adminDelete);

export default router;
