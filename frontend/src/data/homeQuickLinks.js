/** Fast-shop shortcuts on the homepage. Paths match Navbar category routes. */
export const homeQuickLinks = [
  { id: "men", label: "Men", path: "/category/men" },
  { id: "women", label: "Women", path: "/category/women" },
  { id: "new", label: "New Arrivals", path: "/new-arrivals" },
  { id: "tees", label: "T-Shirts", path: "/category/men/summer-wear/t-shirts" },
  { id: "panjabi", label: "Panjabi", path: "/category/men/traditional-wear/panjabi" },
  { id: "jeans", label: "Jeans", path: "/category/men/bottom-wear/jeans" },
  { id: "hoodies", label: "Hoodies", path: "/category/men/winter-wear/hoodies" },
  { id: "kurti", label: "Kurtis", path: "/category/women/traditional-wear/kurti" },
  { id: "campaigns", label: "Campaigns", path: "/campaigns" },
];

export const homeDepartments = [
  {
    id: "men",
    title: "Men",
    subtitle: "Shop all menswear",
    path: "/category/men",
    image: "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=1400&q=80",
    featured: true,
  },
  {
    id: "women",
    title: "Women",
    subtitle: "Shop all womenswear",
    path: "/category/women",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1400&q=80",
    featured: true,
  },
  {
    id: "new",
    title: "New Arrivals",
    subtitle: "Just dropped",
    path: "/new-arrivals",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=900&q=80",
  },
  {
    id: "traditional",
    title: "Traditional",
    subtitle: "Panjabi & Kurti",
    path: "/category/men/traditional-wear",
    image: "https://images.unsplash.com/photo-1603252109303-2751441dd157?w=900&q=80",
  },
  {
    id: "summer",
    title: "T-Shirts",
    subtitle: "Everyday essentials",
    path: "/category/men/summer-wear/t-shirts",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=900&q=80",
  },
  {
    id: "campaigns",
    title: "Campaigns",
    subtitle: "Limited offers",
    path: "/campaigns",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=900&q=80",
  },
];
