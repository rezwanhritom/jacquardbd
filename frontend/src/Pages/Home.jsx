import { Hero, Newsletter, FeaturedBanner, HomeProductShowcase, Membership, SectionBar } from "../components";
import { productsData } from "../data/products";
import { footerData } from "../data/footer";

const Home = () => {
  const newArrivals = productsData.filter((p) => p.badge === "New" || p.id === 2 || p.id === 6 || p.id === 8).slice(0, 2);
  const bestSellers = productsData.filter((p) => p.badge === "Best Seller" || p.id === 1 || p.id === 3 || p.id === 5).slice(0, 2);

  return (
    <>
      <Hero />

      <SectionBar variant="motto" text={footerData.brand.tagline} />

      <FeaturedBanner />

      <SectionBar variant="section" title="New Arrivals" />
      <HomeProductShowcase products={newArrivals} />
      <SectionBar variant="viewMore" link="/collection/new-arrivals" />

      <SectionBar variant="section" title="Best Sellers" />
      <HomeProductShowcase products={bestSellers} />
      <SectionBar variant="viewMore" link="/shop" />

      <Membership />

      <Newsletter />
    </>
  );
};

export default Home;
