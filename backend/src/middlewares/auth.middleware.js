import User from "../models/User.js";
import RefreshToken from "../models/RefreshToken.js";
import { verifyAccessToken, verifyRefreshToken, COOKIE_NAMES } from "../utils/jwt.js";

const COOKIE_ACCESS = COOKIE_NAMES.ACCESS_TOKEN;
const COOKIE_REFRESH = COOKIE_NAMES.REFRESH_TOKEN;

/**
 * Protect: require valid access token in cookie. Attach user to req.user.
 */
export async function protect(req, res, next) {
  const token = req.cookies?.[COOKIE_ACCESS];
  if (!token) {
    return res.status(401).json({ success: false, message: "Not authorized" });
  }
  try {
    const decoded = verifyAccessToken(token);
    if (decoded?.type !== "access" || !decoded?.id) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }
    const user = await User.findById(decoded.id).select("-password").lean();
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
}

/**
 * Optional auth: attach user if valid cookie present, else req.user = null.
 */
export async function optionalAuth(req, res, next) {
  const token = req.cookies?.[COOKIE_ACCESS];
  if (!token) {
    req.user = null;
    return next();
  }
  try {
    const decoded = verifyAccessToken(token);
    if (decoded?.type !== "access" || !decoded?.id) {
      req.user = null;
      return next();
    }
    const user = await User.findById(decoded.id).select("-password").lean();
    req.user = user || null;
    next();
  } catch {
    req.user = null;
    next();
  }
}

/**
 * Require one of the given roles. Use after protect().
 * @param {string[]} allowedRoles e.g. ['admin'] or ['admin', 'premium']
 */
export function requireRole(allowedRoles) {
  const set = new Set(Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]);
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }
    if (!set.has(req.user.role)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    next();
  };
}

/**
 * Refresh flow: read refresh token from cookie, verify, check not revoked, attach user.
 */
export async function requireRefreshToken(req, res, next) {
  const token = req.cookies?.[COOKIE_REFRESH];
  if (!token) {
    return res.status(401).json({ success: false, message: "Refresh token required" });
  }
  try {
    const decoded = verifyRefreshToken(token);
    if (decoded?.type !== "refresh" || !decoded?.id) {
      return res.status(401).json({ success: false, message: "Invalid refresh token" });
    }
    const stored = await RefreshToken.findOne({ token, revoked: false }).lean();
    if (!stored || stored.userId.toString() !== decoded.id) {
      return res.status(401).json({ success: false, message: "Refresh token revoked or invalid" });
    }
    req.refreshPayload = decoded;
    req.refreshTokenValue = token;
    const user = await User.findById(decoded.id).select("-password").lean();
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid or expired refresh token" });
  }
}
