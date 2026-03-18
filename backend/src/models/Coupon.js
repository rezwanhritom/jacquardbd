import mongoose from "mongoose";

export const COUPON_STATUSES = ["Active", "Inactive"];

const couponSchema = new mongoose.Schema(
  {
    /** Unique code shown to customers (stored uppercase). */
    code: { type: String, required: true, trim: true, uppercase: true },
    name: { type: String, default: "", trim: true },
    description: { type: String, default: "", trim: true },
    status: { type: String, enum: COUPON_STATUSES, default: "Active" },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    /** "percentage" (0–100 of eligible subtotal) or "fixed" (BDT off eligible subtotal). */
    discountType: { type: String, enum: ["percentage", "fixed"], default: "percentage" },
    discountValue: { type: Number, required: true, min: 0 },
    /** Max discount in BDT when discountType is percentage (optional). */
    maxDiscountAmount: { type: Number, min: 0, default: null },
    /** Minimum cart subtotal (all items) required. */
    minOrderSubtotal: { type: Number, min: 0, default: 0 },
    /** Empty = all products; otherwise only these lines count toward discount. */
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    /** Max total redemptions (null = unlimited). */
    usageLimit: { type: Number, min: 1, default: null },
    usedCount: { type: Number, min: 0, default: 0 },
    /** Max uses per registered user (guests: per guest session per code). 0 or null = no per-user cap. */
    perUserLimit: { type: Number, min: 1, default: null },
  },
  { timestamps: true }
);

couponSchema.index({ code: 1 }, { unique: true });
couponSchema.index({ status: 1, startDate: 1, endDate: 1 });

export default mongoose.model("Coupon", couponSchema);
