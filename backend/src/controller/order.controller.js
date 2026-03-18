import Order from "../models/Order.js";
import { ORDER_STATUS, PAYMENT_STATUS } from "../models/Order.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import Coupon from "../models/Coupon.js";
import {
  normalizeCouponCode,
  evaluateCouponForCart,
  claimCouponSlot,
  releaseCouponSlot,
} from "../utils/couponApply.js";

/** Recalculate order amount from items (subtotal + 8% tax). */
function recalcAmount(items) {
  let subtotal = 0;
  for (const item of items || []) {
    const qty = Math.max(1, Number(item.quantity) || 1);
    const price = Number(item.price) || 0;
    subtotal += price * qty;
  }
  const tax = Math.round(subtotal * 0.08 * 100) / 100;
  return Math.round((subtotal + tax) * 100) / 100;
}

/** Admin can set only these fulfillment statuses. */
const ALLOWED_STATUSES = [
  ORDER_STATUS.PENDING,
  ORDER_STATUS.CANCELLED,
  ORDER_STATUS.CONFIRMED,
  ORDER_STATUS.SHIPPED,
  ORDER_STATUS.DELIVERED,
];
const PRODUCT_SELECT = "name price _id originalPrice discount finalPrice";

/**
 * POST /api/orders
 * Create order from current user's cart. Body: { shippingAddress: { name, phone, address, city, state, zip }, shippingCost: number }.
 * Creates order, clears user cart. Returns { order, orderId }.
 */
