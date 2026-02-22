/**
 * Orders API. Uses credentials (cookies).
 * - getMyOrders / getMyOrderById: authenticated user (own orders).
 * - getAdminOrders / updateOrderStatus: admin only.
 */

const getBaseUrl = () => {
  const url = import.meta.env.VITE_API_URL;
  if (url) return url.replace(/\/$/, "");
  return "http://localhost:5001";
};

/**
 * GET /api/orders/me — current user's orders (newest first).
 */
export async function getMyOrders() {
  const baseUrl = getBaseUrl();
  const res = await fetch(`${baseUrl}/api/orders/me`, { credentials: "include" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { success: false, orders: [], message: data.message || "Failed to load orders" };
  }
  return { success: true, orders: Array.isArray(data.orders) ? data.orders : [] };
}

/**
 * GET /api/orders/me/:orderId — single order for current user.
 */
export async function getMyOrderById(orderId) {
  const baseUrl = getBaseUrl();
  const res = await fetch(`${baseUrl}/api/orders/me/${orderId}`, { credentials: "include" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { success: false, order: null, message: data.message || "Order not found" };
  }
  return { success: true, order: data.order };
}

export async function getAdminOrders() {
  const baseUrl = getBaseUrl();
  const res = await fetch(`${baseUrl}/api/orders/admin/list`, {
    credentials: "include",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { success: false, orders: [], message: data.message || "Failed to load orders" };
  }
  return { success: true, orders: Array.isArray(data.orders) ? data.orders : [] };
}

/**
 * Update order status. Body: { status: "pending" | "paid" | "failed" | "cancelled" }
 */
export async function updateOrderStatus(orderId, status) {
  const baseUrl = getBaseUrl();
  const res = await fetch(`${baseUrl}/api/orders/${orderId}/status`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { success: false, message: data.message || "Failed to update order status" };
  }
  return { success: true, order: data.order, message: data.message };
}
