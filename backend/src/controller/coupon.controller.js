import Coupon from "../models/Coupon.js";
import Product from "../models/Product.js";
import {
  normalizeCouponCode,
  evaluateCouponForCart,
} from "../utils/couponApply.js";

const PRODUCT_SELECT = "name price _id originalPrice discount finalPrice";

function mapCoupon(c) {
  if (!c) return null;
  return {
    _id: c._id,
    code: c.code,
    name: c.name ?? "",
    description: c.description ?? "",
    status: c.status,
    startDate: c.startDate,
    endDate: c.endDate,
    discountType: c.discountType,
    discountValue: c.discountValue,
    maxDiscountAmount: c.maxDiscountAmount ?? null,
    minOrderSubtotal: c.minOrderSubtotal ?? 0,
    products: (c.products || []).map((id) => id?.toString?.() || id).filter(Boolean),
    usageLimit: c.usageLimit ?? null,
    usedCount: c.usedCount ?? 0,
    perUserLimit: c.perUserLimit ?? null,
    createdAt: c.createdAt,
  };
}

/**
 * POST /api/coupons/preview
 * Public. Body: { code, items: [{ productId, quantity }] } — prices from DB.
 */
export async function previewCoupon(req, res, next) {
  try {
    const { code, items: rawItems } = req.body || {};
    const normalized = normalizeCouponCode(code);
    if (!normalized) {
      return res.status(400).json({ success: false, message: "Enter a coupon code" });
    }
    if (!Array.isArray(rawItems) || rawItems.length === 0) {
      return res.status(400).json({ success: false, message: "Cart items required" });
    }

    const items = [];
    let subtotal = 0;
    for (const row of rawItems) {
      const pid = row.productId;
      const qty = Math.max(1, Math.floor(Number(row.quantity)) || 1);
      if (!pid) continue;
      const product = await Product.findById(pid).select(PRODUCT_SELECT).lean();
      if (!product) continue;
      const price = product.finalPrice ?? product.price ?? 0;
      items.push({
        productId: product._id,
        quantity: qty,
        price,
      });
      subtotal += price * qty;
    }

    if (items.length === 0) {
      return res.status(400).json({ success: false, message: "No valid products" });
    }

    const coupon = await Coupon.findOne({ code: normalized }).lean();
    const userId = req.user?._id;
    const guestSessionId = req.guestSessionId;

    const result = await evaluateCouponForCart(coupon, {
      items,
      subtotal,
      userId,
      guestSessionId,
    });

    if (!result.ok) {
      return res.status(400).json({ success: false, message: result.message });
    }

    const discount = result.discount;

    res.json({
      success: true,
      discount,
      subtotal,
      message: `৳${discount.toFixed(2)} off`,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getCoupons(req, res, next) {
  try {
    const list = await Coupon.find({}).sort({ createdAt: -1 }).lean();
    res.json({ success: true, coupons: list.map(mapCoupon) });
  } catch (err) {
    next(err);
  }
}

export async function createCoupon(req, res, next) {
  try {
    const body = req.body || {};
    const code = normalizeCouponCode(body.code);
    if (!code || code.length < 2) {
      return res.status(400).json({ success: false, message: "Coupon code is required (min 2 characters)" });
    }

    const exists = await Coupon.findOne({ code });
    if (exists) {
      return res.status(400).json({ success: false, message: "A coupon with this code already exists" });
    }

    const startDate = body.startDate ? new Date(body.startDate) : null;
    const endDate = body.endDate ? new Date(body.endDate) : null;
    if (!startDate || Number.isNaN(startDate.getTime())) {
      return res.status(400).json({ success: false, message: "Valid start date is required" });
    }
    if (!endDate || Number.isNaN(endDate.getTime())) {
      return res.status(400).json({ success: false, message: "Valid end date is required" });
    }

    const discountType = body.discountType === "fixed" ? "fixed" : "percentage";
    let discountValue = Number(body.discountValue);
    if (Number.isNaN(discountValue) || discountValue < 0) {
      return res.status(400).json({ success: false, message: "Valid discount value is required" });
    }
    if (discountType === "percentage" && discountValue > 100) {
      discountValue = 100;
    }

    const productIds = Array.isArray(body.products)
      ? body.products.filter((id) => id && String(id).match(/^[a-fA-F0-9]{24}$/))
      : [];

    const usageLimit =
      body.usageLimit === "" || body.usageLimit == null
        ? null
        : Math.max(1, Math.floor(Number(body.usageLimit)) || 1);
    const perUserLimit =
      body.perUserLimit === "" || body.perUserLimit == null
        ? null
        : Math.max(1, Math.floor(Number(body.perUserLimit)) || 1);
    const maxDiscountAmount =
      body.maxDiscountAmount === "" || body.maxDiscountAmount == null
        ? null
        : Math.max(0, Number(body.maxDiscountAmount) || 0);

    const doc = await Coupon.create({
      code,
      name: (body.name || "").trim(),
      description: (body.description || "").trim(),
      status: body.status === "Inactive" ? "Inactive" : "Active",
      startDate,
      endDate,
      discountType,
      discountValue,
      maxDiscountAmount: discountType === "percentage" ? maxDiscountAmount : null,
      minOrderSubtotal: Math.max(0, Number(body.minOrderSubtotal) || 0),
      products: productIds,
      usageLimit,
      usedCount: Math.max(0, Number(body.usedCount) || 0),
      perUserLimit,
    });

    res.status(201).json({ success: true, coupon: mapCoupon(doc.toObject()) });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: "Coupon code already exists" });
    }
    next(err);
  }
}

export async function updateCoupon(req, res, next) {
  try {
    const { id } = req.params;
    const body = req.body || {};
    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: "Coupon not found" });
    }

    if (body.code != null) {
      const code = normalizeCouponCode(body.code);
      if (code.length >= 2) {
        const clash = await Coupon.findOne({ code, _id: { $ne: id } });
        if (clash) {
          return res.status(400).json({ success: false, message: "Another coupon uses this code" });
        }
        coupon.code = code;
      }
    }
    if (body.name != null) coupon.name = String(body.name).trim();
    if (body.description != null) coupon.description = String(body.description).trim();
    if (body.status != null) coupon.status = body.status === "Inactive" ? "Inactive" : "Active";
    if (body.startDate) {
      const d = new Date(body.startDate);
      if (!Number.isNaN(d.getTime())) coupon.startDate = d;
    }
    if (body.endDate) {
      const d = new Date(body.endDate);
      if (!Number.isNaN(d.getTime())) coupon.endDate = d;
    }
    if (body.discountType != null) {
      coupon.discountType = body.discountType === "fixed" ? "fixed" : "percentage";
    }
    if (body.discountValue != null) {
      let v = Number(body.discountValue);
      if (!Number.isNaN(v) && v >= 0) {
        if (coupon.discountType === "percentage") v = Math.min(100, v);
        coupon.discountValue = v;
      }
    }
    if (body.maxDiscountAmount !== undefined) {
      coupon.maxDiscountAmount =
        body.maxDiscountAmount === "" || body.maxDiscountAmount == null
          ? null
          : Math.max(0, Number(body.maxDiscountAmount) || 0);
    }
    if (body.minOrderSubtotal != null) {
      coupon.minOrderSubtotal = Math.max(0, Number(body.minOrderSubtotal) || 0);
    }
    if (Array.isArray(body.products)) {
      coupon.products = body.products.filter((pid) => pid && String(pid).match(/^[a-fA-F0-9]{24}$/));
    }
    if (body.usageLimit !== undefined) {
      coupon.usageLimit =
        body.usageLimit === "" || body.usageLimit == null
          ? null
          : Math.max(1, Math.floor(Number(body.usageLimit)) || 1);
    }
    if (body.usedCount != null && req.user?.role === "admin") {
      coupon.usedCount = Math.max(0, Math.floor(Number(body.usedCount)) || 0);
    }
    if (body.perUserLimit !== undefined) {
      coupon.perUserLimit =
        body.perUserLimit === "" || body.perUserLimit == null
          ? null
          : Math.max(1, Math.floor(Number(body.perUserLimit)) || 1);
    }

    await coupon.save();
    res.json({ success: true, coupon: mapCoupon(coupon.toObject()) });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: "Coupon code already exists" });
    }
    next(err);
  }
}

export async function deleteCoupon(req, res, next) {
  try {
    const { id } = req.params;
    const deleted = await Coupon.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Coupon not found" });
    }
    res.json({ success: true, message: "Coupon deleted" });
  } catch (err) {
    next(err);
  }
}
