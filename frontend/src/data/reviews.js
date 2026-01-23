// Mock reviews data
export const reviewsData = {
  1: [
    {
      id: 1,
      userName: "John Smith",
      rating: 5,
      date: "2024-01-15",
      comment: "Excellent quality! The fabric is premium and the fit is perfect. Highly recommend!",
      verified: true,
    },
    {
      id: 2,
      userName: "Sarah Johnson",
      rating: 4,
      date: "2024-01-10",
      comment: "Great polo shirt, very comfortable. Only minor issue is the sizing runs slightly large.",
      verified: true,
    },
    {
      id: 3,
      userName: "Michael Brown",
      rating: 5,
      date: "2024-01-05",
      comment: "Best polo I've ever owned. The quality is outstanding and it looks great.",
      verified: false,
    },
  ],
  2: [
    {
      id: 1,
      userName: "Emily Davis",
      rating: 5,
      date: "2024-01-12",
      comment: "Love this t-shirt! Soft, comfortable, and fits perfectly. Will definitely buy more.",
      verified: true,
    },
  ],
  3: [
    {
      id: 1,
      userName: "David Wilson",
      rating: 4,
      date: "2024-01-08",
      comment: "Great jacket, very stylish. The quality is good but could be a bit warmer.",
      verified: true,
    },
  ],
};

export const getReviewsForProduct = (productId) => {
  return reviewsData[productId] || [];
};

export const getAverageRating = (productId) => {
  const reviews = getReviewsForProduct(productId);
  if (reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
  return (sum / reviews.length).toFixed(1);
};
