/**
 * Cart API service. All requests use credentials (cookies).
 */

const getBaseUrl = () => {
  const url = import.meta.env.VITE_API_URL;
  if (url) return url.replace(/\/$/, "");
  return "http://localhost:5001";
};

const cartFetch = (path, options = {}) => {
  const baseUrl = getBaseUrl();
  return fetch(`${baseUrl}/api/cart${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
};

/**
 * GET /api/cart
 */
export async function getCart() {
  const res = await cartFetch("");
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { success: false, cart: [], message: data.message || "Failed to load cart" };
  return { success: true, cart: Array.isArray(data.cart) ? data.cart : [] };
}

/**
 * POST /api/cart/:productId
 * Body optional: { quantity: number }
 */
export async function addToCart(productId, quantity = 1) {
  const res = await cartFetch(`/${productId}`, {
    method: "POST",
    body: JSON.stringify({ quantity }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { success: false, cart: [], message: data.message || "Failed to add" };
  return { success: true, cart: Array.isArray(data.cart) ? data.cart : [], message: data.message };
}

/**
 * PUT /api/cart/:productId
 * Body: { quantity: number }
 */
export async function updateCartQuantity(productId, quantity) {
  const res = await cartFetch(`/${productId}`, {
    method: "PUT",
    body: JSON.stringify({ quantity }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { success: false, cart: [], message: data.message || "Failed to update" };
  return { success: true, cart: Array.isArray(data.cart) ? data.cart : [], message: data.message };
}

/**
 * DELETE /api/cart/:productId
 */
export async function removeFromCart(productId) {
  const res = await cartFetch(`/${productId}`, { method: "DELETE" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { success: false, cart: [], message: data.message || "Failed to remove" };
  return { success: true, cart: Array.isArray(data.cart) ? data.cart : [], message: data.message };
}

/**
 * POST /api/cart/merge
 * Body: { items: [{ productId: string, quantity: number }] }
 */
export async function mergeCart(items) {
  const res = await cartFetch("/merge", {
    method: "POST",
    body: JSON.stringify({ items }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { success: false, cart: [], message: data.message || "Failed to merge" };
  return { success: true, cart: Array.isArray(data.cart) ? data.cart : [], message: data.message };
}
