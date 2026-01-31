/**
 * Gender-based category tree for cascading dropdowns.
 * Structure: Gender -> Category -> Subcategory (object or array of leaf items).
 * Empty array [] = no children; array of strings = final options.
 */
export const categoryTree = {
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
