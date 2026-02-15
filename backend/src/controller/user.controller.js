import User from "../models/User.js";

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

/**
 * GET /api/users/me - already served by GET /api/auth/me. This is an alias or for consistency.
 * PATCH /api/users/me - update name and/or profileImage (url set after ImageKit upload).
 */
export async function updateMe(req, res, next) {
  try {
    const { name, profileImage } = req.body;
    const updates = {};
    if (typeof name === "string" && name.trim()) updates.name = name.trim();
    if (typeof profileImage === "string") updates.profileImage = profileImage || null;
    if (Object.keys(updates).length === 0) {
      return res.json({ success: true, user: userResponse(req.user) });
    }
    const user = await User.findByIdAndUpdate(req.user._id, { $set: updates }, { new: true })
      .select("-password")
      .lean();
    res.json({ success: true, message: "Profile updated", user: userResponse(user) });
  } catch (err) {
    next(err);
  }
}
