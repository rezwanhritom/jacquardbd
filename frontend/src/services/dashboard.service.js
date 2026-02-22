/**
 * Admin dashboard API. Uses credentials (cookies). Requires admin role.
 * Base URL from VITE_API_URL.
 */

const getBaseUrl = () => {
  const url = import.meta.env.VITE_API_URL;
  if (url) return url.replace(/\/$/, "");
  return "http://localhost:5001";
};

const dashboardFetch = (path, options = {}) => {
  const baseUrl = getBaseUrl();
  return fetch(`${baseUrl}/api/dashboard${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
};

/**
 * GET /api/dashboard — dashboard stats (KPIs, sales overview, top products, recent orders).
 * @returns {Promise<{ success: boolean, data?: object, message?: string }>}
 */
export async function getDashboardStats() {
  const res = await dashboardFetch("/");
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { success: false, data: null, message: data.message || "Failed to load dashboard" };
  }
  return { success: true, data: data.data, message: data.message };
}
