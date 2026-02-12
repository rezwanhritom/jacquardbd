import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";
import * as cartApi from "../services/cart.service";
import { mapApiProduct } from "../utils/productUtils";

const STORAGE_KEY = "jacquard_guest_cart";

const CartContext = createContext(null);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

function getGuestCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function setGuestCart(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {}
}

function productId(p) {
  return p?._id ?? p?.id;
}

function normalizeCartItem(entry) {
  const product = entry.product;
  const mapped = mapApiProduct({ ...product, _id: product?._id || product?.id });
  return {
    product: { ...mapped, id: mapped.id || mapped._id, _id: mapped._id || mapped.id },
    quantity: Math.max(1, Math.floor(Number(entry.quantity)) || 1),
  };
}

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const setCartFromEntries = useCallback((entries) => {
    if (!Array.isArray(entries)) {
      setCartItems([]);
      return;
    }
    setCartItems(entries.map(normalizeCartItem));
  }, []);

  useEffect(() => {
    setLoading(true);
    if (isAuthenticated) {
      const guestCart = getGuestCart();
      const mongoItems = (guestCart || [])
        .filter((e) => e.product && (e.product._id || e.product.id))
        .map((e) => {
          const id = e.product._id || e.product.id;
          return { productId: String(id), quantity: Math.max(1, Math.floor(Number(e.quantity)) || 1) };
        })
        .filter((i) => /^[a-fA-F0-9]{24}$/.test(i.productId));

      if (mongoItems.length > 0) {
        cartApi.mergeCart(mongoItems).then(({ success, cart }) => {
          setGuestCart([]);
          setCartFromEntries(success && Array.isArray(cart) ? cart : []);
          setLoading(false);
        });
      } else {
        setGuestCart([]);
        cartApi.getCart().then(({ success, cart }) => {
          setCartFromEntries(success && Array.isArray(cart) ? cart : []);
          setLoading(false);
        });
      }
    } else {
      setCartFromEntries(getGuestCart());
      setLoading(false);
    }
  }, [isAuthenticated, setCartFromEntries]);

  const getCartTotal = useCallback(() => {
    return cartItems.reduce((sum, item) => {
      const price = item.product?.finalPrice ?? item.product?.price ?? 0;
      return sum + price * (item.quantity || 1);
    }, 0);
  }, [cartItems]);

  const getCartCount = useCallback(() => {
    return cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
  }, [cartItems]);

  const addToCart = useCallback(
    async (product, quantity = 1) => {
      const id = productId(product);
      if (!id) return { success: false, message: "Invalid product" };

      const qty = Math.max(1, Math.floor(Number(quantity)));
      const stock = product?.stockQuantity ?? 999;
      const inStock = stock > 0;

      if (isAuthenticated) {
        const prev = [...cartItems];
        const existing = cartItems.find((i) => productId(i.product) === id);
        const newQty = existing ? Math.min(existing.quantity + qty, stock) : Math.min(qty, stock);
        setCartItems((curr) => {
          const idx = curr.findIndex((i) => productId(i.product) === id);
          if (idx >= 0) {
            const next = [...curr];
            next[idx] = { ...next[idx], quantity: newQty };
            return next;
          }
          return [...curr, { product: { ...product, _id: id, id }, quantity: newQty }];
        });
        const { success, cart, message } = await cartApi.addToCart(id, qty);
        if (success && Array.isArray(cart)) {
          setCartFromEntries(cart);
        } else {
          setCartItems(prev);
        }
        return { success: success !== false, message };
      } else {
        const guest = getGuestCart();
        const existingIdx = guest.findIndex((e) => (e.product?._id || e.product?.id) === id);
        const addQty = Math.min(qty, Math.max(1, stock));
        if (existingIdx >= 0) {
          guest[existingIdx].quantity = Math.min(guest[existingIdx].quantity + addQty, stock);
        } else {
          guest.push({
            product: {
              _id: id,
              id,
              name: product.name,
              price: product.finalPrice ?? product.price,
              originalPrice: product.originalPrice,
              images: product.images,
              category: product.category,
              slug: product.slug,
              stockQuantity: product.stockQuantity,
            },
            quantity: addQty,
          });
        }
        setGuestCart(guest);
        setCartFromEntries(guest);
        return { success: true };
      }
    },
    [isAuthenticated, cartItems, setCartFromEntries]
  );

  const updateQuantity = useCallback(
    async (productOrId, quantity) => {
      const id = typeof productOrId === "string" ? productOrId : productId(productOrId);
      if (!id) return { success: false };

      const qty = Math.max(1, Math.floor(Number(quantity)));

      if (isAuthenticated) {
        const prev = [...cartItems];
        setCartItems((curr) => {
          const idx = curr.findIndex((i) => productId(i.product) === id);
          if (idx < 0) return curr;
          const next = [...curr];
          next[idx] = { ...next[idx], quantity: qty };
          return next;
        });
        const { success, cart } = await cartApi.updateCartQuantity(id, qty);
        if (success && Array.isArray(cart)) {
          setCartFromEntries(cart);
        } else {
          setCartItems(prev);
        }
        return { success: success !== false };
      } else {
        const guest = getGuestCart();
        const idx = guest.findIndex((e) => (e.product?._id || e.product?.id) === id);
        if (idx < 0) return { success: false };
        const stock = guest[idx].product?.stockQuantity ?? 999;
        guest[idx].quantity = Math.min(qty, Math.max(1, stock));
        setGuestCart(guest);
        setCartFromEntries(guest);
        return { success: true };
      }
    },
    [isAuthenticated, cartItems, setCartFromEntries]
  );

  const removeFromCart = useCallback(
    async (productOrId) => {
      const id = typeof productOrId === "string" ? productOrId : productId(productOrId);
      if (!id) return { success: false };

      if (isAuthenticated) {
        const prev = [...cartItems];
        setCartItems((curr) => curr.filter((i) => productId(i.product) !== id && String(productId(i.product)) !== String(id)));
        const { success, cart } = await cartApi.removeFromCart(id);
        if (!success) {
          setCartItems(prev);
        } else if (Array.isArray(cart)) {
          setCartFromEntries(cart);
        }
        return { success: success !== false };
      } else {
        const guest = getGuestCart().filter(
          (e) => (e.product?._id || e.product?.id) !== id && String(e.product?._id || e.product?.id) !== String(id)
        );
        setGuestCart(guest);
        setCartFromEntries(guest);
        return { success: true };
      }
    },
    [isAuthenticated, cartItems, setCartFromEntries]
  );

  const value = {
    cartItems,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    getCartTotal,
    getCartCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
