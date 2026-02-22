import Order from "../models/Order.js";
import { ORDER_STATUS } from "../models/Order.js";
import User from "../models/User.js";

const ALLOWED_STATUSES = Object.values(ORDER_STATUS);
const PRODUCT_SELECT = "name price _id originalPrice discount finalPrice";

/**
 * POST /api/orders
 * Create order from current user's cart. Body: { shippingAddress: { name, phone, address, city, state, zip }, shippingCost: number }.
 * Creates order, clears user cart. Returns { order, orderId }.
 */
export async function createOrder(req, res, next) {
  try {
    const userId = req.user._id;
    const { shippingAddress, shippingCost = 0 } = req.body || {};

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

    const tax = Math.round(subtotal * 0.08 * 100) / 100;
    const shipping = Number(shippingCost) >= 0 ? Number(shippingCost) : 0;
    const amount = Math.round((subtotal + tax + shipping) * 100) / 100;

    const orderDoc = await Order.create({
      user: userId,
      amount,
      currency: "BDT",
      status: ORDER_STATUS.PENDING,
      items,
      shippingAddress: {
        name: shippingAddress?.name ?? "",
        phone: shippingAddress?.phone ?? "",
        address: shippingAddress?.address ?? "",
        city: shippingAddress?.city ?? "",
        state: shippingAddress?.state ?? "",
        zip: shippingAddress?.zip ?? "",
      },
    });

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
        createdAt: orderDoc.createdAt,
      },
      orderId: orderDoc._id,
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
      total: o.amount,
      currency: o.currency ?? "BDT",
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
        total: order.amount,
        currency: order.currency ?? "BDT",
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
      customer: o.user?.name ?? "Guest",
      email: o.user?.email ?? "",
      date: o.createdAt,
      status: o.status,
      total: o.amount,
      currency: o.currency,
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
 * Admin only. Update order status (e.g. cancel: set to cancelled).
 * Body: { status: "pending" | "paid" | "failed" | "cancelled" }
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

    const order = await Order.findByIdAndUpdate(id, { $set: { status } }, { new: true })
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
        total: order.amount,
        items: order.items,
      },
    });
  } catch (err) {
    next(err);
  }
}
