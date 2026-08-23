import mongoose from "mongoose";

/**
 * Admin-managed homepage media from ImageKit.
 * hero → homepage/photos (images). video → homepage/videos (lookbook clips).
 */
const homepageMediaSchema = new mongoose.Schema(
  {
    /** Where this asset appears on the storefront. */
    slot: {
      type: String,
      enum: ["hero", "video"],
      required: true,
      index: true,
    },
    mediaType: {
      type: String,
      enum: ["image", "video"],
      required: true,
    },
    url: { type: String, required: true, trim: true },
    /** ImageKit file id. */
    fileId: { type: String, default: "", trim: true },
    title: { type: String, default: "", trim: true },
    enabled: { type: Boolean, default: true, index: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

homepageMediaSchema.index({ slot: 1, enabled: 1, sortOrder: 1 });

export default mongoose.model("HomepageMedia", homepageMediaSchema);
