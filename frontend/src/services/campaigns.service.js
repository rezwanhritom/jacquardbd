/**
 * Campaigns API. getActiveCampaigns is public; others require admin.
 */

const getBaseUrl = () => {
  const url = import.meta.env.VITE_API_URL;
  if (url) return url.replace(/\/$/, "");
  return "http://localhost:5001";
};

const campaignFetch = (path, options = {}) => {
  const baseUrl = getBaseUrl();
  return fetch(`${baseUrl}/api/campaigns${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
};

/**
 * Public. Get active campaigns with their products (for Campaigns page).
 */
export async function getActiveCampaigns() {
  const res = await fetch(`${getBaseUrl()}/api/campaigns/active`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { success: false, campaigns: [], message: data.message || "Failed to load campaigns" };
  }
  return { success: true, campaigns: Array.isArray(data.campaigns) ? data.campaigns : [] };
}

export async function getCampaigns() {
  const res = await campaignFetch("/");
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { success: false, campaigns: [], message: data.message || "Failed to load campaigns" };
  }
  return { success: true, campaigns: Array.isArray(data.campaigns) ? data.campaigns : [] };
}

export async function createCampaign(payload) {
  const res = await campaignFetch("/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { success: false, campaign: null, message: data.message || "Failed to create campaign" };
  }
  return { success: true, campaign: data.campaign, message: data.message };
}

export async function updateCampaign(campaignId, payload) {
  const res = await campaignFetch(`/${campaignId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { success: false, campaign: null, message: data.message || "Failed to update campaign" };
  }
  return { success: true, campaign: data.campaign, message: data.message };
}

export async function deleteCampaign(campaignId) {
  const res = await campaignFetch(`/${campaignId}`, { method: "DELETE" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { success: false, message: data.message || "Failed to delete campaign" };
  }
  return { success: true, message: data.message };
}
