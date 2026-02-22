/**
 * Auth API service. Uses credentials (cookies) for all requests.
 * Base URL from VITE_API_URL (e.g. http://localhost:5001).
 */

const getBaseUrl = () => {
  const url = import.meta.env.VITE_API_URL;
  if (url) return url.replace(/\/$/, "");
  return "http://localhost:5001";
};

const authFetch = (path, options = {}) => {
  const baseUrl = getBaseUrl();
  return fetch(`${baseUrl}/api/auth${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
};

/**
 * POST /api/auth/register
 * @param {{ name: string, email: string, password: string }} payload
 */
export async function register(payload) {
  const res = await authFetch("/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { success: false, message: data.message || "Registration failed", errors: data.errors };
  }
  return { success: true, user: data.user, message: data.message };
}

/**
 * POST /api/auth/login
 * @param {{ email: string, password: string }} payload
 */
export async function login(payload) {
  const res = await authFetch("/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { success: false, message: data.message || "Login failed" };
  }
  return { success: true, user: data.user, message: data.message };
}

/**
 * POST /api/auth/logout — clears cookie on server
 */
export async function logout() {
  const res = await authFetch("/logout", { method: "POST" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { success: false, message: data.message || "Logout failed" };
  }
  return { success: true, message: data.message };
}

/**
 * GET /api/auth/me — current user (requires valid cookie)
 */
export async function getMe() {
  const res = await authFetch("/me");
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { success: false, user: null };
  }
  return { success: true, user: data.user };
}

/**
 * POST /api/auth/change-password — Body: { currentPassword, newPassword }
 */
export async function changePassword(currentPassword, newPassword) {
  const res = await authFetch("/change-password", {
    method: "POST",
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { success: false, message: data.message || "Failed to change password" };
  }
  return { success: true, message: data.message };
}

/**
 * GET /api/auth/sessions — list active sessions (DB)
 */
export async function getSessions() {
  const res = await authFetch("/sessions");
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { success: false, sessions: [], message: data.message };
  }
  return { success: true, sessions: Array.isArray(data.sessions) ? data.sessions : [] };
}

/**
 * DELETE /api/auth/sessions/:sessionId — revoke one session
 */
export async function revokeSession(sessionId) {
  const res = await authFetch(`/sessions/${sessionId}`, { method: "DELETE" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { success: false, message: data.message || "Failed to revoke session" };
  }
  return { success: true, wasCurrent: data.wasCurrent, message: data.message };
}

/**
 * DELETE /api/auth/sessions — revoke all other sessions. Pass all=true to revoke all including current.
 */
export async function revokeAllOtherSessions(revokeAll = false) {
  const url = revokeAll ? "/sessions?all=1" : "/sessions";
  const res = await authFetch(url, { method: "DELETE" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { success: false, message: data.message || "Failed to revoke sessions" };
  }
  return { success: true, revokedCurrent: data.revokedCurrent, message: data.message };
}
