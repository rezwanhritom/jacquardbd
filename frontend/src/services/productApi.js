/**
 * Product API service.
 * Uses VITE_API_URL for backend base URL (no hardcoded URLs).
 */

const getBaseUrl = () => {
  const url = import.meta.env.VITE_API_URL;
  if (url) return url.replace(/\/$/, "");
  return "http://localhost:5001";
};

/**
 * Create a product via POST /api/products (JSON body).
 * @param {Object} payload - Product data (name, price, category, etc.)
 * @returns {Promise<{ success: boolean, product?: Object, message?: string, errors?: string[] }>}
 */
export async function createProduct(payload) {
  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}/api/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    return {
      success: false,
      message: data.message || "Failed to create product",
      errors: data.errors || [],
    };
  }

  return {
    success: true,
    product: data.product,
    message: data.message,
  };
}
