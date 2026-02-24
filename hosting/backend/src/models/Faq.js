import mongoose from "mongoose";

const faqSchema = new mongoose.Schema(
  {
    question: { type: String, required: true, trim: true },
    /** Optional: user who asked (if logged in) */
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    /** Email for guest questions or fallback */
    email: { type: String, trim: true, default: null },
    /** Admin reply; null until answered */
    reply: { type: String, trim: true, default: null },
    repliedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

faqSchema.index({ createdAt: -1 });

export default mongoose.model("Faq", faqSchema);
