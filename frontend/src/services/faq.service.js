/**
 * FAQ API. Public: get answered FAQs, submit question. Admin: list all, update (reply/edit), delete.
 */

const getBaseUrl = () => {
  const url = import.meta.env.VITE_API_URL;
  if (url) return url.replace(/\/$/, "");
  return "http://localhost:5001";
};

const faqFetch = (path, options = {}) => {
  const baseUrl = getBaseUrl();
  return fetch(`${baseUrl}/api/faq${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
};

/** GET /api/faq — public, returns answered FAQs only */
export async function getFaqs() {
  const res = await faqFetch("/");
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { success: false, faqs: [], message: data.message || "Failed to load FAQs" };
  return { success: true, faqs: data.faqs || [] };
}

/** POST /api/faq — public, submit a question. Body: { question, email? } */
export async function submitFaqQuestion(payload) {
  const res = await faqFetch("/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { success: false, message: data.message || "Failed to submit question" };
  return { success: true, message: data.message, faq: data.faq };
}

/** GET /api/faq/admin — admin only, all FAQs */
export async function getAdminFaqs() {
  const res = await faqFetch("/admin");
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { success: false, faqs: [], message: data.message || "Failed to load FAQs" };
  return { success: true, faqs: data.faqs || [] };
}

/** PATCH /api/faq/:id — admin only. Body: { question?, reply? } */
export async function updateFaq(id, payload) {
  const res = await faqFetch(`/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { success: false, faq: null, message: data.message || "Failed to update" };
  return { success: true, faq: data.faq, message: data.message };
}

/** DELETE /api/faq/:id — admin only */
export async function deleteFaq(id) {
  const res = await faqFetch(`/${id}`, { method: "DELETE" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { success: false, message: data.message || "Failed to delete" };
  return { success: true, message: data.message };
}
