import mongoose from "mongoose";

export const REWARD_RULE_STATUSES = ["Active", "Inactive"];

/** benefitType: discount (percentage/fixed on eligible lines) or free_shipping */
const rewardRuleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    status: { type: String, enum: REWARD_RULE_STATUSES, default: "Active" },
    /** Points the customer must spend to unlock this reward (one use per redemption). */
    pointsRequired: { type: Number, required: true, min: 1 },
    benefitType: { type: String, enum: ["discount", "free_shipping"], default: "discount" },
    discountType: { type: String, enum: ["percentage", "fixed"], default: "percentage" },
    discountValue: { type: Number, default: 0, min: 0 },
    maxDiscountAmount: { type: Number, min: 0, default: null },
    minOrderSubtotal: { type: Number, min: 0, default: 0 },
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

rewardRuleSchema.index({ status: 1, sortOrder: 1 });

export default mongoose.model("RewardRule", rewardRuleSchema);
