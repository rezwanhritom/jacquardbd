import User from "../models/User.js";
import Session from "../models/Session.js";
import { generateToken } from "../utils/generateToken.js";
import { COOKIE_NAME } from "../middlewares/auth.middleware.js";

const isProduction = process.env.NODE_ENV === "production";

function setTokenCookie(res, token) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "strict" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
    path: "/",
  });
}

function clearTokenCookie(res) {
  res.cookie(COOKIE_NAME, "", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "strict" : "lax",
    maxAge: 0,
    path: "/",
  });
}

function userResponse(user) {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    premiumAppliedAt: user.premiumAppliedAt ?? null,
    avatar: user.avatar ?? "",
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function parseUserAgent(ua) {
  if (!ua || typeof ua !== "string") return { device: "Unknown", browser: "Unknown" };
  const s = ua.slice(0, 200);
  let browser = "Unknown";
  if (/Chrome\/|CriOS\//.test(s) && !/Edge/.test(s)) browser = "Chrome";
  else if (/Firefox\/|FxiOS\//.test(s)) browser = "Firefox";
  else if (/Safari\/|Version\//.test(s) && !/Chrome/.test(s)) browser = "Safari";
  else if (/Edge\//.test(s)) browser = "Edge";
  let device = "Desktop";
  if (/Mobile|Android|iPhone|iPad|iPod/.test(s)) device = /iPad|Tablet/.test(s) ? "Tablet" : "Mobile";
  return { device, browser };
}

/**
 * POST /api/auth/register
 * Validate input, hash password, create user. Does not log in (no cookie).
 */
export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ success: false, message: "Name is required" });
    }
    if (!email?.trim()) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ success: false, message: "Invalid email format" });
    }
    if (!password || password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    const existing = await User.findOne({ email: email.trim().toLowerCase() });
    if (existing) {
      return res.status(409).json({ success: false, message: "Email already registered" });
    }

    const user = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
    });

    if (process.env.NODE_ENV !== "production") {
      console.log("[Auth] User registered and saved to DB:", user.email, "| _id:", user._id?.toString());
    }

    res.status(201).json({
      success: true,
      message: "Registration successful",
      user: userResponse(user),
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/login
 * Validate email & password, generate JWT, set HTTP-only cookie, return user (no password).
 */
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() }).select("+password");
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const match = await user.comparePassword(password);
    if (!match) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const userAgent = req.headers["user-agent"] || "";
    const session = await Session.create({
      user: user._id,
      userAgent,
    });
    const token = generateToken(user._id.toString(), session._id.toString());
    setTokenCookie(res, token);

    const expiresIn = process.env.JWT_EXPIRES_IN || "7d";
    res.json({
      success: true,
      message: "Login successful",
      user: userResponse(user),
      accessToken: token,
      expiresIn,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/logout
 * Delete current session from DB and clear auth cookie.
 */
export async function logout(req, res, next) {
  try {
    if (req.sessionId) {
      await Session.findByIdAndDelete(req.sessionId);
    }
    clearTokenCookie(res);
    res.json({ success: true, message: "Logged out successfully" });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/auth/me
 * Verify JWT (via protect middleware), return current user (no password).
 */
export async function me(req, res, next) {
  try {
    res.json({ success: true, user: req.user });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/change-password
 * Body: { currentPassword, newPassword }. Same user only (via protect).
 */
export async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Current password and new password are required" });
    }
    if (String(newPassword).length < 8) {
      return res.status(400).json({ success: false, message: "New password must be at least 8 characters" });
    }

    const user = await User.findById(req.user._id).select("+password");
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }
    const match = await user.comparePassword(currentPassword);
    if (!match) {
      return res.status(401).json({ success: false, message: "Current password is incorrect" });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/auth/sessions
 * List active sessions for the current user (from DB). Each has _id, userAgent, createdAt, current (boolean).
 */
export async function getSessions(req, res, next) {
  try {
    const userId = req.user._id;
    const currentSessionId = req.sessionId ? String(req.sessionId) : null;
    const sessions = await Session.find({ user: userId }).sort({ createdAt: -1 }).lean();
    const list = sessions.map((s) => {
      const { device, browser } = parseUserAgent(s.userAgent);
      return {
        _id: s._id,
        device,
        browser,
        userAgent: s.userAgent || "",
        createdAt: s.createdAt,
        current: currentSessionId ? String(s._id) === currentSessionId : false,
      };
    });
    res.json({ success: true, sessions: list });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/auth/sessions/:sessionId
 * Revoke one session. If it's the current session, clear cookie (client should redirect to login).
 */
export async function revokeSession(req, res, next) {
  try {
    const { sessionId } = req.params;
    const userId = req.user._id;

    const session = await Session.findOne({ _id: sessionId, user: userId });
    if (!session) {
      return res.status(404).json({ success: false, message: "Session not found" });
    }

    await Session.findByIdAndDelete(sessionId);
    const isCurrent = req.sessionId && String(req.sessionId) === String(sessionId);
    if (isCurrent) {
      clearTokenCookie(res);
    }
    res.json({
      success: true,
      message: "Session revoked",
      wasCurrent: isCurrent,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/auth/sessions
 * Revoke all other sessions (keep current). No body. Query ?all=1 to revoke all including current (then cookie cleared).
 */
export async function revokeAllOtherSessions(req, res, next) {
  try {
    const userId = req.user._id;
    const currentSessionId = req.sessionId ? String(req.sessionId) : null;
    const revokeAll = req.query.all === "1" || req.query.all === "true";

    if (revokeAll) {
      await Session.deleteMany({ user: userId });
      clearTokenCookie(res);
      return res.json({ success: true, message: "All sessions revoked", revokedCurrent: true });
    }

    if (!currentSessionId) {
      await Session.deleteMany({ user: userId });
      return res.json({ success: true, message: "All sessions revoked", sessions: [] });
    }

    const result = await Session.deleteMany({
      user: userId,
      _id: { $ne: currentSessionId },
    });
    res.json({
      success: true,
      message: "All other sessions revoked",
      revokedCount: result.deletedCount,
    });
  } catch (err) {
    next(err);
  }
}
