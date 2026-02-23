import { categoryTree } from "./categoryTree";

/**
 * Flatten a category value into a list of item labels for the mega menu.
 * Object -> [keys, ...child array items]; Array -> items as-is.
 */
function flattenCategoryItems(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (value && typeof value === "object") {
    const keys = Object.keys(value);
    const items = [...keys];
    keys.forEach((k) => {
      const v = value[k];
      if (Array.isArray(v) && v.length) items.push(...v);
    });
    return items;
  }
  return [];
}

/**
 * Build mega menu sections from category tree (Male/Female) for nav (Men/Women).
 */
function buildMegaMenuFromCategoryTree(tree) {
  if (!tree || typeof tree !== "object") return [];
  return Object.entries(tree).map(([title, value], id) => ({
    id: id + 1,
    title,
    items: flattenCategoryItems(value),
  }));
}

const megaMenuCategories = {
  Men: buildMegaMenuFromCategoryTree(categoryTree.Male),
  Women: buildMegaMenuFromCategoryTree(categoryTree.Female),
};

export const navigationData = {
  logo: "jacquardbd",
  links: [
    { id: 1, label: "Home", path: "/" },
    { id: 2, label: "Men", path: "/category/men", hasMegaMenu: true },
    { id: 3, label: "Women", path: "/category/women", hasMegaMenu: true },
    { id: 4, label: "New Arrivals", path: "/new-arrivals" },
    { id: 5, label: "Campaigns", path: "/campaigns" },
  ],
  megaMenuCategories,
  iconActions: [
    { id: 1, name: "search", label: "Search" },
    { id: 2, name: "wishlist", label: "Wishlist" },
    { id: 3, name: "cart", label: "Shopping Cart" },
    { id: 4, name: "profile", label: "Profile" },
  ],
};
