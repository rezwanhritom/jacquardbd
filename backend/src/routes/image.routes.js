import express from "express";
import {
  uploadProductImages,
  uploadProfileImage,
  deleteImage,
  updateProductImages,
  getUploadParams,
  imageKitReady,
} from "../controller/image.controller.js";
import { uploadProductImages: multerProduct, uploadProfileImage: multerProfile } from "../middlewares/upload.middleware.js";
import { protect, requireRole } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.get("/upload-params", ...imageKitReady, getUploadParams);

router.post(
  "/upload/product/:productId",
  ...imageKitReady,
  requireRole(["admin"]),
  (req, res, next) => {
    multerProduct(req, res, (err) => {
      if (err) return res.status(400).json({ success: false, message: err.message });
      next();
    });
  },
  uploadProductImages
);

router.post(
  "/upload/profile",
  ...imageKitReady,
  multerProfile,
  (req, res, next) => {
    if (req.file) return next();
    res.status(400).json({ success: false, message: "No file uploaded" });
  },
  uploadProfileImage
);

router.put("/product/:productId", requireRole(["admin"]), updateProductImages);

router.delete("/:fileId", ...imageKitReady, deleteImage);

export default router;
