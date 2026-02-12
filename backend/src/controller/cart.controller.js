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
 * Add to cart or increase quantity. Body optional: { quantity: number }.
 * Checks stock before increasing.
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
    const stock = product.stockQuantity ?? 0;
    if (entry) {
      const newQty = Math.min(entry.quantity + qty, Math.max(1, stock));
      entry.quantity = newQty;
    } else {
      user.cart.push({ product: productId, quantity: Math.min(qty, Math.max(1, stock)) });
    }
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
 * Merge guest cart: add or combine quantities. Validates productId and stock.
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
      qtyByProduct.set(id, (qtyByProduct.get(id) || 0) + q);
    }

    for (const [productId, addQty] of qtyByProduct) {
      const product = await Product.findById(productId).select("stockQuantity");
      const stock = product?.stockQuantity ?? 0;
      const maxQty = Math.max(1, stock);
      const entry = user.cart.find((e) => e.product.toString() === productId);
      if (entry) {
        entry.quantity = Math.min(entry.quantity + addQty, maxQty);
      } else {
        user.cart.push({ product: productId, quantity: Math.min(addQty, maxQty) });
      }
    }
    await user.save();

    const cart = await getPopulatedCart(req.user._id);
    res.json({ success: true, message: "Cart merged", cart });
  } catch (err) {
    next(err);
  }
}
