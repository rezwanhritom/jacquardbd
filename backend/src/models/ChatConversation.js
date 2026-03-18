import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    from: { type: String, enum: ["user", "admin"], required: true },
    text: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

const chatConversationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    /** Same browser session cookie as guest orders. */
    guestSessionId: { type: String, sparse: true, index: true },
    messages: [messageSchema],
  },
  { timestamps: true }
);

chatConversationSchema.index({ user: 1 });
chatConversationSchema.index({ guestSessionId: 1 }, { unique: true, sparse: true });
chatConversationSchema.index({ updatedAt: -1 });

export default mongoose.model("ChatConversation", chatConversationSchema);
