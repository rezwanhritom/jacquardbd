/**
 * Homepage media API. Public list is unauthenticated; admin calls send cookies.
 */

const getBaseUrl = () => {
  const url = import.meta.env.VITE_API_URL;
  if (url) return url.replace(/\/$/, "");
  return "http://localhost:5001";
};

const homepageFetch = (path, options = {}) => {
  const baseUrl = getBaseUrl();
  return fetch(`${baseUrl}/api/homepage${path}`, {
    ...options,
    credentials: "include",
    headers: {
      ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...options.headers,
    },
  });
};

export async function getPublicHomepage() {
  const res = await fetch(`${getBaseUrl()}/api/homepage`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { success: false, hero: [], videos: [], message: data.message || "Failed to load homepage media" };
  }
  return {
    success: true,
    hero: Array.isArray(data.hero) ? data.hero : [],
    videos: Array.isArray(data.videos) ? data.videos : [],
  };
}

export async function getAdminHomepage() {
  const res = await homepageFetch("/admin");
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { success: false, hero: [], videos: [], message: data.message || "Failed to load homepage media" };
  }
  return {
    success: true,
    hero: Array.isArray(data.hero) ? data.hero : [],
    videos: Array.isArray(data.videos) ? data.videos : [],
  };
}

export async function uploadHomepageMedia(slot, files) {
  const list = Array.from(files || []).filter(Boolean);
  if (!list.length) return { success: false, items: [], message: "No files selected" };
  const formData = new FormData();
  formData.append("slot", slot);
  list.forEach((file) => formData.append("files", file));
  const res = await fetch(`${getBaseUrl()}/api/homepage/upload`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { success: false, items: [], message: data.message || "Upload failed" };
  }
  return { success: true, items: Array.isArray(data.items) ? data.items : [], message: data.message };
}

export async function updateHomepageMedia(id, payload) {
  const res = await homepageFetch(`/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { success: false, item: null, message: data.message || "Update failed" };
  }
  return { success: true, item: data.item, message: data.message };
}

export async function deleteHomepageMedia(id) {
  const res = await homepageFetch(`/${id}`, { method: "DELETE" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { success: false, message: data.message || "Delete failed" };
  }
  return { success: true, message: data.message };
}
