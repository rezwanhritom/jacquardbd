import { createContext, useContext, useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { useAuth } from "./AuthContext";
import * as cartApi from "../services/cart.service";
import { mapApiProduct } from "../utils/productUtils";

const CartContext = createContext(null);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
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

  const refetchCart = useCallback(() => {
    if (!isAuthenticated) return Promise.resolve();
    setLoading(true);
    return cartApi.getCart().then(({ success, cart }) => {
      setCartFromEntries(success && Array.isArray(cart) ? cart : []);
      setLoading(false);
    });
  }, [isAuthenticated, setCartFromEntries]);

  useEffect(() => {
    setLoading(true);
    if (isAuthenticated) {
      cartApi.getCart().then(({ success, cart }) => {
        setCartFromEntries(success && Array.isArray(cart) ? cart : []);
        setLoading(false);
      });
    } else {
      setCartItems([]);
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
        toast.error("Please login to add items to cart");
        return { success: false, message: "Please login to add items to cart" };
      }

      if (isInCart(product)) {
        return { success: false, message: "Product already in cart" };
      }

      const qty = Math.max(1, Math.floor(Number(quantity)));
      const stock = product?.stockQuantity ?? 999;
      const addQty = Math.min(qty, Math.max(1, stock));
      const prev = [...cartItems];
      setCartItems((curr) => [...curr, { product: { ...product, _id: id, id }, quantity: addQty }]);
      const { success, cart, message } = await cartApi.addToCart(id, addQty);
      if (success && Array.isArray(cart)) {
        setCartFromEntries(cart);
        return { success: true, message };
      }
      setCartItems(prev);
      return { success: false, message: message || "Product already in cart" };
    },
    [isAuthenticated, cartItems, isInCart, setCartFromEntries]
  );

  const updateQuantity = useCallback(
    async (productOrId, quantity) => {
      if (!isAuthenticated) return { success: false };
      const id = typeof productOrId === "string" ? productOrId : productId(productOrId);
      if (!id) return { success: false };

      const qty = Math.max(1, Math.floor(Number(quantity)));
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
    },
    [isAuthenticated, cartItems, setCartFromEntries]
  );

  const removeFromCart = useCallback(
    async (productOrId) => {
      if (!isAuthenticated) return { success: false };
      const id = typeof productOrId === "string" ? productOrId : productId(productOrId);
      if (!id) return { success: false };

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
    isInCart,
    refetchCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
