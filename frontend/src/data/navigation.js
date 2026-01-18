export const navigationData = {
  logo: "JACQUARD",
  links: [
    { id: 1, label: "Home", path: "/" },
    { id: 2, label: "Men", path: "/men", hasMegaMenu: true },
    { id: 3, label: "Women", path: "/women", hasMegaMenu: true },
    { id: 4, label: "New Arrivals", path: "/new-arrivals" },
    { id: 5, label: "Sale", path: "/sale" },
  ],
  megaMenuCategories: {
    Men: [
      { id: 1, title: "T-Shirts & Polos", items: ["Classic T-Shirts", "Polo Shirts", "Long Sleeve Tees", "Henley Shirts"] },
      { id: 2, title: "Shirts", items: ["Dress Shirts", "Casual Shirts", "Oxford Shirts", "Denim Shirts"] },
      { id: 3, title: "Outerwear", items: ["Jackets", "Coats", "Blazers", "Hoodies"] },
      { id: 4, title: "Bottoms", items: ["Trousers", "Jeans", "Shorts", "Chinos"] },
    ],
    Women: [
      { id: 1, title: "Tops & Blouses", items: ["T-Shirts", "Blouses", "Shirts", "Tank Tops"] },
      { id: 2, title: "Dresses", items: ["Casual Dresses", "Evening Dresses", "Midi Dresses", "Maxi Dresses"] },
      { id: 3, title: "Outerwear", items: ["Jackets", "Coats", "Blazers", "Cardigans"] },
      { id: 4, title: "Bottoms", items: ["Trousers", "Jeans", "Skirts", "Shorts"] },
    ],
  },
  iconActions: [
    { id: 1, name: "search", label: "Search" },
    { id: 2, name: "wishlist", label: "Wishlist" },
    { id: 3, name: "cart", label: "Shopping Cart" },
    { id: 4, name: "profile", label: "Profile" },
  ],
};
