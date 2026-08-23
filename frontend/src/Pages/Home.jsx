import { useState, useEffect } from "react";
import {
  Hero,
  HomeCampaignBanner,
  HomeProductRail,
  Membership,
  Newsletter,
  Trust,
  ShopDepartments,
  HomeMarquee,
  HomeVideos,
} from "../components";
import { getHomeProducts } from "../services/productApi";
import { getPublicHomepage } from "../services/homepage.service";

const Home = () => {
  const [newArrivals, setNewArrivals] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [shopBy, setShopBy] = useState({ men: null, women: null });
  const [heroSlides, setHeroSlides] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getHomeProducts(), getPublicHomepage()])
      .then(([products, media]) => {
        if (products.success) {
          setNewArrivals(products.newArrivals || []);
          setBestSellers(products.bestSellers || []);
          setShopBy(products.shopBy || { men: null, women: null });
        }
        if (media.success) {
          setHeroSlides(media.hero || []);
          setVideos(media.videos || []);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Hero slides={heroSlides} />
      <HomeMarquee />
      <HomeProductRail
        title="New Arrivals"
        subtitle="The latest pieces, ready to shop"
        products={newArrivals}
        viewAllTo="/new-arrivals"
        loading={loading}
        emptyHint="New pieces will appear here soon."
      />
      <ShopDepartments men={shopBy.men} women={shopBy.women} />
      <HomeVideos videos={videos} />
      <HomeCampaignBanner />
      <HomeProductRail
        title="Best Sellers"
        subtitle="What everyone is wearing"
        products={bestSellers}
        loading={loading}
        emptyHint="Best sellers will appear here as orders come in."
      />
      <Trust />
      <Membership />
      <Newsletter />
    </>
  );
};

export default Home;
