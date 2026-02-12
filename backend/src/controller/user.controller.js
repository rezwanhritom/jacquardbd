import User from "../models/User.js";
import Product from "../models/Product.js";

const MONGO_ID_REGEX = /^[a-fA-F0-9]{24}$/;
const PRODUCT_SELECT = "name price images category slug _id originalPrice discount finalPrice stockQuantity";

/**
 * GET /api/users/:userId
 * Return profile (name, email, avatar, createdAt, updatedAt). Same-user only.
 */
export async function getProfile(req, res, next) {
  try {
    const { userId } = req.params;
    if (!userId || !MONGO_ID_REGEX.test(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }

    const user = await User.findById(userId)
      .select("name email avatar createdAt updatedAt")
      .lean();
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar ?? "",
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/users/:userId
 * Update name, email, avatar. Same-user only. Validation required.
 */
export async function updateProfile(req, res, next) {
  try {
    const { userId } = req.params;
    if (!userId || !MONGO_ID_REGEX.test(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }

    const { name, email, avatar } = req.body || {};
    const updates = {};

    if (name !== undefined) {
      const trimmed = String(name).trim();
      if (!trimmed) {
        return res.status(400).json({ success: false, message: "Name is required" });
      }
      updates.name = trimmed;
    }

    if (email !== undefined) {
      const trimmed = String(email).trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!trimmed) {
        return res.status(400).json({ success: false, message: "Email is required" });
      }
      if (!emailRegex.test(trimmed)) {
        return res.status(400).json({ success: false, message: "Invalid email format" });
      }
      const existing = await User.findOne({ email: trimmed, _id: { $ne: userId } });
      if (existing) {
        return res.status(409).json({ success: false, message: "Email already in use" });
      }
      updates.email = trimmed;
    }

    if (avatar !== undefined) {
      updates.avatar = String(avatar).trim();
    }

    if (Object.keys(updates).length === 0) {
      const user = await User.findById(userId).select("name email avatar createdAt updatedAt").lean();
      if (!user) return res.status(404).json({ success: false, message: "User not found" });
      return res.json({
        success: true,
        message: "No changes",
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar ?? "",
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    )
      .select("name email avatar createdAt updatedAt")
      .lean();

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      message: "Profile updated",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar ?? "",
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/users/:userId/wishlist
 * Return populated wishlist. Same-user only.
 */
export async function getWishlist(req, res, next) {
  try {
    const { userId } = req.params;
    if (!userId || !MONGO_ID_REGEX.test(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }

    const user = await User.findById(userId)
      .populate({
        path: "wishlist",
        select: PRODUCT_SELECT,
      })
      .lean();

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, wishlist: user.wishlist ?? [] });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/users/:userId/wishlist/:productId
 * Add product to wishlist. No duplicates. Same-user only.
 */
export async function addToWishlist(req, res, next) {
  try {
    const { userId, productId } = req.params;
    if (!userId || !MONGO_ID_REGEX.test(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }
    if (!productId || !MONGO_ID_REGEX.test(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const alreadyAdded = user.wishlist.some((id) => id.toString() === productId);
    if (alreadyAdded) {
      const populated = await User.findById(userId)
        .populate({ path: "wishlist", select: PRODUCT_SELECT })
        .lean();
      return res.status(200).json({
        success: true,
        message: "Already in wishlist",
        wishlist: populated?.wishlist ?? [],
      });
    }

    user.wishlist.push(productId);
    await user.save();

    const updated = await User.findById(userId)
      .populate({ path: "wishlist", select: PRODUCT_SELECT })
      .lean();

    res.status(201).json({
      success: true,
      message: "Added to wishlist",
      wishlist: updated.wishlist ?? [],
    });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/users/:userId/wishlist/:productId
 * Remove product from wishlist. Same-user only.
 */
export async function removeFromWishlist(req, res, next) {
  try {
    const { userId, productId } = req.params;
    if (!userId || !MONGO_ID_REGEX.test(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }
    if (!productId || !MONGO_ID_REGEX.test(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.wishlist = user.wishlist.filter((id) => id.toString() !== productId);
    await user.save();

    const updated = await User.findById(userId)
      .populate({ path: "wishlist", select: PRODUCT_SELECT })
      .lean();

    res.json({
      success: true,
      message: "Removed from wishlist",
      wishlist: updated.wishlist ?? [],
    });
  } catch (err) {
    next(err);
  }
}
