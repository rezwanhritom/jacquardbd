import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import toast from "react-hot-toast";
import { useAuth } from "./AuthContext";
import { useCookieConsent } from "./CookieConsentContext";
import * as cartApi from "../services/cart.service";
import { mapApiProduct } from "../utils/productUtils";

const CartContext = createContext(null);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

export const GUEST_CART_STORAGE_KEY = "jacquard_guest_cart";
const MONGO_ID_REGEX = /^[a-fA-F0-9]{24}$/;

function productId(p) {
  const raw = p?._id ?? p?.id;
  if (raw == null) return null;
  return String(raw).trim();
}

function isValidMongoId(id) {
  return typeof id === "string" && MONGO_ID_REGEX.test(id);
}

function normalizeCartItem(entry) {
  const product = entry.product;
  const mapped = mapApiProduct({ ...product, _id: product?._id || product?.id });
  return {
    product: { ...mapped, id: mapped.id || mapped._id, _id: mapped._id || mapped.id },
    quantity: Math.max(1, Math.floor(Number(entry.quantity)) || 1),
  };
}

function loadGuestCartRaw() {
  try {
    const raw = localStorage.getItem(GUEST_CART_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveGuestCartRaw(entries) {
  try {
    localStorage.setItem(GUEST_CART_STORAGE_KEY, JSON.stringify(entries));
  } catch {}
}

function guestEntriesToState(entries) {
  return entries.map((e) => normalizeCartItem({ product: e.product, quantity: e.quantity }));
}

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const { decided, shoppingAllowed } = useCookieConsent();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const mergedGuestRef = useRef(false);

  const setCartFromEntries = useCallback((entries) => {
    if (!Array.isArray(entries)) {
      setCartItems([]);
      return;
    }
    setCartItems(entries.map(normalizeCartItem));
  }, []);

  const refetchCart = useCallback(() => {
    if (!isAuthenticated) return Promise.resolve();
    setLoading(true);
    return cartApi.getCart().then(({ success, cart }) => {
      setCartFromEntries(success && Array.isArray(cart) ? cart : []);
      setLoading(false);
    });
  }, [isAuthenticated, setCartFromEntries]);

  // Load cart: auth from API; guest from localStorage if shopping cookies allowed
  useEffect(() => {
    mergedGuestRef.current = false;
    setLoading(true);
    if (isAuthenticated) {
      cartApi.getCart().then(({ success, cart }) => {
        setCartFromEntries(success && Array.isArray(cart) ? cart : []);
        setLoading(false);
      });
    } else if (decided && shoppingAllowed) {
      const raw = loadGuestCartRaw();
      setCartItems(guestEntriesToState(raw));
      setLoading(false);
    } else {
      setCartItems([]);
      setLoading(false);
    }
  }, [isAuthenticated, decided, shoppingAllowed, setCartFromEntries]);

  useEffect(() => {
    if (!isAuthenticated) mergedGuestRef.current = false;
  }, [isAuthenticated]);

  // Merge guest cart into server cart after login
  useEffect(() => {
    if (!isAuthenticated || mergedGuestRef.current) return;
    const raw = loadGuestCartRaw();
    if (!Array.isArray(raw) || raw.length === 0) {
      mergedGuestRef.current = true;
      return;
    }
    const items = raw
      .filter((e) => e.productId && isValidMongoId(String(e.productId)))
      .map((e) => ({
        productId: String(e.productId),
        quantity: Math.max(1, Math.floor(Number(e.quantity)) || 1),
      }));
    mergedGuestRef.current = true;
    if (items.length === 0) {
      try {
        localStorage.removeItem(GUEST_CART_STORAGE_KEY);
      } catch {}
      return;
    }
    cartApi.mergeCart(items).then(({ success, cart }) => {
      try {
        localStorage.removeItem(GUEST_CART_STORAGE_KEY);
      } catch {}
      if (success && Array.isArray(cart)) {
        setCartFromEntries(cart);
      }
      setLoading(false);
    });
  }, [isAuthenticated, setCartFromEntries]);

  useEffect(() => {
    const onConsent = () => {
      if (!isAuthenticated && decided && shoppingAllowed) {
        const raw = loadGuestCartRaw();
        setCartItems(guestEntriesToState(raw));
      }
      if (!shoppingAllowed && !isAuthenticated) {
        setCartItems([]);
      }
    };
    window.addEventListener("jacquard-cookie-consent", onConsent);
    return () => window.removeEventListener("jacquard-cookie-consent", onConsent);
  }, [isAuthenticated, decided, shoppingAllowed]);

  const persistGuestCart = useCallback((items) => {
    const serial = items.map((i) => ({
      productId: productId(i.product),
      quantity: i.quantity,
      product: { ...i.product, _id: productId(i.product), id: productId(i.product) },
    }));
    saveGuestCartRaw(serial);
  }, []);

  const getCartTotal = useCallback(() => {
    return cartItems.reduce((sum, item) => {
      const price = item.product?.finalPrice ?? item.product?.price ?? 0;
      return sum + price * (item.quantity || 1);
    }, 0);
  }, [cartItems]);

  const getCartCount = useCallback(() => {
    return cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
  }, [cartItems]);

  const isInCart = useCallback(
    (product) => {
      const id = productId(product);
      if (!id) return false;
      return cartItems.some(
        (i) => productId(i.product) === id || String(productId(i.product)) === String(id)
      );
    },
    [cartItems]
  );

  const addToCart = useCallback(
    async (product, quantity = 1) => {
      const id = productId(product);
      if (!id) return { success: false, message: "Invalid product" };

      if (!isAuthenticated) {
        if (!decided) {
          toast.error("Please accept cookies (or log in) to use your cart.");
          return { success: false, message: "Cookie consent required" };
        }
        if (!shoppingAllowed) {
          toast.error("Enable shopping cookies in settings, or log in to use your cart.");
          return { success: false, message: "Shopping cookies required" };
        }
        if (!isValidMongoId(id)) {
          toast.error("Add from category or product page to add to cart.");
          return { success: false, message: "Invalid product id" };
        }
        if (isInCart(product)) {
          return { success: false, message: "Product already in cart" };
        }
        const qty = Math.max(1, Math.floor(Number(quantity)));
        const stock = product?.stockQuantity ?? 999;
        const addQty = Math.min(qty, Math.max(1, stock));
        const entry = { product: { ...product, _id: id, id }, quantity: addQty };
        const next = [...cartItems, entry];
        setCartItems(next);
        persistGuestCart(next);
        return { success: true };
      }

      if (!isValidMongoId(id)) {
        toast.error("Add from Men, Women or the product page to add to cart.");
        return { success: false, message: "Add from Men, Women or the product page to add to cart." };
      }

      if (isInCart(product)) {
        return { success: false, message: "Product already in cart" };
      }

      const qty = Math.max(1, Math.floor(Number(quantity)));
      const stock = product?.stockQuantity ?? 999;
      const addQty = Math.min(qty, Math.max(1, stock));
      const prev = [...cartItems];
      setCartItems((curr) => [...curr, { product: { ...product, _id: id, id }, quantity: addQty }]);
      try {
        const { success, cart, message } = await cartApi.addToCart(id, addQty);
        if (success && Array.isArray(cart)) {
          setCartFromEntries(cart);
          return { success: true, message };
        }
        setCartItems(prev);
        return { success: false, message: message || "Failed to add to cart" };
      } catch (err) {
        setCartItems(prev);
        return { success: false, message: err?.message || "Failed to add to cart" };
      }
    },
    [isAuthenticated, decided, shoppingAllowed, cartItems, isInCart, setCartFromEntries, persistGuestCart]
  );

  const updateQuantity = useCallback(
    async (productOrId, quantity) => {
      const id = typeof productOrId === "string" ? productOrId : productId(productOrId);
      if (!id) return { success: false };
      const qty = Math.max(1, Math.floor(Number(quantity)));

      if (!isAuthenticated) {
        if (!shoppingAllowed) return { success: false };
        const next = cartItems.map((i) =>
          productId(i.product) === id || String(productId(i.product)) === String(id) ? { ...i, quantity: qty } : i
        );
        setCartItems(next);
        persistGuestCart(next);
        return { success: true };
      }

      const prev = [...cartItems];
      setCartItems((curr) => {
        const idx = curr.findIndex((i) => productId(i.product) === id);
        if (idx < 0) return curr;
        const n = [...curr];
        n[idx] = { ...n[idx], quantity: qty };
        return n;
      });
      const { success, cart } = await cartApi.updateCartQuantity(id, qty);
      if (success && Array.isArray(cart)) {
        setCartFromEntries(cart);
      } else {
        setCartItems(prev);
      }
      return { success: success !== false };
    },
    [isAuthenticated, shoppingAllowed, cartItems, setCartFromEntries, persistGuestCart]
  );

  const clearGuestCart = useCallback(() => {
    try {
      localStorage.removeItem(GUEST_CART_STORAGE_KEY);
    } catch {}
    setCartItems([]);
  }, []);

  const removeFromCart = useCallback(
    async (productOrId) => {
      const id = typeof productOrId === "string" ? productOrId : productId(productOrId);
      if (!id) return { success: false };

      if (!isAuthenticated) {
        if (!shoppingAllowed) return { success: false };
        const next = cartItems.filter(
          (i) => productId(i.product) !== id && String(productId(i.product)) !== String(id)
        );
        setCartItems(next);
        persistGuestCart(next);
        return { success: true };
      }

      const prev = [...cartItems];
      setCartItems((curr) =>
        curr.filter((i) => productId(i.product) !== id && String(productId(i.product)) !== String(id))
      );
      const { success, cart } = await cartApi.removeFromCart(id);
      if (!success) {
        setCartItems(prev);
      } else if (Array.isArray(cart)) {
        setCartFromEntries(cart);
      }
      return { success: success !== false };
    },
    [isAuthenticated, shoppingAllowed, cartItems, setCartFromEntries, persistGuestCart]
  );

  const value = {
    cartItems,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    getCartTotal,
    getCartCount,
    isInCart,
    refetchCart,
    isGuestCart: !isAuthenticated && shoppingAllowed,
    clearGuestCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
