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
 * POST /api/orders — create order from cart. Body: { shippingAddress: { name, phone, address, city, state, zip }, shippingCost: number }.
 * Backend creates order and clears cart. Returns { success, order, orderId }.
 */
/**
 * POST /api/orders/guest — guest checkout (shopping cookies + server sets jacquard_guest_sid).
 */
export async function createGuestOrder(payload) {
  const baseUrl = getBaseUrl();
  const res = await fetch(`${baseUrl}/api/orders/guest`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { success: false, order: null, orderId: null, message: data.message || "Failed to place order" };
  }
  return { success: true, order: data.order, orderId: data.orderId ?? data.order?._id, message: data.message };
}

export async function getGuestOrders() {
  const baseUrl = getBaseUrl();
  const res = await fetch(`${baseUrl}/api/orders/guest/me`, { credentials: "include" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { success: false, orders: [], message: data.message || "Failed to load orders" };
  }
  return { success: true, orders: Array.isArray(data.orders) ? data.orders : [] };
}

export async function getGuestOrderById(orderId) {
  const baseUrl = getBaseUrl();
  const res = await fetch(`${baseUrl}/api/orders/guest/${orderId}`, { credentials: "include" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { success: false, order: null, message: data.message || "Order not found" };
  }
  return { success: true, order: data.order };
}

export async function createOrder(payload) {
  const baseUrl = getBaseUrl();
  const res = await fetch(`${baseUrl}/api/orders`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { success: false, order: null, orderId: null, message: data.message || "Failed to place order" };
  }
  return { success: true, order: data.order, orderId: data.orderId ?? data.order?._id, message: data.message };
}

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
 * GET /api/orders/admin/:id — single order for admin (same shape as user order detail).
 */
export async function getAdminOrderById(orderId) {
  const baseUrl = getBaseUrl();
  const res = await fetch(`${baseUrl}/api/orders/admin/${orderId}`, { credentials: "include" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { success: false, order: null, message: data.message || "Order not found" };
  }
  return { success: true, order: data.order };
}

/**
 * DELETE /api/orders/:id — admin only. Deletes the order.
 */
export async function deleteOrder(orderId) {
  const baseUrl = getBaseUrl();
  const res = await fetch(`${baseUrl}/api/orders/${orderId}`, {
    method: "DELETE",
    credentials: "include",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { success: false, message: data.message || "Failed to delete order" };
  }
  return { success: true, message: data.message };
}

/**
 * PUT /api/orders/:id — admin only. Update items and/or shippingAddress.
 * Body: { items?: [{ productId, name, quantity, price }], shippingAddress?: { name, phone, address, city, state, zip } }
 */
export async function updateOrder(orderId, payload) {
  const baseUrl = getBaseUrl();
  const res = await fetch(`${baseUrl}/api/orders/${orderId}`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { success: false, order: null, message: data.message || "Failed to update order" };
  }
  return { success: true, order: data.order, message: data.message };
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
