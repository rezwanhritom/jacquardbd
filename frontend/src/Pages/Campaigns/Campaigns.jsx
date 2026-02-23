import { useState, useEffect } from "react";
import { Link } from "react-router";
import { motion } from "framer-motion";
import { FiArrowRight, FiTag } from "react-icons/fi";
import {
  Container,
  ProductGrid,
  QuickView,
  Loading,
} from "../../components";
import { getActiveCampaigns } from "../../services/campaigns.service";
import { mapApiProduct } from "../../utils/productUtils";
import { fadeInUp, staggerContainer } from "../../utils/animations";

const Campaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getActiveCampaigns()
      .then((res) => {
        if (res.success && Array.isArray(res.campaigns)) {
          setCampaigns(res.campaigns);
        } else {
          setCampaigns([]);
        }
      })
      .catch(() => {
        setError("Failed to load campaigns.");
        setCampaigns([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const mapProducts = (products, campaignName, discount) =>
    (products || []).map((p) =>
      mapApiProduct({
        ...p,
        campaignName,
        discount: p.discount ?? discount,
        badge: campaignName || "Campaign",
      })
    );

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden py-16 md:py-24"
        style={{ backgroundColor: "var(--bg-secondary)" }}
      >
        <Container>
          <div className="relative z-10 text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <span
                className="inline-block px-4 py-2 text-xs font-semibold uppercase tracking-widest rounded-full mb-6"
                style={{
                  backgroundColor: "var(--color-primary)",
                  color: "white",
                }}
              >
                <FiTag className="inline mr-1" />
                Promotions
              </span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-4xl md:text-6xl font-bold mb-6"
              style={{ color: "var(--text-primary)" }}
            >
              Campaigns
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-lg md:text-xl leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            >
              All active campaigns in one place. Add items to cart or wishlist and shop as usual.
            </motion.p>
          </div>
        </Container>
      </motion.section>

      {/* Content */}
      <section className="py-12 md:py-16">
        <Container>
          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-center items-center py-24"
            >
              <Loading />
            </motion.div>
          ) : error ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
              style={{ color: "var(--text-secondary)" }}
            >
              <p className="text-lg mb-4">{error}</p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-6 py-2 rounded-lg font-medium text-white"
                style={{ backgroundColor: "var(--color-primary)" }}
              >
                Retry
              </button>
            </motion.div>
          ) : campaigns.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-24"
              style={{ color: "var(--text-secondary)" }}
            >
              <p className="text-xl mb-2">No active campaigns right now</p>
              <p className="mb-6">Check back later for new promotions.</p>
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white"
                style={{ backgroundColor: "var(--color-primary)" }}
              >
                Shop All
                <FiArrowRight size={18} />
              </Link>
            </motion.div>
          ) : (
            <motion.div
              initial="initial"
              animate="animate"
              variants={staggerContainer}
              className="space-y-16"
            >
              {campaigns.map((campaign) => {
                const products = mapProducts(
                  campaign.products,
                  campaign.name,
                  campaign.discount ?? 0
                );
                if (products.length === 0) return null;
                return (
                  <motion.div key={campaign._id} variants={fadeInUp} className="space-y-6">
                    <div className="flex flex-wrap items-baseline gap-3">
                      <h2
                        className="text-2xl md:text-3xl font-bold"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {campaign.name}
                      </h2>
                      {(campaign.discount ?? 0) > 0 && (
                        <span
                          className="px-3 py-1 text-sm font-bold text-white rounded-full"
                          style={{ backgroundColor: "var(--color-tertiary)" }}
                        >
                          Up to {campaign.discount}% off
                        </span>
                      )}
                    </div>
                    <ProductGrid
                      products={products}
                      viewMode="grid"
                      onQuickView={setQuickViewProduct}
                    />
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </Container>
      </section>

      <QuickView
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={() => setQuickViewProduct(null)}
        onAddToWishlist={() => {}}
      />
    </div>
  );
};

export default Campaigns;
