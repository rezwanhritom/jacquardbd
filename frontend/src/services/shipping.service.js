/**
 * Shipping options API. GET is public; PUT is admin-only.
 */

const getBaseUrl = () => {
  const url = import.meta.env.VITE_API_URL;
  if (url) return url.replace(/\/$/, "");
  return "http://localhost:5001";
};

/**
 * GET /api/shipping — fetch shipping options (public).
 */
export async function getShippingOptions() {
  const baseUrl = getBaseUrl();
  const res = await fetch(`${baseUrl}/api/shipping`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { success: false, options: [], message: data.message || "Failed to load shipping options" };
  return { success: true, options: Array.isArray(data.options) ? data.options : [] };
}

/**
 * PUT /api/shipping — update shipping options (admin). Body: { options: [...] }
 */
export async function updateShippingOptions(options) {
  const baseUrl = getBaseUrl();
  const res = await fetch(`${baseUrl}/api/shipping`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ options }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { success: false, options: [], message: data.message || "Failed to update shipping" };
  return { success: true, options: Array.isArray(data.options) ? data.options : [] };
}
