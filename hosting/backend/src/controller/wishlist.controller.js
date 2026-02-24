import User from "../models/User.js";
import Product from "../models/Product.js";

const MONGO_ID_REGEX = /^[a-fA-F0-9]{24}$/;

/**
 * GET /api/wishlist
 * Return populated wishlist products (name, price, images, category, slug, _id).
 */
export async function getWishlist(req, res, next) {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: "wishlist",
        select: "name price images category slug _id originalPrice discount finalPrice stockQuantity",
      })
      .lean();

    const products = user?.wishlist ?? [];
    res.json({ success: true, wishlist: products });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/wishlist/:productId
 * Add product to wishlist. Prevent duplicates.
 */
export async function addToWishlist(req, res, next) {
  try {
    const { productId } = req.params;
    if (!productId || !MONGO_ID_REGEX.test(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    const alreadyAdded = user.wishlist.some(
      (id) => id.toString() === productId
    );
    if (alreadyAdded) {
      const populated = await User.findById(req.user._id)
        .populate({
          path: "wishlist",
          select: "name price images category slug _id originalPrice discount finalPrice stockQuantity",
        })
        .lean();
      return res.status(200).json({
        success: true,
        message: "Already in wishlist",
        wishlist: populated?.wishlist ?? user.wishlist,
      });
    }

    user.wishlist.push(productId);
    await user.save();

    const updated = await User.findById(req.user._id)
      .populate({
        path: "wishlist",
        select: "name price images category slug _id originalPrice discount finalPrice stockQuantity",
      })
      .lean();

    res.status(201).json({
      success: true,
      message: "Added to wishlist",
      wishlist: updated.wishlist,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/wishlist/merge
 * Body: { productIds: string[] }. Add multiple products (e.g. from guest localStorage). Prevents duplicates.
 */
export async function mergeWishlist(req, res, next) {
  try {
    const productIds = req.body?.productIds;
    if (!Array.isArray(productIds) || productIds.length === 0) {
      return res.json({ success: true, message: "Nothing to merge", wishlist: (await User.findById(req.user._id).populate("wishlist", "name price images category slug _id originalPrice discount finalPrice stockQuantity").lean())?.wishlist ?? [] });
    }

    const validIds = productIds.filter((id) => typeof id === "string" && MONGO_ID_REGEX.test(id));
    if (validIds.length === 0) {
      return res.json({ success: true, wishlist: (await User.findById(req.user._id).populate("wishlist", "name price images category slug _id originalPrice discount finalPrice stockQuantity").lean())?.wishlist ?? [] });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(401).json({ success: false, message: "User not found" });

    const existingSet = new Set(user.wishlist.map((id) => id.toString()));
    let added = 0;
    for (const id of validIds) {
      if (!existingSet.has(id)) {
        user.wishlist.push(id);
        existingSet.add(id);
        added++;
      }
    }
    await user.save();

    const updated = await User.findById(req.user._id)
      .populate({ path: "wishlist", select: "name price images category slug _id originalPrice discount finalPrice stockQuantity" })
      .lean();

    res.json({
      success: true,
      message: added > 0 ? `Merged ${added} item(s) into wishlist` : "Already in wishlist",
      wishlist: updated.wishlist,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/wishlist/:productId
 * Remove product from wishlist.
 */
export async function removeFromWishlist(req, res, next) {
  try {
    const { productId } = req.params;
    if (!productId || !MONGO_ID_REGEX.test(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    user.wishlist = user.wishlist.filter((id) => id.toString() !== productId);
    await user.save();

    const updated = await User.findById(req.user._id)
      .populate({
        path: "wishlist",
        select: "name price images category slug _id originalPrice discount finalPrice stockQuantity",
      })
      .lean();

    res.json({
      success: true,
      message: "Removed from wishlist",
      wishlist: updated.wishlist,
    });
  } catch (err) {
    next(err);
  }
}
