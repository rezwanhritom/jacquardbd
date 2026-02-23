import { useState, useEffect } from "react";
import { Hero, Newsletter, HomeCampaignBanner, HomeProductShowcase, Membership, SectionBar } from "../components";
import { getHomeProducts } from "../services/productApi";

const Home = () => {
  const [newArrivals, setNewArrivals] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHomeProducts()
      .then((res) => {
        if (res.success) {
          setNewArrivals(res.newArrivals || []);
          setBestSellers(res.bestSellers || []);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Hero />

      <SectionBar variant="motto" />

      <HomeCampaignBanner />

      <SectionBar variant="promo" />

      <SectionBar variant="section" title="New Arrivals" centered />
      {!loading && <HomeProductShowcase products={newArrivals} />}

      <SectionBar variant="section" title="Best Sellers" centered />
      {!loading && <HomeProductShowcase products={bestSellers} />}

      <Membership />

      <Newsletter />
    </>
  );
};

export default Home;
