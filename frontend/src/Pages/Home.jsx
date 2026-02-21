import { Hero, Newsletter, FeaturedBanner, ProductCarousel, Membership } from "../components";
import { productsData } from "../data/products";

const Home = () => {
  // Filter products for different sections
  const newArrivals = productsData.filter((p) => p.badge === "New" || p.id === 2 || p.id === 6 || p.id === 8).slice(0, 8);
  const bestSellers = productsData.filter((p) => p.badge === "Best Seller" || p.id === 1 || p.id === 3 || p.id === 5).slice(0, 8);

  return (
    <>
      {/* Hero Section with Animated Entrance */}
      <Hero />

      {/* Featured Collection Banner */}
      <FeaturedBanner />

      {/* New Arrivals Carousel */}
      <ProductCarousel
        title="New Arrivals"
        subtitle="Discover the latest additions to our collection"
        products={newArrivals}
        showViewAll={true}
      />

      {/* Best Sellers Carousel */}
      <ProductCarousel
        title="Best Sellers"
        subtitle="Our most loved pieces, handpicked for you"
        products={bestSellers}
        showViewAll={true}
      />

      {/* Membership Promotion Section */}
      <Membership />

      {/* Newsletter Signup */}
      <Newsletter />
    </>
  );
};

export default Home;
