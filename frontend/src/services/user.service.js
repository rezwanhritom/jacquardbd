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
 * POST /api/images/upload/profile — upload profile image (multipart form, field: "image").
 * Returns { success, url?, message }. On success, update user profile with url as avatar.
 */
export async function uploadProfileImage(file) {
  const baseUrl = getBaseUrl().replace(/\/$/, "");
  const formData = new FormData();
  formData.append("image", file);
  const res = await fetch(`${baseUrl}/api/images/upload/profile`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { success: false, url: null, message: data.message || "Failed to upload image" };
  }
  return { success: true, url: data.url, message: data.message };
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

/**
 * GET /api/users/admin/list — admin only. List all customers with order count and total spent.
 */
export async function getAdminCustomers() {
  const res = await userFetch("/admin/list");
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { success: false, customers: [], message: data.message || "Failed to load customers" };
  }
  return { success: true, customers: Array.isArray(data.customers) ? data.customers : [] };
}

/**
 * POST /api/users/admin — admin only. Create user. Body: { name, email, password, role? }.
 */
export async function createUserAdmin(payload) {
  const res = await userFetch("/admin", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { success: false, user: null, message: data.message || "Failed to create user" };
  }
  return { success: true, user: data.user, message: data.message };
}

/**
 * PUT /api/users/admin/:userId — admin only. Update user. Body: { name?, email?, password?, role? }.
 */
export async function updateUserAdmin(userId, payload) {
  const res = await userFetch(`/admin/${userId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { success: false, user: null, message: data.message || "Failed to update user" };
  }
  return { success: true, user: data.user, message: data.message };
}

/**
 * DELETE /api/users/admin/:userId — admin only. Delete a user.
 */
export async function deleteUserAdmin(userId) {
  const res = await userFetch(`/admin/${userId}`, { method: "DELETE" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { success: false, message: data.message || "Failed to delete user" };
  }
  return { success: true, message: data.message };
}
