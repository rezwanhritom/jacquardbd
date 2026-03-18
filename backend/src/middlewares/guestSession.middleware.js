import crypto from "crypto";

const COOKIE_NAME = "jacquard_guest_sid";
const MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000;

export function getGuestCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MAX_AGE_MS,
    path: "/",
  };
}

/** Ensures req.guestSessionId; sets cookie only when creating a new session (first guest order/chat). */
export function ensureGuestSession(req, res, next) {
  let sid = req.cookies?.[COOKIE_NAME];
  if (!sid || typeof sid !== "string" || sid.length < 16) {
    sid = crypto.randomUUID();
    res.cookie(COOKIE_NAME, sid, getGuestCookieOptions());
  }
  req.guestSessionId = sid;
  next();
}

/** Read guest session from cookie only (no new cookie). */
export function readGuestSession(req, res, next) {
  const sid = req.cookies?.[COOKIE_NAME];
  req.guestSessionId = sid && typeof sid === "string" && sid.length >= 16 ? sid : null;
  next();
}

export { COOKIE_NAME as GUEST_SESSION_COOKIE };
