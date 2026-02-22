import express from "express";
import { getShipping, updateShipping } from "../controller/shipping.controller.js";
import { protect, requireRole } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", getShipping);
router.put("/", protect, requireRole(["admin"]), updateShipping);

export default router;
