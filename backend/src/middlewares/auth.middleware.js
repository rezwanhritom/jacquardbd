import User from "../models/User.js";
import Session from "../models/Session.js";
import { verifyToken } from "../utils/generateToken.js";

const COOKIE_NAME = "access_token";

/**
 * Get JWT from cookie or Authorization: Bearer <token> (for Postman / API clients).
 */
function getTokenFromRequest(req) {
  const fromCookie = req.cookies?.[COOKIE_NAME];
  if (fromCookie) return fromCookie;
  const auth = req.headers?.authorization;
  if (auth && typeof auth === "string" && auth.startsWith("Bearer ")) {
    return auth.slice(7).trim();
  }
  return null;
}

/**
 * Protect middleware: extract JWT, verify, validate session if sid present, attach user to req.user and sessionId to req.sessionId.
 * Denies with 401 if no token, invalid token, or session revoked.
 */
export async function protect(req, res, next) {
  const token = getTokenFromRequest(req);

  if (!token) {
    return res.status(401).json({ success: false, message: "Not authorized" });
  }

  const decoded = verifyToken(token);
  if (!decoded?.id) {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }

  if (decoded.sid) {
    const session = await Session.findById(decoded.sid).lean();
    if (!session || String(session.user) !== decoded.id) {
      return res.status(401).json({ success: false, message: "Session invalid or revoked" });
    }
    req.sessionId = decoded.sid;
  }

  const user = await User.findById(decoded.id).select("-password").lean();
  if (!user) {
    return res.status(401).json({ success: false, message: "User not found" });
  }

  req.user = user;
  next();
}

/**
 * Restrict access so that :userId in params must match the authenticated user.
 * Use after protect. Returns 403 if userId !== req.user._id.
 */
export function sameUser(req, res, next) {
  const userId = req.params?.userId;
  if (!userId || String(req.user?._id) !== userId) {
    return res.status(403).json({ success: false, message: "Access denied" });
  }
  next();
}

/**
 * Restrict to given roles. Use after protect. Returns 403 if req.user.role not in allowedRoles.
 */
export function requireRole(allowedRoles) {
  return (req, res, next) => {
    const role = req.user?.role;
    if (!role || !Array.isArray(allowedRoles) || !allowedRoles.includes(role)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    next();
  };
}

/**
 * Optional: attach user to req.user if valid cookie present, else req.user = null.
 * Use for routes that work for both authenticated and anonymous users.
 */
export async function optionalAuth(req, res, next) {
  const token = getTokenFromRequest(req);
  if (!token) {
    req.user = null;
    return next();
  }
  const decoded = verifyToken(token);
  if (!decoded?.id) {
    req.user = null;
    return next();
  }
  const user = await User.findById(decoded.id).select("-password").lean();
  req.user = user || null;
  next();
}

export { COOKIE_NAME };
