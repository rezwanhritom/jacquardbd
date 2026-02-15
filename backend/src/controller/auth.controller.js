import User from "../models/User.js";
import RefreshToken from "../models/RefreshToken.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  getRefreshTokenExpiry,
  COOKIE_NAMES,
} from "../utils/jwt.js";

const isProduction = process.env.NODE_ENV === "production";

const ACCESS_COOKIE_MAX_AGE = 15 * 60 * 1000;

function cookieOptions(tokenCookie) {
  const isRefresh = tokenCookie === COOKIE_NAMES.REFRESH_TOKEN;
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    path: "/",
    maxAge: isRefresh ? getRefreshTokenExpiry() : ACCESS_COOKIE_MAX_AGE,
  };
}

function clearCookie(res, name) {
  res.cookie(name, "", { httpOnly: true, secure: isProduction, sameSite: "strict", path: "/", maxAge: 0 });
}

function userResponse(user) {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    profileImage: user.profileImage ?? null,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    if (!name?.trim()) return res.status(400).json({ success: false, message: "Name is required" });
    if (!email?.trim()) return res.status(400).json({ success: false, message: "Email is required" });
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) return res.status(400).json({ success: false, message: "Invalid email format" });
    if (!password || password.length < 8) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
    }
    const existing = await User.findOne({ email: email.trim().toLowerCase() });
    if (existing) return res.status(409).json({ success: false, message: "Email already registered" });
    const user = await User.create({ name: name.trim(), email: email.trim().toLowerCase(), password });
    res.status(201).json({ success: true, message: "Registration successful", user: userResponse(user) });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email?.trim() || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }
    const user = await User.findOne({ email: email.trim().toLowerCase() }).select("+password");
    if (!user) return res.status(401).json({ success: false, message: "Invalid email or password" });
    const match = await user.comparePassword(password);
    if (!match) return res.status(401).json({ success: false, message: "Invalid email or password" });

    const accessToken = generateAccessToken(user._id.toString());
    const { token: refreshToken, jti } = generateRefreshToken(user._id.toString());
    const expiresAt = new Date(Date.now() + getRefreshTokenExpiry());
    await RefreshToken.create({ token: refreshToken, userId: user._id, expiresAt });

    res.cookie(COOKIE_NAMES.ACCESS_TOKEN, accessToken, cookieOptions(COOKIE_NAMES.ACCESS_TOKEN));
    res.cookie(COOKIE_NAMES.REFRESH_TOKEN, refreshToken, cookieOptions(COOKIE_NAMES.REFRESH_TOKEN));
    res.json({ success: true, message: "Login successful", user: userResponse(user) });
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res, next) {
  try {
    const refreshToken = req.cookies?.[COOKIE_NAMES.REFRESH_TOKEN];
    if (refreshToken) {
      try {
        const decoded = verifyRefreshToken(refreshToken);
        await RefreshToken.updateOne({ token: refreshToken }, { $set: { revoked: true } });
      } catch (_) {}
    }
    clearCookie(res, COOKIE_NAMES.ACCESS_TOKEN);
    clearCookie(res, COOKIE_NAMES.REFRESH_TOKEN);
    res.json({ success: true, message: "Logged out successfully" });
  } catch (err) {
    next(err);
  }
}

export async function me(req, res, next) {
  try {
    res.json({ success: true, user: userResponse(req.user) });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req, res, next) {
  try {
    const oldRefresh = req.refreshTokenValue;
    const userId = req.user._id.toString();
    await RefreshToken.updateOne({ token: oldRefresh }, { $set: { revoked: true } });

    const accessToken = generateAccessToken(userId);
    const { token: newRefreshToken } = generateRefreshToken(userId);
    const expiresAt = new Date(Date.now() + getRefreshTokenExpiry());
    await RefreshToken.create({ token: newRefreshToken, userId: req.user._id, expiresAt });

    res.cookie(COOKIE_NAMES.ACCESS_TOKEN, accessToken, cookieOptions(COOKIE_NAMES.ACCESS_TOKEN));
    res.cookie(COOKIE_NAMES.REFRESH_TOKEN, newRefreshToken, cookieOptions(COOKIE_NAMES.REFRESH_TOKEN));
    res.json({ success: true, message: "Token refreshed", user: userResponse(req.user) });
  } catch (err) {
    next(err);
  }
}
