export const footerData = {
  brand: {
    name: "JACQUARD",
    tagline: "Elevating Style Since 2026",
    description: "Crafting premium fashion with timeless elegance and modern sophistication.",
  },
  columns: [
    {
      title: "Shop",
      links: [
        { id: 1, label: "Men's Collection", path: "/category/men" },
        { id: 2, label: "Women's Collection", path: "/category/women" },
        { id: 3, label: "New Arrivals", path: "/new-arrivals" },
        { id: 4, label: "Campaigns", path: "/campaigns" },
      ],
    },
    {
      title: "Company",
      links: [
        { id: 1, label: "About Us", path: "/about" },
        { id: 2, label: "Contact", path: "/contact" },
      ],
    },
    {
      title: "Support",
      links: [
        { id: 1, label: "Size Guide", path: "/size-guide" },
        { id: 2, label: "FAQs", path: "/faq" },
        { id: 3, label: "Store Locator", path: "/stores" },
        { id: 4, label: "Live Chat", path: "#", isLiveChat: true },
      ],
      phone: "+880 1712 345678",
    },
  ],
  legal: [
    { id: 1, label: "Privacy Policy", path: "/privacy" },
    { id: 2, label: "Terms of Service", path: "/terms" },
  ],
  copyright: "© 2026 JACQUARD. All rights reserved.",
};
