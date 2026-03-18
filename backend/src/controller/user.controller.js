import mongoose from "mongoose";
import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import { PAYMENT_STATUS } from "../models/Order.js";

const PAID_MATCH = { $or: [{ paymentStatus: PAYMENT_STATUS.PAID }, { status: "paid" }] };

const MONGO_ID_REGEX = /^[a-fA-F0-9]{24}$/;
const PRODUCT_SELECT = "name price images category slug _id originalPrice discount finalPrice stockQuantity";

/** Normalize addresses: at most one isDefault; ensure each has _id for frontend. */
function normalizeAddresses(list) {
  if (!Array.isArray(list) || list.length === 0) return [];
  const arr = list.map((a, i) => ({
    _id: a._id || undefined,
    label: String(a.label ?? "").trim(),
    name: String(a.name ?? "").trim(),
    phone: String(a.phone ?? "").trim(),
    address: String(a.address ?? "").trim(),
    city: String(a.city ?? "").trim(),
    state: String(a.state ?? "").trim(),
    zip: String(a.zip ?? "").trim(),
    country: String(a.country ?? "").trim(),
    isDefault: i === 0 ? true : !!a.isDefault,
  }));
  const defaultIndex = arr.findIndex((a) => a.isDefault);
  if (defaultIndex === -1) arr[0].isDefault = true;
  else arr.forEach((a, i) => { a.isDefault = i === defaultIndex; });
  return arr;
}

/**
 * GET /api/users/admin/list
 * Admin only. Returns all users (customers) with order count and total spent (from paid orders).
 */
