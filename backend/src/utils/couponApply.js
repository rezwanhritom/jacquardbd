import Order from "../models/Order.js";
import Coupon from "../models/Coupon.js";

/**
 * @param {string} code
 */
export function normalizeCouponCode(code) {
  return String(code || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");
}

/**
 * Items: { productId, quantity, price }[]
 * @returns {{ ok: true, discount: number, coupon: object } | { ok: false, message: string }}
 */
export async function evaluateCouponForCart(couponDoc, { items, subtotal, userId, guestSessionId }) {
  const coupon = couponDoc;
  if (!coupon) {
    return { ok: false, message: "Invalid coupon code" };
  }
  const now = new Date();
  if (coupon.status !== "Active") {
    return { ok: false, message: "This coupon is not active" };
  }
  if (now < new Date(coupon.startDate) || now > new Date(coupon.endDate)) {
    return { ok: false, message: "This coupon has expired or is not yet valid" };
  }
  const minSub = Number(coupon.minOrderSubtotal) || 0;
  if (subtotal < minSub) {
    return {
      ok: false,
      message: `Minimum order of ৳${minSub.toFixed(2)} required for this coupon`,
    };
  }

  const restricted = Array.isArray(coupon.products) && coupon.products.length > 0;
  const productIdSet = new Set((coupon.products || []).map((p) => String(p)));

  let eligibleSubtotal = 0;
  if (restricted) {
    for (const row of items || []) {
      const pid = String(row.productId?._id ?? row.productId ?? "");
      if (productIdSet.has(pid)) {
        eligibleSubtotal += (Number(row.price) || 0) * Math.max(1, Math.floor(Number(row.quantity)) || 1);
      }
    }
    if (eligibleSubtotal <= 0) {
      return { ok: false, message: "This coupon does not apply to items in your cart" };
    }
  } else {
    eligibleSubtotal = subtotal;
  }

  let discount = 0;
  if (coupon.discountType === "fixed") {
    const v = Number(coupon.discountValue) || 0;
    discount = Math.min(v, eligibleSubtotal);
  } else {
    const pct = Math.min(100, Math.max(0, Number(coupon.discountValue) || 0));
    discount = (eligibleSubtotal * pct) / 100;
    const cap = coupon.maxDiscountAmount;
    if (cap != null && Number(cap) > 0) {
      discount = Math.min(discount, Number(cap));
    }
  }
  discount = Math.round(discount * 100) / 100;
  discount = Math.min(discount, subtotal);
  if (discount <= 0) {
    return { ok: false, message: "No discount applicable" };
  }

  const perUser = coupon.perUserLimit;
  if (perUser != null && perUser >= 1) {
    const codeUpper = normalizeCouponCode(coupon.code);
    if (userId) {
      const used = await Order.countDocuments({
        user: userId,
        couponCode: codeUpper,
      });
      if (used >= perUser) {
        return { ok: false, message: "You have already used this coupon the maximum number of times" };
      }
    } else if (guestSessionId) {
      const used = await Order.countDocuments({
        user: null,
        guestSessionId,
        couponCode: codeUpper,
      });
      if (used >= perUser) {
        return { ok: false, message: "This coupon has already been used on this session" };
      }
    }
  }

  if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) {
    return { ok: false, message: "This coupon has reached its usage limit" };
  }

  return { ok: true, discount, coupon };
}

/**
 * Atomically increment usedCount if under usageLimit. Returns updated doc or null.
 */
export async function claimCouponSlot(couponId, usageLimit) {
  const id = couponId;
  const filter = { _id: id };
  if (usageLimit != null && usageLimit >= 1) {
    filter.$expr = { $lt: ["$usedCount", usageLimit] };
  }
  const updated = await Coupon.findOneAndUpdate(filter, { $inc: { usedCount: 1 } }, { new: true }).lean();
  return updated;
}

export async function releaseCouponSlot(couponId) {
  await Coupon.findByIdAndUpdate(couponId, { $inc: { usedCount: -1 } });
}
