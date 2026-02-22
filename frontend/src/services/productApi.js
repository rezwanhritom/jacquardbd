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
 * Fetch a single product by slug or id (GET /api/products/:identifier).
 * @param {string} identifier - Product slug or MongoDB _id
 * @returns {Promise<{ success: boolean, product?: Object, message?: string }>}
 */
export async function getProduct(identifier) {
  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}/api/products/${encodeURIComponent(identifier)}`);

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    return {
      success: false,
      message: data.message || "Product not found",
      product: null,
    };
  }

  return {
    success: true,
    product: data.product || null,
  };
}

/**
 * Fetch products by gender (GET /api/products?gender=men|women).
 * @param {string} gender - "men" or "women"
 * @returns {Promise<{ success: boolean, products?: Array, message?: string }>}
 */
export async function getProductsByGender(gender) {
  const baseUrl = getBaseUrl();
  const params = new URLSearchParams({ gender: gender.toLowerCase() });
  const response = await fetch(`${baseUrl}/api/products?${params}`);

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    return {
      success: false,
      message: data.message || "Failed to load products",
      products: [],
    };
  }

  return {
    success: true,
    products: Array.isArray(data.products) ? data.products : [],
  };
}

/**
 * Fetch products by collection (GET /api/products/collection/:collectionName).
 * @param {string} collectionName - e.g. "new-arrivals", "sale", "featured"
 * @returns {Promise<{ success: boolean, products?: Array, message?: string }>}
 */
export async function getProductsByCollection(collectionName) {
  const baseUrl = getBaseUrl();
  const slug = encodeURIComponent(String(collectionName).toLowerCase().replace(/\s+/g, "-"));
  const response = await fetch(`${baseUrl}/api/products/collection/${slug}`);

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    return {
      success: false,
      message: data.message || "Failed to load products",
      products: [],
    };
  }

  return {
    success: true,
    products: Array.isArray(data.products) ? data.products : [],
  };
}

/**
 * Create a product via POST /api/products (JSON body).
 * @param {Object} payload - Product data (name, price, category, etc.)
 * @returns {Promise<{ success: boolean, product?: Object, message?: string, errors?: string[] }>}
 */
export async function createProduct(payload) {
  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}/api/products`, {
    method: "POST",
    credentials: "include",
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

/**
 * Upload product images to ImageKit and save URLs on the product.
 * Must be called after product is created. Requires admin auth (cookies).
 * @param {string} productId - MongoDB _id of the product
 * @param {File[]} files - Array of File objects (from input or ImageUpload state)
 * @returns {Promise<{ success: boolean, images?: string[], productImages?: string[], message?: string }>}
 */
export async function uploadProductImages(productId, files) {
  if (!productId || !files?.length) {
    return { success: false, message: "Product ID and at least one file required" };
  }
  const baseUrl = getBaseUrl();
  const formData = new FormData();
  files.forEach((file) => {
    if (file instanceof File) formData.append("images", file);
  });
  if (formData.getAll("images").length === 0) {
    return { success: false, message: "No valid files to upload" };
  }
  const response = await fetch(`${baseUrl}/api/images/upload/product/${productId}`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return {
      success: false,
      message: data.message || "Image upload failed",
    };
  }
  return {
    success: true,
    images: data.images,
    productImages: data.productImages,
    message: data.message,
  };
}
