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
 * Fetch products by gender (GET /api/products?gender=men|women&section=&subcategory=).
 * @param {string} gender - "men" or "women"
 * @param {{ section?: string, subcategory?: string }} options - optional section/subcategory slugs
 * @returns {Promise<{ success: boolean, products?: Array, message?: string }>}
 */
export async function getProductsByGender(gender, options = {}) {
  const baseUrl = getBaseUrl();
  const params = new URLSearchParams({ gender: gender.toLowerCase() });
  if (options.section) params.set("section", options.section);
  if (options.subcategory) params.set("subcategory", options.subcategory);
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
 * Fetch homepage products: latest 8 new arrivals + top 8 best sellers (filled with latest if needed).
 * GET /api/products/home
 */
export async function getHomeProducts() {
  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}/api/products/home`);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return {
      success: false,
      newArrivals: [],
      bestSellers: [],
      shopBy: { men: null, women: null },
      message: data.message || "Failed to load",
    };
  }
  return {
    success: true,
    newArrivals: Array.isArray(data.newArrivals) ? data.newArrivals : [],
    bestSellers: Array.isArray(data.bestSellers) ? data.bestSellers : [],
    shopBy: {
      men: data.shopBy?.men || null,
      women: data.shopBy?.women || null,
    },
  };
}

/**
 * Mega menu photos for Men/Women (GET /api/products/nav).
 */
export async function getNavMenu() {
  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}/api/products/nav`);
  const data = await response.json().catch(() => ({}));
  const empty = { featured: [], sectionImages: {} };
  if (!response.ok) {
    return { success: false, men: empty, women: empty, message: data.message || "Failed to load" };
  }
  return {
    success: true,
    men: data.men || empty,
    women: data.women || empty,
  };
}

/**
 * Search products and categories (GET /api/products/search?q=...).
 * Returns { success, products, matchType: 'exact'|'fuzzy'|'none', suggestedQuery? }.
 */
export async function searchProducts(q) {
  const baseUrl = getBaseUrl();
  const query = typeof q === "string" ? q.trim() : "";
  const response = await fetch(`${baseUrl}/api/products/search?q=${encodeURIComponent(query)}`);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return {
      success: false,
      products: [],
      matchType: "none",
      suggestedQuery: null,
      categoryExists: false,
      message: data.message || "Search failed",
    };
  }
  return {
    success: true,
    products: Array.isArray(data.products) ? data.products : [],
    matchType: data.matchType || "none",
    suggestedQuery: data.suggestedQuery || null,
    categoryExists: data.categoryExists === true,
  };
}

/**
 * Fetch products by collection (GET /api/products/collection/:collectionName).
 * @param {string} collectionName - e.g. "new-arrivals", "sale", "campaigns"
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

/**
 * Fetch all products for admin (GET /api/products/admin/list). Requires admin auth.
 * @returns {Promise<{ success: boolean, products?: Array, message?: string }>}
 */
export async function getAdminProducts() {
  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}/api/products/admin/list`, {
    credentials: "include",
  });
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
 * Update a product (PUT /api/products/:id). Requires admin auth.
 * @param {string} productId - MongoDB _id
 * @param {Object} payload - Partial product data (name, category, originalPrice, discount, description, status, stockQuantity, images, etc.)
 */
export async function updateProduct(productId, payload) {
  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}/api/products/${productId}`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return {
      success: false,
      message: data.message || "Failed to update product",
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
 * Delete a product (DELETE /api/products/:id). Requires admin auth.
 * @param {string} productId - MongoDB _id
 */
export async function deleteProduct(productId) {
  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}/api/products/${productId}`, {
    method: "DELETE",
    credentials: "include",
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return {
      success: false,
      message: data.message || "Failed to delete product",
    };
  }
  return { success: true, message: data.message };
}
