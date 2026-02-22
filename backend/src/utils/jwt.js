import jwt from "jsonwebtoken";
import crypto from "crypto";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES || "7d";
const REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES || "7d";

export const COOKIE_NAMES = Object.freeze({
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
});

function ensureSecret(which) {
  const secret = which === "access" ? ACCESS_SECRET : REFRESH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      which === "access"
        ? "JWT_ACCESS_SECRET or JWT_SECRET must be set (min 32 chars)"
        : "JWT_REFRESH_SECRET must be set (min 32 chars)"
    );
  }
  return secret;
}

export function generateAccessToken(userId) {
  const secret = ensureSecret("access");
  return jwt.sign(
    { id: userId, type: "access" },
    secret,
    { expiresIn: ACCESS_EXPIRES }
  );
}

export function generateRefreshToken(userId) {
  const secret = ensureSecret("refresh");
  const jti = crypto.randomUUID();
  const token = jwt.sign(
    { id: userId, type: "refresh", jti },
    secret,
    { expiresIn: REFRESH_EXPIRES }
  );
  return { token, jti };
}

export function verifyAccessToken(token) {
  const secret = ensureSecret("access");
  return jwt.verify(token, secret);
}

export function verifyRefreshToken(token) {
  const secret = ensureSecret("refresh");
  return jwt.verify(token, secret);
}

export function getRefreshTokenExpiry() {
  const match = (REFRESH_EXPIRES || "7d").match(/^(\d+)([smhd])$/);
  if (!match) return 7 * 24 * 60 * 60 * 1000;
  const n = parseInt(match[1], 10);
  const u = match[2];
  const multipliers = { s: 1000, m: 60 * 1000, h: 60 * 60 * 1000, d: 24 * 60 * 60 * 1000 };
  return n * (multipliers[u] || multipliers.d);
}
