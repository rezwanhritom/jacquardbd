import mongoose from "mongoose";

/**
 * Session schema: one document per login. JWT payload includes session _id (sid).
 * Revoking a session = deleting this document; protect middleware will reject tokens whose session is missing.
 */
const sessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    userAgent: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

sessionSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model("Session", sessionSchema);
