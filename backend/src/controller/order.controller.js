import Order from "../models/Order.js";
import { ORDER_STATUS } from "../models/Order.js";

const ALLOWED_STATUSES = Object.values(ORDER_STATUS);

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
