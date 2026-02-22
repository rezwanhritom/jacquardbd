import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-dev-secret-change-in-production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "15m";

/**
 * Generate a JWT access token for the given user id and optional session id.
 * @param {string} userId - MongoDB user _id
 * @param {string} [sessionId] - Session document _id (for revocable sessions)
 * @returns {string} signed JWT
 */
export function generateToken(userId, sessionId) {
  const payload = { id: userId };
  if (sessionId) payload.sid = sessionId;
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verify a JWT and return the decoded payload (contains id, optional sid).
 * @param {string} token
 * @returns {{ id: string, sid?: string } | null}
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}
