import { useState, useEffect } from "react";
import { getActiveCampaigns } from "../../services/campaigns.service";

/**
 * Homepage campaign section. If no active campaign, show nothing.
 * If an active campaign exists, show whatever is present: banner image, name, description.
 */
const HomeCampaignBanner = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    getActiveCampaigns()
      .then((res) => {
        if (res.success && Array.isArray(res.campaigns)) setCampaigns(res.campaigns);
        else setCampaigns([]);
      })
      .catch(() => setCampaigns([]))
      .finally(() => setLoading(false));
  }, []);

  const activeCampaign = campaigns[0] ?? null;

  useEffect(() => {
    setImageError(false);
  }, [activeCampaign?.banner]);

  /* If no campaign: show nothing at all — no loading box, no borders, no section. Next thing after "Elevating Style" is the Free shipping bar. */
  if (loading || !activeCampaign) return null;

  const hasBanner = activeCampaign.banner && activeCampaign.banner.trim() && !imageError;
  const hasName = activeCampaign.name && activeCampaign.name.trim();
  const hasDescription = activeCampaign.description && activeCampaign.description.trim();

  return (
    <section
      className="relative overflow-hidden"
      style={{
        backgroundColor: "var(--bg-secondary)",
        minHeight: hasBanner ? "320px" : undefined,
      }}
    >
      {activeCampaign.banner && activeCampaign.banner.trim() && !imageError && (
        <div className="relative h-[320px] md:h-[400px] lg:h-[480px]">
          <img
            src={activeCampaign.banner}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
          {(hasName || hasDescription) && (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
              style={{
                background: "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.5) 100%)",
                color: "white",
                textShadow: "0 1px 2px rgba(0,0,0,0.8)",
              }}
            >
              {hasName && (
                <h2 className="text-2xl md:text-4xl font-bold mb-2">{activeCampaign.name}</h2>
              )}
              {hasDescription && (
                <p className="text-sm md:text-lg max-w-2xl opacity-95">{activeCampaign.description}</p>
              )}
            </div>
          )}
        </div>
      )}
      {(!activeCampaign.banner || !activeCampaign.banner.trim() || imageError) && (hasName || hasDescription) && (
        <div className="py-12 md:py-16 px-6 text-center" style={{ backgroundColor: "var(--bg-tertiary)" }}>
          {hasName && (
            <h2 className="text-2xl md:text-4xl font-bold mb-3" style={{ color: "var(--color-primary)" }}>
              {activeCampaign.name}
            </h2>
          )}
          {hasDescription && (
            <p className="text-base md:text-lg max-w-2xl mx-auto" style={{ color: "var(--text-secondary)" }}>
              {activeCampaign.description}
            </p>
          )}
        </div>
      )}
    </section>
  );
};

export default HomeCampaignBanner;
