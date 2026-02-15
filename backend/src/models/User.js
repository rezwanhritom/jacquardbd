import mongoose from "mongoose";
import bcrypt from "bcryptjs";

export const ROLES = Object.freeze({ NORMAL: "normal", PREMIUM: "premium", ADMIN: "admin" });
const ROLE_VALUES = Object.values(ROLES);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ROLE_VALUES,
      default: ROLES.NORMAL,
    },
    profileImage: { type: String, default: null },
  },
  { timestamps: true }
);

userSchema.index({ email: 1 });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model("User", userSchema);
