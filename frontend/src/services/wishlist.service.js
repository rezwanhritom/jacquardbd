/**
 * Wishlist API service. All requests use credentials (cookies).
 * Base URL from VITE_API_URL.
 */

const getBaseUrl = () => {
  const url = import.meta.env.VITE_API_URL;
  if (url) return url.replace(/\/$/, "");
  return "http://localhost:5001";
};

const wishlistFetch = (path, options = {}) => {
  const baseUrl = getBaseUrl();
  return fetch(`${baseUrl}/api/wishlist${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
};

/**
 * GET /api/wishlist - fetch user's wishlist (populated products).
 */
export async function getWishlist() {
  const res = await wishlistFetch("");
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { success: false, wishlist: [], message: data.message || "Failed to load wishlist" };
  }
  return { success: true, wishlist: Array.isArray(data.wishlist) ? data.wishlist : [] };
}

/**
 * POST /api/wishlist/:productId - add product to wishlist.
 */
export async function addToWishlist(productId) {
  const res = await wishlistFetch(`/${productId}`, { method: "POST" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { success: false, wishlist: [], message: data.message || "Failed to add" };
  }
  return { success: true, wishlist: Array.isArray(data.wishlist) ? data.wishlist : [], message: data.message };
}

/**
 * DELETE /api/wishlist/:productId - remove from wishlist.
 */
export async function removeFromWishlist(productId) {
  const res = await wishlistFetch(`/${productId}`, { method: "DELETE" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { success: false, wishlist: [], message: data.message || "Failed to remove" };
  }
  return { success: true, wishlist: Array.isArray(data.wishlist) ? data.wishlist : [], message: data.message };
}

/**
 * POST /api/wishlist/merge - merge guest product IDs into user wishlist.
 * Body: { productIds: string[] }
 */
export async function mergeWishlist(productIds) {
  const res = await wishlistFetch("/merge", {
    method: "POST",
    body: JSON.stringify({ productIds }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { success: false, wishlist: [], message: data.message || "Failed to merge" };
  }
  return { success: true, wishlist: Array.isArray(data.wishlist) ? data.wishlist : [], message: data.message };
}
