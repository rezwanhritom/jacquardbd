import mongoose from "mongoose";
import bcrypt from "bcrypt";

const addressSchema = new mongoose.Schema(
  {
    label: { type: String, trim: true, default: "" },
    name: { type: String, trim: true, default: "" },
    phone: { type: String, trim: true, default: "" },
    address: { type: String, trim: true, default: "" },
    city: { type: String, trim: true, default: "" },
    state: { type: String, trim: true, default: "" },
    zip: { type: String, trim: true, default: "" },
    country: { type: String, trim: true, default: "" },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

/**
 * User schema: name, email (unique), optional password (for Google-only users),
 * emailVerified, emailVerificationToken, googleId, role, addresses.
 * Passwords are hashed in pre-save when present; never store plain text.
 */
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, minlength: 8, select: false, default: null },
    emailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, select: false, default: null },
    emailVerificationExpires: { type: Date, select: false, default: null },
    googleId: { type: String, sparse: true, default: null },
    role: { type: String, enum: ["user", "admin", "premium"], default: "user" },
    premiumAppliedAt: { type: Date, default: null },
    avatar: { type: String, trim: true, default: "" },
    phone: { type: String, trim: true, default: "" },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    cart: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        quantity: { type: Number, default: 1, min: 1 },
      },
    ],
    addresses: [addressSchema],
  },
  { timestamps: true }
);

userSchema.index({ email: 1 });
userSchema.index({ googleId: 1 }, { sparse: true });

// Hash password before saving (only when password is modified and present)
userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare plain password with hashed (returns false if user has no password, e.g. Google-only)
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model("User", userSchema);