export async function createOrder(req, res, next) {
  try {
    const userId = req.user._id;
    const { shippingAddress, shippingCost = 0, couponCode: rawCoupon } = req.body || {};

    const user = await User.findById(userId).populate({ path: "cart.product", select: PRODUCT_SELECT }).lean();
    if (!user) return res.status(401).json({ success: false, message: "User not found" });

    const cart = user.cart || [];
    if (cart.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    const items = [];
    let subtotal = 0;
    for (const entry of cart) {
      const product = entry.product;
      if (!product) continue;
      const price = product.finalPrice ?? product.price ?? 0;
      const qty = Math.max(1, Math.floor(Number(entry.quantity)) || 1);
      items.push({
        productId: product._id,
        name: product.name || "Product",
        quantity: qty,
        price,
      });
      subtotal += price * qty;
    }

    if (items.length === 0) {
      return res.status(400).json({ success: false, message: "No valid cart items" });
    }

    const shipping = Number(shippingCost) >= 0 ? Number(shippingCost) : 0;

    let couponDiscount = 0;
    let couponCodeStored = "";
    let claimedCouponId = null;

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
        if (!ev.ok) {
          return res.status(400).json({ success: false, message: ev.message });
        }
        const claimed = await claimCouponSlot(coupon._id, coupon.usageLimit);
        if (!claimed) {
          return res.status(400).json({
            success: false,
            message: "This coupon is no longer available",
          });
        }
        claimedCouponId = coupon._id;
        couponDiscount = ev.discount;
        couponCodeStored = norm;
      }
    }

    const afterDiscount = Math.round((subtotal - couponDiscount) * 100) / 100;
    const tax = Math.round(afterDiscount * 0.08 * 100) / 100;
    const amount = Math.round((afterDiscount + tax + shipping) * 100) / 100;

    let orderDoc;
    try {
      orderDoc = await Order.create({
        user: userId,
        amount,
        currency: "BDT",
        status: ORDER_STATUS.PENDING,
        items,
        couponCode: couponCodeStored,
        couponDiscount,
        shippingAddress: {
          name: shippingAddress?.name ?? "",
          phone: shippingAddress?.phone ?? "",
          address: shippingAddress?.address ?? "",
          city: shippingAddress?.city ?? "",
          state: shippingAddress?.state ?? "",
          zip: shippingAddress?.zip ?? "",
        },
      });
    } catch (createErr) {
      if (claimedCouponId) await releaseCouponSlot(claimedCouponId);
      throw createErr;
    }

    await User.findByIdAndUpdate(userId, { $set: { cart: [] } });

    const orderId = `ORD-${String(orderDoc._id).slice(-10).toUpperCase()}`;
    res.status(201).json({
      success: true,
      order: {
        _id: orderDoc._id,
        orderId,
        amount: orderDoc.amount,
        currency: orderDoc.currency,
        status: orderDoc.status,
        items: orderDoc.items,
        shippingAddress: orderDoc.shippingAddress,
        couponCode: orderDoc.couponCode || "",
        couponDiscount: orderDoc.couponDiscount ?? 0,
        createdAt: orderDoc.createdAt,
      },
      orderId: orderDoc._id,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/orders/guest
 * Body: { items: [{ productId, quantity }], shippingAddress, shippingCost?, guestEmail? }
 */
export async function createGuestOrder(req, res, next) {
  try {
    const guestSessionId = req.guestSessionId;
    if (!guestSessionId) {
      return res.status(400).json({ success: false, message: "Guest session required" });
    }

    const {
      items: rawItems,
      shippingAddress,
      shippingCost = 0,
      guestEmail = "",
      couponCode: rawCoupon,
    } = req.body || {};
    if (!Array.isArray(rawItems) || rawItems.length === 0) {
      return res.status(400).json({ success: false, message: "Cart items are required" });
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
        name: product.name || "Product",
        quantity: qty,
        price,
      });
      subtotal += price * qty;
    }

    if (items.length === 0) {
      return res.status(400).json({ success: false, message: "No valid products in order" });
    }

    const shipping = Number(shippingCost) >= 0 ? Number(shippingCost) : 0;

    let couponDiscount = 0;
    let couponCodeStored = "";
    let claimedCouponId = null;

    if (rawCoupon && String(rawCoupon).trim()) {
      const norm = normalizeCouponCode(rawCoupon);
      if (norm) {
        const coupon = await Coupon.findOne({ code: norm }).lean();
        const ev = await evaluateCouponForCart(coupon, {
          items,
          subtotal,
          userId: null,
          guestSessionId,
        });
        if (!ev.ok) {
          return res.status(400).json({ success: false, message: ev.message });
        }
        const claimed = await claimCouponSlot(coupon._id, coupon.usageLimit);
        if (!claimed) {
          return res.status(400).json({
            success: false,
            message: "This coupon is no longer available",
          });
        }
        claimedCouponId = coupon._id;
        couponDiscount = ev.discount;
        couponCodeStored = norm;
      }
    }

    const afterDiscount = Math.round((subtotal - couponDiscount) * 100) / 100;
    const tax = Math.round(afterDiscount * 0.08 * 100) / 100;
    const amount = Math.round((afterDiscount + tax + shipping) * 100) / 100;

    let orderDoc;
    try {
      orderDoc = await Order.create({
        user: null,
        guestSessionId,
        guestEmail: String(guestEmail || "").trim().slice(0, 320),
        amount,
        currency: "BDT",
        status: ORDER_STATUS.PENDING,
        items,
        couponCode: couponCodeStored,
        couponDiscount,
        shippingAddress: {
          name: shippingAddress?.name ?? "",
          phone: shippingAddress?.phone ?? "",
          address: shippingAddress?.address ?? "",
          city: shippingAddress?.city ?? "",
          state: shippingAddress?.state ?? "",
          zip: shippingAddress?.zip ?? "",
        },
      });
    } catch (createErr) {
      if (claimedCouponId) await releaseCouponSlot(claimedCouponId);
      throw createErr;
    }

    res.status(201).json({
      success: true,
      order: {
        _id: orderDoc._id,
        orderId: `ORD-${String(orderDoc._id).slice(-10).toUpperCase()}`,
        amount: orderDoc.amount,
        currency: orderDoc.currency,
        status: orderDoc.status,
        items: orderDoc.items,
        shippingAddress: orderDoc.shippingAddress,
        couponCode: orderDoc.couponCode || "",
        couponDiscount: orderDoc.couponDiscount ?? 0,
        createdAt: orderDoc.createdAt,
      },
      orderId: orderDoc._id,
    });
  } catch (err) {
    next(err);
  }
}

function mapGuestOrderList(o) {
  return {
    _id: o._id,
    orderId: `ORD-${String(o._id).slice(-10).toUpperCase()}`,
    date: o.createdAt,
    status: o.status,
    paymentStatus:
      o.paymentStatus ??
      (o.status === "paid"
        ? PAYMENT_STATUS.PAID
        : o.status === "cancelled"
          ? PAYMENT_STATUS.CANCELLED
          : PAYMENT_STATUS.PENDING),
    total: o.amount,
    currency: o.currency ?? "BDT",
    couponCode: o.couponCode || "",
    couponDiscount: o.couponDiscount ?? 0,
    items: (o.items || []).map((item) => ({
      productId: item.productId,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
    })),
    shippingAddress: o.shippingAddress,
  };
}

export async function getGuestOrders(req, res, next) {
  try {
    const guestSessionId = req.guestSessionId;
    if (!guestSessionId) {
      return res.json({ success: true, orders: [] });
    }
    const orders = await Order.find({ guestSessionId, user: null })
      .sort({ createdAt: -1 })
      .lean();
    res.json({
      success: true,
      orders: orders.map(mapGuestOrderList),
    });
  } catch (err) {
    next(err);
  }
}

export async function getGuestOrderById(req, res, next) {
  try {
    const guestSessionId = req.guestSessionId;
    if (!guestSessionId) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    const { orderId } = req.params;
    const order = await Order.findOne({
      _id: orderId,
      guestSessionId,
      user: null,
    }).lean();
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    res.json({
      success: true,
      order: {
        _id: order._id,
        orderId: `ORD-${String(order._id).slice(-10).toUpperCase()}`,
        date: order.createdAt,
        status: order.status,
        paymentStatus:
          order.paymentStatus ??
          (order.status === "paid"
            ? PAYMENT_STATUS.PAID
            : order.status === "cancelled"
              ? PAYMENT_STATUS.CANCELLED
              : PAYMENT_STATUS.PENDING),
        total: order.amount,
        currency: order.currency ?? "BDT",
        couponCode: order.couponCode || "",
        couponDiscount: order.couponDiscount ?? 0,
        items: order.items || [],
        shippingAddress: order.shippingAddress,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/orders/me
 * Authenticated user only. Returns current user's orders, newest first.
 */
export async function getMyOrders(req, res, next) {
  try {
    const userId = req.user._id;
    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .lean();

    const list = orders.map((o) => ({
      _id: o._id,
      orderId: `ORD-${String(o._id).slice(-10).toUpperCase()}`,
      date: o.createdAt,
      status: o.status,
      paymentStatus: o.paymentStatus ?? (o.status === "paid" ? PAYMENT_STATUS.PAID : o.status === "cancelled" ? PAYMENT_STATUS.CANCELLED : PAYMENT_STATUS.PENDING),
      total: o.amount,
      currency: o.currency ?? "BDT",
      couponCode: o.couponCode || "",
      couponDiscount: o.couponDiscount ?? 0,
      items: (o.items || []).map((item) => ({
        productId: item.productId,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
      shippingAddress: o.shippingAddress,
    }));

    res.json({ success: true, orders: list });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/orders/me/:orderId
 * Authenticated user only. Returns single order if it belongs to current user.
 */
export async function getMyOrderById(req, res, next) {
  try {
    const { orderId } = req.params;
    const userId = req.user._id;

    const order = await Order.findOne({ _id: orderId, user: userId }).lean();
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.json({
      success: true,
      order: {
        _id: order._id,
        orderId: `ORD-${String(order._id).slice(-10).toUpperCase()}`,
        date: order.createdAt,
        status: order.status,
        paymentStatus: order.paymentStatus ?? (order.status === "paid" ? PAYMENT_STATUS.PAID : order.status === "cancelled" ? PAYMENT_STATUS.CANCELLED : PAYMENT_STATUS.PENDING),
        total: order.amount,
        currency: order.currency ?? "BDT",
        couponCode: order.couponCode || "",
        couponDiscount: order.couponDiscount ?? 0,
        items: order.items || [],
        shippingAddress: order.shippingAddress,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/orders/admin/list
 * Admin only. Returns all orders with user populated, newest first.
 */
export async function getAdminOrders(req, res, next) {
  try {
    const orders = await Order.find({})
      .sort({ createdAt: -1 })
      .populate("user", "name email")
      .lean();

    const list = orders.map((o) => ({
      _id: o._id,
      orderId: `ORD-${String(o._id).slice(-10).toUpperCase()}`,
      customer: o.user?.name ?? (o.guestSessionId ? "Guest checkout" : "Guest"),
      email: o.user?.email ?? o.guestEmail ?? "",
      isGuestOrder: !o.user && !!o.guestSessionId,
      date: o.createdAt,
      status: o.status,
      paymentStatus: o.paymentStatus ?? (o.status === "paid" ? PAYMENT_STATUS.PAID : o.status === "cancelled" ? PAYMENT_STATUS.CANCELLED : PAYMENT_STATUS.PENDING),
      total: o.amount,
      currency: o.currency,
      couponCode: o.couponCode || "",
      couponDiscount: o.couponDiscount ?? 0,
      items: (o.items || []).map((item) => ({
        productId: item.productId,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
      shippingAddress: o.shippingAddress,
    }));

    res.json({ success: true, orders: list });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/orders/:id/status
 * Admin only. Update order status (pending, cancelled, confirmed, shipped, delivered).
 * When status is set to "delivered", paymentStatus is set to "paid".
 * Body: { status: "pending" | "cancelled" | "confirmed" | "shipped" | "delivered" }
 */
export async function updateOrderStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Valid status required",
        allowed: ALLOWED_STATUSES,
      });
    }

    const update = { status };
    if (status === ORDER_STATUS.DELIVERED) {
      update.paymentStatus = PAYMENT_STATUS.PAID;
    } else if (status === ORDER_STATUS.CANCELLED) {
      update.paymentStatus = PAYMENT_STATUS.CANCELLED;
    } else {
      update.paymentStatus = PAYMENT_STATUS.PENDING;
    }

    const order = await Order.findByIdAndUpdate(id, { $set: update }, { new: true })
      .populate("user", "name email")
      .lean();

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.json({
      success: true,
      message: "Order status updated",
      order: {
        _id: order._id,
        orderId: `ORD-${String(order._id).slice(-10).toUpperCase()}`,
        customer: order.user?.name ?? "Guest",
        email: order.user?.email ?? "",
        date: order.createdAt,
        status: order.status,
        paymentStatus: order.paymentStatus ?? (order.status === "paid" ? PAYMENT_STATUS.PAID : order.status === "cancelled" ? PAYMENT_STATUS.CANCELLED : PAYMENT_STATUS.PENDING),
        total: order.amount,
        items: order.items,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/orders/admin/:id
 * Admin only. Returns single order (same shape as user order detail).
 */
export async function getAdminOrderById(req, res, next) {
  try {
    const { id } = req.params;
    const order = await Order.findById(id).populate("user", "name email").lean();
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    res.json({
      success: true,
      order: {
        _id: order._id,
        orderId: `ORD-${String(order._id).slice(-10).toUpperCase()}`,
        customer: order.user?.name ?? "Guest",
        email: order.user?.email ?? "",
        date: order.createdAt,
        status: order.status,
        paymentStatus: order.paymentStatus ?? (order.status === "paid" ? PAYMENT_STATUS.PAID : order.status === "cancelled" ? PAYMENT_STATUS.CANCELLED : PAYMENT_STATUS.PENDING),
        total: order.amount,
        currency: order.currency ?? "BDT",
        couponCode: order.couponCode || "",
        couponDiscount: order.couponDiscount ?? 0,
        items: order.items || [],
        shippingAddress: order.shippingAddress,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/orders/:id
 * Admin only. Deletes an order.
 */
export async function deleteOrder(req, res, next) {
  try {
    const { id } = req.params;
    const order = await Order.findByIdAndDelete(id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    res.json({ success: true, message: "Order deleted" });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/orders/:id
 * Admin only. Update order items (quantity) and/or shippingAddress. Recalculates amount from items.
 * Body: { items?: [{ productId, name, quantity, price }], shippingAddress?: { name, phone, address, city, state, zip } }
 */
export async function updateOrder(req, res, next) {
  try {
    const { id } = req.params;
    const { items, shippingAddress } = req.body || {};
    const order = await Order.findById(id).lean();
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const update = {};
    if (Array.isArray(items) && items.length > 0) {
      const validItems = items.map((item) => ({
        productId: item.productId ?? order.items?.[0]?.productId,
        name: item.name ?? "Product",
        quantity: Math.max(1, Math.floor(Number(item.quantity)) || 1),
        price: Number(item.price) ?? 0,
      }));
      update.items = validItems;
      update.amount = recalcAmount(validItems);
    }
    if (shippingAddress && typeof shippingAddress === "object") {
      update.shippingAddress = {
        name: shippingAddress.name ?? order.shippingAddress?.name ?? "",
        phone: shippingAddress.phone ?? order.shippingAddress?.phone ?? "",
        address: shippingAddress.address ?? order.shippingAddress?.address ?? "",
        city: shippingAddress.city ?? order.shippingAddress?.city ?? "",
        state: shippingAddress.state ?? order.shippingAddress?.state ?? "",
        zip: shippingAddress.zip ?? order.shippingAddress?.zip ?? "",
      };
    }

    const updated = await Order.findByIdAndUpdate(id, { $set: update }, { new: true })
      .populate("user", "name email")
      .lean();

    res.json({
      success: true,
      message: "Order updated",
      order: {
        _id: updated._id,
        orderId: `ORD-${String(updated._id).slice(-10).toUpperCase()}`,
        customer: updated.user?.name ?? "Guest",
        email: updated.user?.email ?? "",
        date: updated.createdAt,
        status: updated.status,
        paymentStatus: updated.paymentStatus ?? (updated.status === "paid" ? PAYMENT_STATUS.PAID : updated.status === "cancelled" ? PAYMENT_STATUS.CANCELLED : PAYMENT_STATUS.PENDING),
        total: updated.amount,
        currency: updated.currency ?? "BDT",
        couponCode: updated.couponCode || "",
        couponDiscount: updated.couponDiscount ?? 0,
        items: updated.items || [],
        shippingAddress: updated.shippingAddress,
      },
    });
  } catch (err) {
    next(err);
  }
}
