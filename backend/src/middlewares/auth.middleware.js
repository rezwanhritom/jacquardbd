import User from "../models/User.js";
import { verifyToken } from "../utils/generateToken.js";

const COOKIE_NAME = "access_token";

/**
 * Protect middleware: extract JWT from cookie, verify, attach user to req.user.
 * Denies with 401 if no cookie or invalid token.
 */
export async function protect(req, res, next) {
  const token = req.cookies?.[COOKIE_NAME];

  if (!token) {
    return res.status(401).json({ success: false, message: "Not authorized" });
  }

  const decoded = verifyToken(token);
  if (!decoded?.id) {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
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
 * Optional: attach user to req.user if valid cookie present, else req.user = null.
 * Use for routes that work for both authenticated and anonymous users.
 */
export async function optionalAuth(req, res, next) {
  const token = req.cookies?.[COOKIE_NAME];
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
