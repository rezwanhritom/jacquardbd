import { useState, useEffect } from "react";
import { Link } from "react-router";
import { getActiveCampaigns } from "../../services/campaigns.service";

/**
 * Homepage campaign block. Hidden when there is no active campaign.
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

  if (loading || !activeCampaign) return null;

  const hasBanner = activeCampaign.banner && activeCampaign.banner.trim() && !imageError;
  const hasName = activeCampaign.name && activeCampaign.name.trim();
  const hasDescription = activeCampaign.description && activeCampaign.description.trim();

  return (
    <section className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3" aria-label="Current campaign">
      <Link
        to="/campaigns"
        className="relative block overflow-hidden group"
        style={{ backgroundColor: "var(--bg-secondary)" }}
      >
        {hasBanner ? (
          <div className="relative w-full h-[min(56dvh,420px)] sm:h-[380px] md:h-[460px] lg:h-[520px]">
            <img
              src={activeCampaign.banner}
              alt=""
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              onError={() => setImageError(true)}
            />
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.15) 55%, transparent 100%)",
              }}
            />
            <div className="absolute inset-0 flex flex-col items-start justify-end p-6 sm:p-10 md:p-14 text-white">
              <p className="text-[10px] sm:text-xs uppercase tracking-[0.25em] text-white/80 mb-2">Campaign</p>
              {hasName && (
                <h2 className="font-display text-3xl sm:text-5xl md:text-6xl font-semibold leading-tight max-w-2xl">
                  {activeCampaign.name}
                </h2>
              )}
              {hasDescription && (
                <p className="mt-2 text-sm sm:text-base text-white/90 max-w-xl leading-relaxed">
                  {activeCampaign.description}
                </p>
              )}
              <span
                className="mt-5 inline-flex items-center px-6 py-3 text-sm font-semibold"
                style={{ backgroundColor: "white", color: "#004122" }}
              >
                Shop campaign
              </span>
            </div>
          </div>
        ) : (
          (hasName || hasDescription) && (
            <div className="py-14 md:py-20 px-6 sm:px-10 text-center">
              <p
                className="text-[10px] sm:text-xs uppercase tracking-[0.25em] mb-3"
                style={{ color: "var(--color-tertiary)" }}
              >
                Campaign
              </p>
              {hasName && (
                <h2
                  className="font-display text-3xl sm:text-5xl font-semibold mb-3"
                  style={{ color: "var(--color-primary)" }}
                >
                  {activeCampaign.name}
                </h2>
              )}
              {hasDescription && (
                <p className="text-base max-w-2xl mx-auto mb-6" style={{ color: "var(--text-secondary)" }}>
                  {activeCampaign.description}
                </p>
              )}
              <span
                className="inline-flex items-center px-6 py-3 text-sm font-semibold text-white"
                style={{ backgroundColor: "var(--color-primary)" }}
              >
                Shop campaign
              </span>
            </div>
          )
        )}
      </Link>
    </section>
  );
};

export default HomeCampaignBanner;
