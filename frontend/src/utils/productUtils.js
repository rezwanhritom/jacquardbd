/**
 * Product filtering, sorting, pagination, and category/display helpers.
 * Used by Category page, ProductCard, and product list views.
 */

/** Level-2 category from product (e.g. "Winter Wear"). Used for section grouping on category page. */
export function getLevel2Category(product) {
  const path = product?.categoryPath;
  if (Array.isArray(path) && path[1]) return path[1].trim();
  const cat = product?.category;
  if (typeof cat === "string") {
    const parts = cat.split(">").map((s) => s.trim()).filter(Boolean);
    if (parts[1]) return parts[1];
  }
  return "Other";
}

/** Level-3 subcategory (e.g. "Sweatshirts"). For grouping under section. */
export function getLevel3Category(product) {
  const path = product?.categoryPath;
  if (Array.isArray(path) && path.length > 0) {
    if (path.length >= 3) return path[2].trim();
    return path[path.length - 1].trim();
  }
  const cat = product?.category;
  if (typeof cat === "string") {
    const parts = cat.split(">").map((s) => s.trim()).filter(Boolean);
    if (parts.length >= 3) return parts[2];
    if (parts.length >= 1) return parts[parts.length - 1];
  }
  return "Other";
}

/** Convert display name to URL slug: "Winter Wear" -> "winter-wear". */
export function toCategorySlug(name) {
  if (!name || typeof name !== "string") return "";
  return name.trim().toLowerCase().replace(/\s+/g, "-");
}

/** Display category for cards: 3rd level (e.g. "Oversized Polo") or last segment, else full string. */
export function getDisplayCategory(product) {
  const path = product?.categoryPath;
  if (Array.isArray(path) && path.length > 0) {
    if (path.length >= 3) return path[2].trim();
    return path[path.length - 1].trim();
  }
  const cat = product?.category;
  if (typeof cat === "string") {
    const parts = cat.split(">").map((s) => s.trim()).filter(Boolean);
    if (parts.length >= 3) return parts[2];
    if (parts.length >= 1) return parts[parts.length - 1];
  }
  return cat ?? "";
}

/** Whether to show original price with strikethrough (only when there is a real discount). */
export function hasDiscount(product) {
  if (!product) return false;
  const price = product.finalPrice ?? product.price ?? 0;
  return (
    (product.discount != null && Number(product.discount) > 0) ||
    (product.originalPrice != null && Number(product.originalPrice) > price)
  );
}

/** Normalize API product to shape expected by ProductCard (id, images, name, price, badge, slug). Preserve _id for cart/wishlist API. */
export function mapApiProduct(p) {
  const id = p._id != null ? String(p._id) : (p.id != null ? String(p.id) : undefined);
  return {
    ...p,
    _id: id || p._id,
    id,
    images: Array.isArray(p.images) && p.images.length > 0 ? p.images : ["/images/product-placeholder.png"],
    name: p.name || "",
    price: p.finalPrice ?? p.price ?? 0,
    originalPrice: p.originalPrice ?? null,
    discount: p.discount ?? 0,
    badge: p.badge || (Array.isArray(p.tags) && p.tags?.[0]) || undefined,
    slug: p.slug || "",
  };
}

export function filterProducts(products, filters) {
  if (!products) return [];
  return products.filter((product) => {
    if (filters.priceRange) {
      const { min, max } = filters.priceRange;
      const price = product.price ?? 0;
      const minSet = min !== "" && min != null && !Number.isNaN(Number(min));
      const maxSet = max !== "" && max != null && !Number.isNaN(Number(max));
      if (minSet && price < Number(min)) return false;
      if (maxSet && price > Number(max)) return false;
    }
    return true;
  });
}

export function sortProducts(products, sortOption) {
  if (!products) return [];
  const sorted = [...products];
  switch (sortOption) {
    case "price-low":
      return sorted.sort((a, b) => a.price - b.price);
    case "price-high":
      return sorted.sort((a, b) => b.price - a.price);
    case "name-asc":
      return sorted.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    case "name-desc":
      return sorted.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
    case "newest":
      return sorted.sort((a, b) => {
        if (a.badge === "New" && b.badge !== "New") return -1;
        if (a.badge !== "New" && b.badge === "New") return 1;
        return 0;
      });
    default:
      return sorted;
  }
}

export function paginateProducts(products, currentPage, itemsPerPage = 12) {
  if (!products) return { paginatedProducts: [], totalPages: 0 };
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = products.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(products.length / itemsPerPage);
  return { paginatedProducts, totalPages };
}

/**
 * Category brick layout: alternating pair row (up to 2, edge-to-edge) then single full-width row.
 * 1 product → one “pair” row (full width); 2 → pair; 3 → pair + single; 4 → pair + single + single-wide pair row; 5 → pair + single + pair; etc.
 */
export function chunkProductsBrick21(products) {
  if (!products?.length) return [];
  const rows = [];
  let i = 0;
  let pairPhase = true;
  while (i < products.length) {
    if (pairPhase) {
      const take = Math.min(2, products.length - i);
      rows.push({ type: "pair", items: products.slice(i, i + take) });
      i += take;
    } else {
      rows.push({ type: "single", items: [products[i]] });
      i += 1;
    }
    pairPhase = !pairPhase;
  }
  return rows;
}
