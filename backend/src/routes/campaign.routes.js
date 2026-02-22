import express from "express";
import { getCampaigns, createCampaign, updateCampaign, deleteCampaign } from "../controller/campaign.controller.js";
import { protect, requireRole } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", protect, requireRole(["admin"]), getCampaigns);
router.post("/", protect, requireRole(["admin"]), createCampaign);
router.put("/:id", protect, requireRole(["admin"]), updateCampaign);
router.delete("/:id", protect, requireRole(["admin"]), deleteCampaign);

export default router;
