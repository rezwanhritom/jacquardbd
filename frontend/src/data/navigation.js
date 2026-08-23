import { categoryTree } from "./categoryTree";

/**
 * Keep category → subcategory → leaf hierarchy for the mega menu (no flattening).
 */
function mapCategoryValue(value) {
  if (Array.isArray(value)) {
    return value.filter(Boolean).map((label) => ({ label, children: [] }));
  }
  if (value && typeof value === "object") {
    return Object.entries(value).map(([label, v]) => ({
      label,
      children: Array.isArray(v) ? v.filter(Boolean) : [],
    }));
  }
  return [];
}

function buildMegaMenuFromCategoryTree(tree) {
  if (!tree || typeof tree !== "object") return [];
  return Object.entries(tree).map(([title, value], id) => ({
    id: id + 1,
    title,
    items: mapCategoryValue(value),
  }));
}

const megaMenuCategories = {
  Men: buildMegaMenuFromCategoryTree(categoryTree.Male),
  Women: buildMegaMenuFromCategoryTree(categoryTree.Female),
};

export const navigationData = {
  logo: "JACQUARD",
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
