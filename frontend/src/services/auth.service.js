/**
 * Auth API service. Uses credentials (cookies) for all requests.
 * Base URL from VITE_API_URL (e.g. http://localhost:5001).
 */

const getBaseUrl = () => {
  const url = import.meta.env.VITE_API_URL;
  if (url) return url.replace(/\/$/, "");
  return "http://localhost:5001";
};

const authFetch = (path, options = {}) => {
  const baseUrl = getBaseUrl();
  return fetch(`${baseUrl}/api/auth${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
};

/**
 * POST /api/auth/register
 * @param {{ name: string, email: string, password: string }} payload
 */
export async function register(payload) {
  const res = await authFetch("/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { success: false, message: data.message || "Registration failed", errors: data.errors };
  }
  return { success: true, user: data.user, message: data.message };
}

/**
 * POST /api/auth/login
 * @param {{ email: string, password: string }} payload
 */
export async function login(payload) {
  const res = await authFetch("/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { success: false, message: data.message || "Login failed" };
  }
  return { success: true, user: data.user, message: data.message };
}

/**
 * POST /api/auth/logout — clears cookie on server
 */
export async function logout() {
  const res = await authFetch("/logout", { method: "POST" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { success: false, message: data.message || "Logout failed" };
  }
  return { success: true, message: data.message };
}

/**
 * GET /api/auth/me — current user (requires valid cookie)
 */
export async function getMe() {
  const res = await authFetch("/me");
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { success: false, user: null };
  }
  return { success: true, user: data.user };
}
