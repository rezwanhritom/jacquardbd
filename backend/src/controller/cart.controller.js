import User from "../models/User.js";
import Product from "../models/Product.js";

const MONGO_ID_REGEX = /^[a-fA-F0-9]{24}$/;
const PRODUCT_SELECT = "name price images category slug _id originalPrice discount finalPrice stockQuantity";

function getPopulatedCart(userId) {
  return User.findById(userId)
    .populate({ path: "cart.product", select: PRODUCT_SELECT })
    .lean()
    .then((u) => u?.cart ?? []);
}

/**
 * GET /api/cart
 * Return full cart with populated product (name, price, images, stock).
 */
export async function getCart(req, res, next) {
  try {
    const cart = await getPopulatedCart(req.user._id);
    res.json({ success: true, cart });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/cart/:productId
 * Add to cart. A product can only be added once.
 * If product already in cart → 400 "Product already in cart" (do not increase quantity).
 * Body optional: { quantity: number } for the initial add.
 */
export async function addToCart(req, res, next) {
  try {
    const { productId } = req.params;
    const qty = Math.max(1, Math.floor(Number(req.body?.quantity) || 1));

    if (!productId || !MONGO_ID_REGEX.test(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    const product = await Product.findById(productId).select(`stockQuantity ${PRODUCT_SELECT}`);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(401).json({ success: false, message: "User not found" });

    const entry = user.cart.find((e) => e.product.toString() === productId);
    if (entry) {
      return res.status(400).json({ success: false, message: "Product already in cart" });
    }

    const stock = product.stockQuantity ?? 0;
    user.cart.push({ product: productId, quantity: Math.min(qty, Math.max(1, stock)) });
    await user.save();

    const cart = await getPopulatedCart(req.user._id);
    res.status(201).json({ success: true, message: "Added to cart", cart });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/cart/:productId
 * Update quantity. Body: { quantity: number }. Min 1, max stock.
 */
export async function updateCartQuantity(req, res, next) {
  try {
    const { productId } = req.params;
    let qty = Math.floor(Number(req.body?.quantity));
    if (!Number.isFinite(qty) || qty < 1) qty = 1;

    if (!productId || !MONGO_ID_REGEX.test(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    const product = await Product.findById(productId).select("stockQuantity");
    const stock = product?.stockQuantity ?? 0;
    qty = Math.min(qty, Math.max(1, stock));

    const user = await User.findById(req.user._id);
    if (!user) return res.status(401).json({ success: false, message: "User not found" });

    const entry = user.cart.find((e) => e.product.toString() === productId);
    if (!entry) {
      return res.status(404).json({ success: false, message: "Item not in cart" });
    }
    entry.quantity = qty;
    await user.save();

    const cart = await getPopulatedCart(req.user._id);
    res.json({ success: true, message: "Cart updated", cart });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/cart/:productId
 * Remove item from cart.
 */
export async function removeFromCart(req, res, next) {
  try {
    const { productId } = req.params;
    if (!productId || !MONGO_ID_REGEX.test(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(401).json({ success: false, message: "User not found" });

    user.cart = user.cart.filter((e) => e.product.toString() !== productId);
    await user.save();

    const cart = await getPopulatedCart(req.user._id);
    res.json({ success: true, message: "Removed from cart", cart });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/cart/merge
 * Body: { items: [{ productId: string, quantity: number }] }.
 * Merge guest cart: add only products not already in cart (no duplicates, no quantity bump).
 */
export async function mergeCart(req, res, next) {
  try {
    const items = req.body?.items;
    if (!Array.isArray(items) || items.length === 0) {
      const cart = await getPopulatedCart(req.user._id);
      return res.json({ success: true, message: "Nothing to merge", cart });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(401).json({ success: false, message: "User not found" });

    const validItems = items.filter(
      (i) => i && typeof i.productId === "string" && MONGO_ID_REGEX.test(i.productId) && Number(i.quantity) >= 1
    );
    const qtyByProduct = new Map();
    for (const i of validItems) {
      const id = i.productId;
      const q = Math.max(1, Math.floor(Number(i.quantity)));
      if (!qtyByProduct.has(id)) qtyByProduct.set(id, q);
    }

    for (const [productId, addQty] of qtyByProduct) {
      const entry = user.cart.find((e) => e.product.toString() === productId);
      if (entry) continue;
      const product = await Product.findById(productId).select("stockQuantity");
      const stock = product?.stockQuantity ?? 0;
      user.cart.push({ product: productId, quantity: Math.min(addQty, Math.max(1, stock)) });
    }
    await user.save();

    const cart = await getPopulatedCart(req.user._id);
    res.json({ success: true, message: "Cart merged", cart });
  } catch (err) {
    next(err);
  }
}
