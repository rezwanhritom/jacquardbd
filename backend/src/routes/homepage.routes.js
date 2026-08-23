import express from "express";
import {
  getPublicHomepageMedia,
  getAdminHomepageMedia,
  uploadHomepageMedia,
  updateHomepageMedia,
  deleteHomepageMedia,
} from "../controller/homepage.controller.js";
import { uploadHomepageMedia as multerHomepage } from "../middlewares/upload.middleware.js";
import { imageKitReady } from "../controller/image.controller.js";
import { protect, requireRole } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", getPublicHomepageMedia);

router.get("/admin", protect, requireRole(["admin"]), getAdminHomepageMedia);

router.post(
  "/upload",
  protect,
  requireRole(["admin"]),
  ...imageKitReady,
  (req, res, next) => {
    multerHomepage(req, res, (err) => {
      if (err) return res.status(400).json({ success: false, message: err.message });
      next();
    });
  },
  uploadHomepageMedia
);

router.patch("/:id", protect, requireRole(["admin"]), updateHomepageMedia);
router.delete("/:id", protect, requireRole(["admin"]), deleteHomepageMedia);

export default router;