export async function getAdminCustomers(req, res, next) {
  try {
    const users = await User.find({}).select("name email avatar role phone createdAt premiumAppliedAt").lean().sort({ createdAt: -1 });

    const orderStats = await Order.aggregate([
      { $match: PAID_MATCH },
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
        premiumAppliedAt: u.premiumAppliedAt ?? null,
        phone: u.phone ?? "",
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

/**
 * GET /api/users/admin/:userId
 * Admin only. Returns one user with addresses (for edit form).
 */
export async function getOneUserAdmin(req, res, next) {
  try {
    const { userId } = req.params;
    if (!userId || !MONGO_ID_REGEX.test(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }
    const user = await User.findById(userId)
      .select("name email avatar role phone createdAt premiumAppliedAt addresses rewardPoints")
      .lean();
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    const addresses = (user.addresses || []).map((a) => ({
      _id: a._id,
      label: a.label ?? "",
      name: a.name ?? "",
      phone: a.phone ?? "",
      address: a.address ?? "",
      city: a.city ?? "",
      state: a.state ?? "",
      zip: a.zip ?? "",
      country: a.country ?? "",
      isDefault: !!a.isDefault,
    }));
    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar ?? "",
        role: user.role ?? "user",
        premiumAppliedAt: user.premiumAppliedAt ?? null,
        phone: user.phone ?? "",
        createdAt: user.createdAt,
        addresses,
        rewardPoints: user.rewardPoints ?? 0,
      },
    });
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

    const { name, email, password, role, phone, addresses: addressesBody, rewardPoints: rpBody } =
      req.body || {};

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
      if (role === "premium") {
        user.premiumAppliedAt = null;
      }
    }
    if (phone !== undefined) {
      user.phone = String(phone).trim();
    }
    if (addressesBody !== undefined) {
      if (!Array.isArray(addressesBody)) {
        return res.status(400).json({ success: false, message: "addresses must be an array" });
      }
      const normalized = normalizeAddresses(addressesBody);
      user.addresses = normalized.map((a) => ({
        _id: a._id && MONGO_ID_REGEX.test(String(a._id)) ? a._id : new mongoose.Types.ObjectId(),
        label: a.label,
        name: a.name,
        phone: a.phone,
        address: a.address,
        city: a.city,
        state: a.state,
        zip: a.zip,
        country: a.country,
        isDefault: a.isDefault,
      }));
    }
    if (rpBody !== undefined) {
      const n = Math.max(0, Math.floor(Number(rpBody)) || 0);
      user.rewardPoints = n;
    }

    await user.save();

    const updated = await User.findById(userId)
      .select("name email avatar role phone createdAt premiumAppliedAt addresses rewardPoints")
      .lean();
    res.json({
      success: true,
      user: {
        ...updated,
        premiumAppliedAt: updated.premiumAppliedAt ?? null,
        rewardPoints: updated.rewardPoints ?? 0,
      },
      message: "User updated",
    });
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
 * POST /api/users/:userId/apply-premium
 * Same-user only. Set premiumAppliedAt so admin can see and approve. Only for role "user".
 */
export async function applyForPremium(req, res, next) {
  try {
    const { userId } = req.params;
    if (!userId || !MONGO_ID_REGEX.test(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    if (user.role !== "user") {
      return res.status(400).json({ success: false, message: "Only standard members can apply for premium" });
    }
    user.premiumAppliedAt = user.premiumAppliedAt || new Date();
    await user.save();
    const updated = await User.findById(userId).select("name email role premiumAppliedAt createdAt").lean();
    res.json({ success: true, user: updated, message: "Application submitted. An admin will review it." });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/users/:userId/dashboard
 * Same-user only. Returns dashboard stats: user, totalOrders, totalSpent, wishlistCount, avgOrderValue, recentOrders.
 */
export async function getAccountDashboard(req, res, next) {
  try {
    const { userId } = req.params;
    if (!userId || !MONGO_ID_REGEX.test(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }

    const [userDoc, orderStats, wishlistCount, recentOrdersList] = await Promise.all([
      User.findById(userId).select("name email avatar role createdAt premiumAppliedAt").lean(),
      Order.aggregate([
        { $match: { user: new mongoose.Types.ObjectId(userId) } },
        {
          $facet: {
            all: [{ $count: "total" }],
            paid: [
              { $match: PAID_MATCH },
              { $group: { _id: null, count: { $sum: 1 }, totalSpent: { $sum: "$amount" } } },
            ],
          },
        },
      ]).then((r) => r[0] || {}),
      User.findById(userId).select("wishlist").lean().then((u) => (u?.wishlist?.length ?? 0)),
      Order.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    if (!userDoc) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const totalOrders = orderStats.all?.[0]?.total ?? 0;
    const paidFacet = orderStats.paid?.[0];
    const paidCount = paidFacet?.count ?? 0;
    const totalSpent = paidFacet?.totalSpent ?? 0;
    const avgOrderValue = paidCount > 0 ? totalSpent / paidCount : 0;

    const recentOrders = recentOrdersList.map((o) => ({
      _id: o._id,
      orderId: `ORD-${String(o._id).slice(-10).toUpperCase()}`,
      date: o.createdAt,
      status: o.status,
      total: o.amount,
      currency: o.currency ?? "BDT",
      items: (o.items || []).map((item) => ({
        productId: item.productId,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
    }));

    res.json({
      success: true,
      data: {
        user: {
          _id: userDoc._id,
          name: userDoc.name,
          email: userDoc.email,
          avatar: userDoc.avatar ?? "",
          role: userDoc.role ?? "user",
          premiumAppliedAt: userDoc.premiumAppliedAt ?? null,
          createdAt: userDoc.createdAt,
        },
        totalOrders,
        totalSpent,
        wishlistCount,
        avgOrderValue,
        recentOrders,
      },
    });
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
      .select("name email avatar phone createdAt updatedAt addresses rewardPoints")
      .lean();
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const addresses = (user.addresses || []).map((a) => ({
      _id: a._id,
      label: a.label ?? "",
      name: a.name ?? "",
      phone: a.phone ?? "",
      address: a.address ?? "",
      city: a.city ?? "",
      state: a.state ?? "",
      zip: a.zip ?? "",
      country: a.country ?? "",
      isDefault: !!a.isDefault,
    }));

    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar ?? "",
        phone: user.phone ?? "",
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        addresses,
        rewardPoints: user.rewardPoints ?? 0,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/users/:userId
 * Update name, email, avatar, phone, addresses. Same-user only. Validation required.
 */
export async function updateProfile(req, res, next) {
  try {
    const { userId } = req.params;
    if (!userId || !MONGO_ID_REGEX.test(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }

    const { name, email, avatar, phone, addresses: addressesBody } = req.body || {};
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
    if (phone !== undefined) {
      updates.phone = String(phone).trim();
    }
    if (addressesBody !== undefined) {
      if (!Array.isArray(addressesBody)) {
        return res.status(400).json({ success: false, message: "addresses must be an array" });
      }
      const normalized = normalizeAddresses(addressesBody);
      updates.addresses = normalized.map((a) => ({
        _id: a._id && MONGO_ID_REGEX.test(String(a._id)) ? a._id : new mongoose.Types.ObjectId(),
        label: a.label,
        name: a.name,
        phone: a.phone,
        address: a.address,
        city: a.city,
        state: a.state,
        zip: a.zip,
        country: a.country,
        isDefault: a.isDefault,
      }));
    }

    if (Object.keys(updates).length === 0) {
      const user = await User.findById(userId).select("name email avatar phone createdAt updatedAt addresses").lean();
      if (!user) return res.status(404).json({ success: false, message: "User not found" });
      const addresses = (user.addresses || []).map((a) => ({
        _id: a._id,
        label: a.label ?? "",
        name: a.name ?? "",
        phone: a.phone ?? "",
        address: a.address ?? "",
        city: a.city ?? "",
        state: a.state ?? "",
        zip: a.zip ?? "",
        country: a.country ?? "",
        isDefault: !!a.isDefault,
      }));
      return res.json({
        success: true,
        message: "No changes",
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar ?? "",
          phone: user.phone ?? "",
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          addresses,
        },
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    )
      .select("name email avatar phone createdAt updatedAt addresses")
      .lean();

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const addresses = (user.addresses || []).map((a) => ({
      _id: a._id,
      label: a.label ?? "",
      name: a.name ?? "",
      phone: a.phone ?? "",
      address: a.address ?? "",
      city: a.city ?? "",
      state: a.state ?? "",
      zip: a.zip ?? "",
      country: a.country ?? "",
      isDefault: !!a.isDefault,
    }));

    res.json({
      success: true,
      message: "Profile updated",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar ?? "",
        phone: user.phone ?? "",
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        addresses,
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
