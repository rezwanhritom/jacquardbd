import mongoose from "mongoose";

export const ORDER_STATUS = Object.freeze({
  PENDING: "pending",
  PAID: "paid",
  FAILED: "failed",
  CANCELLED: "cancelled",
});

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  name: String,
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 },
});

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "BDT" },
    status: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      default: ORDER_STATUS.PENDING,
    },
    items: [orderItemSchema],
    shippingAddress: {
      name: String,
      phone: String,
      address: String,
      city: String,
      state: String,
      zip: String,
    },
    sslcommerz: {
      tran_id: { type: String, unique: true, sparse: true },
      val_id: String,
      card_type: String,
      card_no: String,
      bank_tran_id: String,
      card_issuer: String,
      card_brand: String,
      card_issuer_country: String,
      card_issuer_country_code: String,
      currency_type: String,
      currency_amount: Number,
      risk_level: Number,
      risk_title: String,
    },
  },
  { timestamps: true }
);

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ "sslcommerz.tran_id": 1 });

export default mongoose.model("Order", orderSchema);
