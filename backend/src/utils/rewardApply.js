/**
 * Evaluate reward rule or pending-reward snapshot against cart lines.
 * @param {object} ruleLike - { benefitType, discountType, discountValue, maxDiscountAmount, minOrderSubtotal, products? }
 * @param {{ productId: any, quantity: number, price: number }[]} items
 * @param {number} subtotalAfterCoupon - cart subtotal after coupon, before reward
 * @returns {{ ok: true, discount: number, freeShipping: boolean } | { ok: false, message: string }}
 */
export function evaluateRewardForCart(ruleLike, items, subtotalAfterCoupon) {
  const subtotal = Math.round(Number(subtotalAfterCoupon) * 100) / 100;
  const minSub = Number(ruleLike.minOrderSubtotal) || 0;
  if (subtotal < minSub) {
    return {
      ok: false,
      message: `Minimum order of ৳${minSub.toFixed(2)} required after coupon for this reward`,
    };
  }

  const benefitType = ruleLike.benefitType || "discount";
  if (benefitType === "free_shipping") {
    return { ok: true, discount: 0, freeShipping: true };
  }

  const restricted =
    Array.isArray(ruleLike.products) && ruleLike.products.length > 0;
  const productIdSet = new Set(
    (ruleLike.products || []).map((p) => String(p?._id ?? p ?? ""))
  );

  let eligibleSubtotal = 0;
  if (restricted) {
    for (const row of items || []) {
      const pid = String(row.productId?._id ?? row.productId ?? "");
      if (productIdSet.has(pid)) {
        eligibleSubtotal +=
          (Number(row.price) || 0) *
          Math.max(1, Math.floor(Number(row.quantity)) || 1);
      }
    }
    if (eligibleSubtotal <= 0) {
      return {
        ok: false,
        message: "This reward does not apply to items in your cart",
      };
    }
  } else {
    eligibleSubtotal = subtotal;
  }

  let discount = 0;
  if (ruleLike.discountType === "fixed") {
    const v = Number(ruleLike.discountValue) || 0;
    discount = Math.min(v, eligibleSubtotal);
  } else {
    const pct = Math.min(100, Math.max(0, Number(ruleLike.discountValue) || 0));
    discount = (eligibleSubtotal * pct) / 100;
    const cap = ruleLike.maxDiscountAmount;
    if (cap != null && Number(cap) > 0) {
      discount = Math.min(discount, Number(cap));
    }
  }
  discount = Math.round(discount * 100) / 100;
  discount = Math.min(discount, subtotal);
  if (discount <= 0) {
    return { ok: false, message: "No discount applicable for this reward" };
  }
  return { ok: true, discount, freeShipping: false };
}

/** Build pendingReward snapshot from a RewardRule document */
export function snapshotFromRule(ruleDoc) {
  const r = ruleDoc;
  return {
    ruleId: r._id,
    name: r.name || "Reward",
    pointsCost: Number(r.pointsRequired) || 0,
    benefitType: r.benefitType || "discount",
    discountType: r.discountType || "percentage",
    discountValue: Number(r.discountValue) || 0,
    maxDiscountAmount: r.maxDiscountAmount ?? null,
    minOrderSubtotal: Number(r.minOrderSubtotal) || 0,
    productIds: (r.products || []).map((p) => String(p._id ?? p)),
  };
}
