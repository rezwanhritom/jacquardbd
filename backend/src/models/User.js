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
 * User schema: name, email (unique), hashed password, role, addresses.
 * Passwords are hashed in pre-save middleware; never store plain text.
 */
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8, select: false },
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

// Hash password before saving (only when password is modified)
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare plain password with hashed
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model("User", userSchema);
