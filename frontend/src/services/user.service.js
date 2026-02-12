/**
 * User profile and account API. Uses credentials (cookies).
 * Base URL from VITE_API_URL.
 */

const getBaseUrl = () => {
  const url = import.meta.env.VITE_API_URL;
  if (url) return url.replace(/\/$/, "");
  return "http://localhost:5001";
};

const userFetch = (path, options = {}) => {
  const baseUrl = getBaseUrl();
  return fetch(`${baseUrl}/api/users${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
};

/**
 * GET /api/users/:userId — fetch profile (name, email, avatar, createdAt, updatedAt).
 */
export async function getProfile(userId) {
  const res = await userFetch(`/${userId}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { success: false, user: null, message: data.message || "Failed to load profile" };
  }
  return { success: true, user: data.user, message: data.message };
}

/**
 * PUT /api/users/:userId — update profile. Body: { name?, email?, avatar? }.
 */
export async function updateProfile(userId, payload) {
  const res = await userFetch(`/${userId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { success: false, user: null, message: data.message || "Failed to update profile" };
  }
  return { success: true, user: data.user, message: data.message };
}

/**
 * GET /api/users/:userId/wishlist — fetch user wishlist (populated products).
 */
export async function getUserWishlist(userId) {
  const res = await userFetch(`/${userId}/wishlist`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { success: false, wishlist: [], message: data.message || "Failed to load wishlist" };
  }
  return { success: true, wishlist: Array.isArray(data.wishlist) ? data.wishlist : [] };
}

/**
 * DELETE /api/users/:userId/wishlist/:productId — remove from wishlist.
 */
export async function removeFromUserWishlist(userId, productId) {
  const res = await userFetch(`/${userId}/wishlist/${productId}`, { method: "DELETE" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { success: false, wishlist: [], message: data.message || "Failed to remove" };
  }
  return { success: true, wishlist: Array.isArray(data.wishlist) ? data.wishlist : [], message: data.message };
}
