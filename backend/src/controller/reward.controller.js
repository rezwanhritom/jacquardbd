import RewardRule from "../models/RewardRule.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import Coupon from "../models/Coupon.js";
import {
  normalizeCouponCode,
  evaluateCouponForCart,
} from "../utils/couponApply.js";
import { evaluateRewardForCart, snapshotFromRule } from "../utils/rewardApply.js";

const MONGO_ID = /^[a-fA-F0-9]{24}$/;
const PRODUCT_SELECT = "name price _id originalPrice discount finalPrice";

function pendingToRuleLike(pending) {
  if (!pending || !pending.ruleId) return null;
  return {
    benefitType: pending.benefitType || "discount",
    discountType: pending.discountType || "percentage",
    discountValue: pending.discountValue ?? 0,
    maxDiscountAmount: pending.maxDiscountAmount,
    minOrderSubtotal: pending.minOrderSubtotal ?? 0,
    products: (pending.productIds || []).map((id) => ({ _id: id })),
  };
}

async function buildItemsFromBody(rawItems) {
  const items = [];
  let subtotal = 0;
  for (const row of rawItems || []) {
    const pid = row.productId;
    const qty = Math.max(1, Math.floor(Number(row.quantity)) || 1);
    if (!pid) continue;
    const product = await Product.findById(pid).select(PRODUCT_SELECT).lean();
    if (!product) continue;
    const price = product.finalPrice ?? product.price ?? 0;
    items.push({
      productId: product._id,
      name: product.name || "Product",
      quantity: qty,
      price,
    });
    subtotal += price * qty;
  }
  return { items, subtotal };
}

/**
 * GET /api/rewards/rules — public active rules (for marketing copy)
 */
