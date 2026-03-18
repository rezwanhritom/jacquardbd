const getBaseUrl = () => {
  const url = import.meta.env.VITE_API_URL;
  if (url) return url.replace(/\/$/, "");
  return "http://localhost:5001";
};

export async function getPublicRewardRules() {
  const res = await fetch(`${getBaseUrl()}/api/rewards/rules`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { success: false, rules: [], message: data.message };
  return { success: true, rules: data.rules || [] };
}

export async function getRewardAccount() {
  const res = await fetch(`${getBaseUrl()}/api/rewards/account`, { credentials: "include" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { success: false, ...data };
  return data;
}

export async function previewReward(payload) {
  const res = await fetch(`${getBaseUrl()}/api/rewards/preview`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  return data;
}

export async function redeemRewardLater(ruleId) {
  const res = await fetch(`${getBaseUrl()}/api/rewards/redeem-later`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ruleId }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { success: false, message: data.message || "Failed" };
  return data;
}

export async function getAdminRewardRules() {
  const res = await fetch(`${getBaseUrl()}/api/rewards/admin/rules`, { credentials: "include" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { success: false, rules: [] };
  return { success: true, rules: data.rules || [] };
}

export async function createRewardRule(payload) {
  const res = await fetch(`${getBaseUrl()}/api/rewards/admin/rules`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { success: false, message: data.message };
  return data;
}

export async function updateRewardRule(id, payload) {
  const res = await fetch(`${getBaseUrl()}/api/rewards/admin/rules/${id}`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { success: false, message: data.message };
  return data;
}

export async function deleteRewardRule(id) {
  const res = await fetch(`${getBaseUrl()}/api/rewards/admin/rules/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { success: false, message: data.message };
  return data;
}
