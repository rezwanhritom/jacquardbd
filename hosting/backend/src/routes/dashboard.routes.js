import express from "express";
import { getDashboard } from "../controller/dashboard.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", protect, requireRole(["admin"]), getDashboard);

export default router;
