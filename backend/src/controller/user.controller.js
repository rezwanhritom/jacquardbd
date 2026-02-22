import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import { ORDER_STATUS } from "../models/Order.js";

const MONGO_ID_REGEX = /^[a-fA-F0-9]{24}$/;
const PRODUCT_SELECT = "name price images category slug _id originalPrice discount finalPrice stockQuantity";

/**
 * GET /api/users/admin/list
 * Admin only. Returns all users (customers) with order count and total spent (from paid orders).
 */
export async function getAdminCustomers(req, res, next) {
  try {
    const users = await User.find({}).select("name email avatar role createdAt").lean().sort({ createdAt: -1 });

    const orderStats = await Order.aggregate([
      { $match: { status: ORDER_STATUS.PAID } },
      { $group: { _id: "$user", orderCount: { $sum: 1 }, totalSpent: { $sum: "$amount" } } },
    ]);
    const statsByUser = Object.fromEntries(orderStats.map((s) => [String(s._id), { orderCount: s.orderCount, totalSpent: s.totalSpent }]));

    const list = users.map((u) => {
      const stats = statsByUser[String(u._id)] || { orderCount: 0, totalSpent: 0 };
      return {
        _id: u._id,
        name: u.name,
        email: u.email,
        avatar: u.avatar ?? "",
        role: u.role ?? "user",
        joined: u.createdAt,
        orders: stats.orderCount,
        totalSpent: stats.totalSpent,
        status: stats.orderCount > 0 ? "Active" : "Inactive",
      };
    });

    res.json({ success: true, customers: list });
  } catch (err) {
    next(err);
  }
}

const ROLES = ["user", "admin", "premium"];

/**
 * POST /api/users/admin
 * Admin only. Create a new user. Body: { name, email, password, role? }.
 */
export async function createUserAdmin(req, res, next) {
  try {
    const { name, email, password, role } = req.body || {};
    const trimmedName = String(name ?? "").trim();
    const trimmedEmail = String(email ?? "").toLowerCase().trim();
    const plainPassword = password == null ? "" : String(password);

    if (!trimmedName) {
      return res.status(400).json({ success: false, message: "Name is required" });
    }
    if (!trimmedEmail) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return res.status(400).json({ success: false, message: "Invalid email format" });
    }
    if (plainPassword.length < 8) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
    }
    const roleValue = role && ROLES.includes(role) ? role : "user";

    const existing = await User.findOne({ email: trimmedEmail });
    if (existing) {
      return res.status(409).json({ success: false, message: "Email already in use" });
    }

    const user = new User({
      name: trimmedName,
      email: trimmedEmail,
      password: plainPassword,
      role: roleValue,
    });
    await user.save();

    const safe = await User.findById(user._id).select("name email avatar role createdAt").lean();
    res.status(201).json({ success: true, user: safe, message: "User created" });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/users/admin/:userId
 * Admin only. Update a user (name, email, password, role). Partial updates allowed.
 */
export async function updateUserAdmin(req, res, next) {
  try {
    const { userId } = req.params;
    if (!userId || !MONGO_ID_REGEX.test(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const { name, email, password, role } = req.body || {};

    if (name !== undefined) {
      const trimmed = String(name).trim();
      if (!trimmed) return res.status(400).json({ success: false, message: "Name is required" });
      user.name = trimmed;
    }
    if (email !== undefined) {
      const trimmed = String(email).trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!trimmed) return res.status(400).json({ success: false, message: "Email is required" });
      if (!emailRegex.test(trimmed)) return res.status(400).json({ success: false, message: "Invalid email format" });
      const existing = await User.findOne({ email: trimmed, _id: { $ne: userId } });
      if (existing) return res.status(409).json({ success: false, message: "Email already in use" });
      user.email = trimmed;
    }
    if (password !== undefined && password !== "") {
      if (String(password).length < 8) {
        return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
      }
      user.password = String(password);
    }
    if (role !== undefined) {
      if (!ROLES.includes(role)) return res.status(400).json({ success: false, message: "Invalid role" });
      user.role = role;
    }

    await user.save();

    const updated = await User.findById(userId).select("name email avatar role createdAt").lean();
    res.json({ success: true, user: updated, message: "User updated" });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/users/admin/:userId
 * Admin only. Delete a user by id. Orders are not deleted (they keep the user ref).
 */
export async function deleteUserAdmin(req, res, next) {
  try {
    const { userId } = req.params;
    if (!userId || !MONGO_ID_REGEX.test(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.role === "admin") {
      return res.status(403).json({ success: false, message: "Cannot delete an admin user" });
    }

    await User.findByIdAndDelete(userId);
    res.json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    next(err);
  }
}

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
