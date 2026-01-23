// Product filtering, sorting, and pagination utilities

export const filterProducts = (products, filters) => {
  if (!products) return [];

  return products.filter((product) => {
    // Price filter
    if (filters.priceRange) {
      const { min, max } = filters.priceRange;
      if (product.price < min || product.price > max) {
        return false;
      }
    }

    // Size filter (mock - in real app, products would have sizes)
    if (filters.sizes && filters.sizes.length > 0) {
      // For demo, we'll randomly assign sizes or skip this filter
      // In production, this would check product.sizes array
    }

    // Color filter (mock - in real app, products would have colors)
    if (filters.colors && filters.colors.length > 0) {
      // For demo, we'll skip this filter
      // In production, this would check product.colors array
    }

    return true;
  });
};

export const sortProducts = (products, sortOption) => {
  if (!products) return [];

  const sorted = [...products];

  switch (sortOption) {
    case "price-low":
      return sorted.sort((a, b) => a.price - b.price);
    case "price-high":
      return sorted.sort((a, b) => b.price - a.price);
    case "name-asc":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case "name-desc":
      return sorted.sort((a, b) => b.name.localeCompare(a.name));
    case "newest":
      // Assuming products with "New" badge are newest
      return sorted.sort((a, b) => {
        if (a.badge === "New" && b.badge !== "New") return -1;
        if (a.badge !== "New" && b.badge === "New") return 1;
        return 0;
      });
    default:
      return sorted;
  }
};

export const paginateProducts = (products, currentPage, itemsPerPage = 12) => {
  if (!products) return { paginatedProducts: [], totalPages: 0 };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = products.slice(startIndex, endIndex);
  const totalPages = Math.ceil(products.length / itemsPerPage);

  return { paginatedProducts, totalPages };
};
