import mongoose from "mongoose";

/** Order fulfillment status (admin workflow). */
export const ORDER_STATUS = Object.freeze({
  PENDING: "pending",
  CANCELLED: "cancelled",
  CONFIRMED: "confirmed",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  /** @deprecated Legacy; use paymentStatus "paid" and status "delivered" */
  PAID: "paid",
  /** @deprecated Legacy; use status "cancelled" */
  FAILED: "failed",
});

/** Payment status: pending (default), cancelled when order cancelled, paid when delivered. */
export const PAYMENT_STATUS = Object.freeze({
  PENDING: "pending",
  CANCELLED: "cancelled",
  PAID: "paid",
});

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  name: String,
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 },
});

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    /** Browser session for guest checkout (HTTP-only cookie). */
    guestSessionId: { type: String, index: true, sparse: true },
    guestEmail: { type: String, trim: true, default: "" },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "BDT" },
    status: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      default: ORDER_STATUS.PENDING,
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.PENDING,
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
    /** Applied at checkout (uppercase code). */
    couponCode: { type: String, default: "", trim: true },
    couponDiscount: { type: Number, default: 0, min: 0 },
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
orderSchema.index({ guestSessionId: 1, createdAt: -1 });
orderSchema.index({ "sslcommerz.tran_id": 1 });

export default mongoose.model("Order", orderSchema);