export async function listPublicRewardRules(req, res, next) {
  try {
    const rules = await RewardRule.find({ status: "Active" })
      .sort({ sortOrder: 1, pointsRequired: 1 })
      .select("name description pointsRequired benefitType discountType discountValue maxDiscountAmount minOrderSubtotal products")
      .populate("products", "name _id")
      .lean();
    res.json({ success: true, rules });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/rewards/account — points, pending reward, active rules
 */
export async function getRewardAccount(req, res, next) {
  try {
    const userId = req.user._id;
    const [user, rules] = await Promise.all([
      User.findById(userId).select("rewardPoints pendingReward").lean(),
      RewardRule.find({ status: "Active" })
        .sort({ sortOrder: 1, pointsRequired: 1 })
        .select("name description pointsRequired benefitType discountType discountValue maxDiscountAmount minOrderSubtotal products")
        .populate("products", "name _id")
        .lean(),
    ]);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    const pending = user.pendingReward?.ruleId ? user.pendingReward : null;
    res.json({
      success: true,
      rewardPoints: user.rewardPoints ?? 0,
      pendingReward: pending
        ? {
            name: pending.name,
            pointsCost: pending.pointsCost,
            benefitType: pending.benefitType,
            discountType: pending.discountType,
            discountValue: pending.discountValue,
            redeemedAt: pending.redeemedAt,
          }
        : null,
      rules,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/rewards/preview
 * Body: { items: [{ productId, quantity }], couponCode?, rewardRuleId?, usePendingReward? }
 */
export async function previewReward(req, res, next) {
  try {
    const userId = req.user._id;
    const {
      items: rawItems,
      couponCode: rawCoupon,
      rewardRuleId,
      usePendingReward = true,
    } = req.body || {};
    if (!Array.isArray(rawItems) || rawItems.length === 0) {
      return res.status(400).json({ success: false, message: "items required" });
    }

    const { items, subtotal } = await buildItemsFromBody(rawItems);
    if (items.length === 0) {
      return res.status(400).json({ success: false, message: "No valid products" });
    }

    let couponDiscount = 0;
    if (rawCoupon && String(rawCoupon).trim()) {
      const norm = normalizeCouponCode(rawCoupon);
      if (norm) {
        const coupon = await Coupon.findOne({ code: norm }).lean();
        const ev = await evaluateCouponForCart(coupon, {
          items,
          subtotal,
          userId,
          guestSessionId: null,
        });
        if (ev.ok) couponDiscount = ev.discount;
      }
    }
    const afterCoupon = Math.round((subtotal - couponDiscount) * 100) / 100;

    const user = await User.findById(userId).select("rewardPoints pendingReward").lean();
    const points = user?.rewardPoints ?? 0;
    const pending = user?.pendingReward?.ruleId ? user.pendingReward : null;

    if (usePendingReward && pending) {
      const ruleLike = pendingToRuleLike(pending);
      const ev = evaluateRewardForCart(ruleLike, items, afterCoupon);
      if (ev.ok) {
        return res.json({
          success: true,
          source: "pending",
          discount: ev.discount,
          freeShipping: ev.freeShipping,
          label: pending.name || "Your reward",
          pointsBalance: points,
        });
      }
      return res.json({
        success: false,
        message: ev.message || "Saved reward does not apply to this cart",
        source: "pending",
        pointsBalance: points,
      });
    }

    if (rewardRuleId && MONGO_ID.test(String(rewardRuleId))) {
      const rule = await RewardRule.findById(rewardRuleId).lean();
      if (!rule || rule.status !== "Active") {
        return res.json({ success: false, message: "Reward offer not found", pointsBalance: points });
      }
      const cost = Number(rule.pointsRequired) || 0;
      if (points < cost) {
        return res.json({
          success: false,
          message: `Not enough points (need ${cost}, you have ${points})`,
          pointsBalance: points,
          pointsRequired: cost,
        });
      }
      const ruleLike = {
        benefitType: rule.benefitType,
        discountType: rule.discountType,
        discountValue: rule.discountValue,
        maxDiscountAmount: rule.maxDiscountAmount,
        minOrderSubtotal: rule.minOrderSubtotal,
        products: rule.products,
      };
      const ev = evaluateRewardForCart(ruleLike, items, afterCoupon);
      if (!ev.ok) {
        return res.json({ success: false, message: ev.message, pointsBalance: points });
      }
      return res.json({
        success: true,
        source: "rule",
        discount: ev.discount,
        freeShipping: ev.freeShipping,
        label: rule.name,
        pointsRequired: cost,
        pointsBalance: points,
      });
    }

    res.json({
      success: true,
      previewOnly: true,
      pointsBalance: points,
      afterCoupon,
      hasPending: !!pending,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/rewards/redeem-later — spend points now, apply on next order
 */
export async function redeemRewardForLater(req, res, next) {
  try {
    const userId = req.user._id;
    const { ruleId } = req.body || {};
    if (!ruleId || !MONGO_ID.test(String(ruleId))) {
      return res.status(400).json({ success: false, message: "Invalid rule" });
    }

    const rule = await RewardRule.findById(ruleId).lean();
    if (!rule || rule.status !== "Active") {
      return res.status(400).json({ success: false, message: "This reward is not available" });
    }
    const cost = Number(rule.pointsRequired) || 0;
    const snap = snapshotFromRule(rule);
    const u = await User.findById(userId);
    if (!u) return res.status(404).json({ success: false, message: "User not found" });
    if (u.pendingReward?.ruleId) {
      return res.status(400).json({
        success: false,
        message: "You already have a reward ready for your next order.",
      });
    }
    if ((u.rewardPoints ?? 0) < cost) {
      return res.status(400).json({ success: false, message: `Not enough points (need ${cost})` });
    }
    u.rewardPoints = (u.rewardPoints ?? 0) - cost;
    u.pendingReward = {
      ruleId: snap.ruleId,
      name: snap.name,
      pointsCost: snap.pointsCost,
      benefitType: snap.benefitType,
      discountType: snap.discountType,
      discountValue: snap.discountValue,
      maxDiscountAmount: snap.maxDiscountAmount,
      minOrderSubtotal: snap.minOrderSubtotal,
      productIds: snap.productIds,
      redeemedAt: new Date(),
    };
    await u.save();
    const updated = { rewardPoints: u.rewardPoints, pendingReward: u.pendingReward };

    res.json({
      success: true,
      message: "Reward saved for your next checkout",
      rewardPoints: updated.rewardPoints,
      pendingReward: {
        name: updated.pendingReward.name,
        pointsCost: updated.pendingReward.pointsCost,
        benefitType: updated.pendingReward.benefitType,
      },
    });
  } catch (err) {
    next(err);
  }
}

// ——— Admin ———

export async function adminListRewardRules(req, res, next) {
  try {
    const rules = await RewardRule.find({}).sort({ sortOrder: 1, createdAt: -1 }).populate("products", "name _id").lean();
    res.json({ success: true, rules });
  } catch (err) {
    next(err);
  }
}

export async function adminCreateRewardRule(req, res, next) {
  try {
    const body = req.body || {};
    const doc = {
      name: String(body.name || "").trim() || "Reward",
      description: String(body.description || "").trim(),
      status: body.status === "Inactive" ? "Inactive" : "Active",
      pointsRequired: Math.max(1, Math.floor(Number(body.pointsRequired)) || 1),
      benefitType: body.benefitType === "free_shipping" ? "free_shipping" : "discount",
      discountType: body.discountType === "fixed" ? "fixed" : "percentage",
      discountValue: Math.max(0, Number(body.discountValue) || 0),
      maxDiscountAmount:
        body.maxDiscountAmount != null && body.maxDiscountAmount !== ""
          ? Math.max(0, Number(body.maxDiscountAmount))
          : null,
      minOrderSubtotal: Math.max(0, Number(body.minOrderSubtotal) || 0),
      products: Array.isArray(body.products)
        ? body.products.filter((id) => MONGO_ID.test(String(id)))
        : [],
      sortOrder: Math.floor(Number(body.sortOrder)) || 0,
    };
    if (doc.benefitType === "free_shipping") {
      doc.discountValue = 0;
    }
    const rule = await RewardRule.create(doc);
    const populated = await RewardRule.findById(rule._id).populate("products", "name _id").lean();
    res.status(201).json({ success: true, rule: populated });
  } catch (err) {
    next(err);
  }
}

export async function adminUpdateRewardRule(req, res, next) {
  try {
    const { id } = req.params;
    if (!MONGO_ID.test(id)) {
      return res.status(400).json({ success: false, message: "Invalid id" });
    }
    const rule = await RewardRule.findById(id);
    if (!rule) return res.status(404).json({ success: false, message: "Not found" });
    const body = req.body || {};
    if (body.name !== undefined) rule.name = String(body.name).trim() || rule.name;
    if (body.description !== undefined) rule.description = String(body.description).trim();
    if (body.status !== undefined) rule.status = body.status === "Inactive" ? "Inactive" : "Active";
    if (body.pointsRequired !== undefined) {
      rule.pointsRequired = Math.max(1, Math.floor(Number(body.pointsRequired)) || 1);
    }
    if (body.benefitType !== undefined) {
      rule.benefitType = body.benefitType === "free_shipping" ? "free_shipping" : "discount";
    }
    if (body.discountType !== undefined) {
      rule.discountType = body.discountType === "fixed" ? "fixed" : "percentage";
    }
    if (body.discountValue !== undefined) rule.discountValue = Math.max(0, Number(body.discountValue) || 0);
    if (body.maxDiscountAmount !== undefined) {
      rule.maxDiscountAmount =
        body.maxDiscountAmount === null || body.maxDiscountAmount === ""
          ? null
          : Math.max(0, Number(body.maxDiscountAmount));
    }
    if (body.minOrderSubtotal !== undefined) {
      rule.minOrderSubtotal = Math.max(0, Number(body.minOrderSubtotal) || 0);
    }
    if (body.products !== undefined) {
      rule.products = Array.isArray(body.products)
        ? body.products.filter((x) => MONGO_ID.test(String(x)))
        : [];
    }
    if (body.sortOrder !== undefined) rule.sortOrder = Math.floor(Number(body.sortOrder)) || 0;
    if (rule.benefitType === "free_shipping") rule.discountValue = 0;
    await rule.save();
    const populated = await RewardRule.findById(rule._id).populate("products", "name _id").lean();
    res.json({ success: true, rule: populated });
  } catch (err) {
    next(err);
  }
}

export async function adminDeleteRewardRule(req, res, next) {
  try {
    const { id } = req.params;
    if (!MONGO_ID.test(id)) {
      return res.status(400).json({ success: false, message: "Invalid id" });
    }
    await RewardRule.findByIdAndDelete(id);
    res.json({ success: true, message: "Deleted" });
  } catch (err) {
    next(err);
  }
}
