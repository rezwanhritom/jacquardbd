const getBaseUrl = () => {
  const url = import.meta.env.VITE_API_URL;
  if (url) return url.replace(/\/$/, "");
  return "http://localhost:5001";
};

export async function previewCoupon(code, items) {
  const baseUrl = getBaseUrl();
  const res = await fetch(`${baseUrl}/api/coupons/preview`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code: String(code || "").trim(), items }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { success: false, message: data.message || "Invalid coupon", discount: 0 };
  }
  return {
    success: true,
    discount: Number(data.discount) || 0,
    subtotal: data.subtotal,
    message: data.message,
    coupon: data.coupon,
  };
}

export async function getCoupons() {
  const baseUrl = getBaseUrl();
  const res = await fetch(`${baseUrl}/api/coupons`, { credentials: "include" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { success: false, coupons: [], message: data.message };
  }
  return { success: true, coupons: data.coupons || [] };
}

export async function createCoupon(payload) {
  const baseUrl = getBaseUrl();
  const res = await fetch(`${baseUrl}/api/coupons`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { success: false, coupon: null, message: data.message };
  }
  return { success: true, coupon: data.coupon };
}

export async function updateCoupon(id, payload) {
  const baseUrl = getBaseUrl();
  const res = await fetch(`${baseUrl}/api/coupons/${id}`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { success: false, coupon: null, message: data.message };
  }
  return { success: true, coupon: data.coupon };
}

export async function deleteCoupon(id) {
  const baseUrl = getBaseUrl();
  const res = await fetch(`${baseUrl}/api/coupons/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { success: false, message: data.message };
  }
  return { success: true, message: data.message };
}
