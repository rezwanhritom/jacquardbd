/**
 * All known category / subcategory / sub-sub names (from category tree).
 * Used for search: "category exists but no products" and typo suggestions.
 */
function flattenTree(obj, out = new Set()) {
  if (!obj || typeof obj !== "object") return out;
  if (Array.isArray(obj)) {
    obj.filter(Boolean).forEach((s) => out.add(String(s).trim()));
    return out;
  }
  Object.entries(obj).forEach(([key, value]) => {
    const k = String(key).trim();
    if (k) out.add(k);
    if (value != null && typeof value === "object") {
      if (Array.isArray(value)) value.filter(Boolean).forEach((s) => out.add(String(s).trim()));
      else flattenTree(value, out);
    }
  });
  return out;
}

const TREE = {
  Male: {
    "Winter Wear": {
      Sweatshirts: [],
      Hoodies: [],
      Jackets: ["Leather Jacket", "Denim Jacket"],
    },
    "Summer Wear": ["Polo", "Oversized Polo", "T-Shirts", "Drop Shoulder T-Shirts"],
    "Regular Wear": ["Formal Shirt", "Casual Shirt", "Half Sleeve Shirt"],
    "Traditional Wear": ["Panjabi", "Fatua"],
    "Bottom Wear": ["Joggers", "Formal Pants", "Shorts", "Cargo Pants", "Pajama", "Jeans"],
    Innerwear: ["Underwear"],
  },
  Female: {
    "Winter Wear": {
      Sweatshirts: [],
      Hoodies: [],
      Jackets: ["Leather Jacket", "Denim Jacket"],
    },
    "Western Wear": ["Tops", "T-Shirts", "Long Shirt"],
    "Regular Wear": ["Half Sleeve Shirt"],
    "Traditional Wear": ["Kameez", "Kurti"],
  },
};

const knownCategoryNames = [...flattenTree(TREE)].filter(Boolean);
const knownCategoryLower = new Set(knownCategoryNames.map((s) => s.toLowerCase().trim()));

export function isKnownCategory(query) {
  const q = String(query || "").trim().toLowerCase();
  if (!q) return false;
  if (knownCategoryLower.has(q)) return true;
  return knownCategoryNames.some((c) => c.toLowerCase() === q);
}

export function getKnownCategoriesForTypo() {
  return knownCategoryNames;
}
