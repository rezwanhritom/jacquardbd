import mongoose from "mongoose";

const CAMPAIGN_TYPES = ["Discount", "Product Launch", "Flash Sale", "Loyalty", "Seasonal"];
const CAMPAIGN_STATUSES = ["Scheduled", "Active", "Ended"];
const TARGET_AUDIENCES = ["All Customers", "Premium Members", "VIP Members", "New Customers"];

const campaignSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: CAMPAIGN_TYPES, default: "Discount" },
    status: { type: String, enum: CAMPAIGN_STATUSES, default: "Scheduled" },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    discount: { type: Number, min: 0, max: 100, default: 0 },
    targetAudience: { type: String, enum: TARGET_AUDIENCES, default: "All Customers" },
    conversions: { type: Number, min: 0, default: 0 },
    revenue: { type: Number, min: 0, default: 0 },
  },
  { timestamps: true }
);

campaignSchema.index({ status: 1 });
campaignSchema.index({ startDate: 1, endDate: 1 });

export default mongoose.model("Campaign", campaignSchema);
