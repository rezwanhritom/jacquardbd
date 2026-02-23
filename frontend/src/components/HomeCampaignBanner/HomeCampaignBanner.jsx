import { useState, useEffect } from "react";
import { getActiveCampaigns } from "../../services/campaigns.service";

/**
 * Homepage-only campaign section. Shows the banner of the first active campaign.
 * No text, no button. If no active campaign or no banner, renders nothing.
 */
const HomeCampaignBanner = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getActiveCampaigns()
      .then((res) => {
        if (res.success && Array.isArray(res.campaigns)) setCampaigns(res.campaigns);
        else setCampaigns([]);
      })
      .catch(() => setCampaigns([]))
      .finally(() => setLoading(false));
  }, []);

  const activeWithBanner = campaigns.find((c) => c.banner && c.banner.trim());

  if (loading) {
    return (
      <section
        className="relative h-[320px] md:h-[400px] overflow-hidden flex items-center justify-center"
        style={{ backgroundColor: "var(--bg-secondary)" }}
      >
        <div className="text-sm" style={{ color: "var(--text-tertiary)" }}>
          Loading…
        </div>
      </section>
    );
  }

  if (!activeWithBanner) return null;

  return (
    <section
      className="relative h-[320px] md:h-[400px] lg:h-[480px] overflow-hidden"
      style={{ backgroundColor: "var(--bg-secondary)" }}
    >
      <img
        src={activeWithBanner.banner}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />
    </section>
  );
};

export default HomeCampaignBanner;
