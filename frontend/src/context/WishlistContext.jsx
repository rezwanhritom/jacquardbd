import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";
import * as wishlistApi from "../services/wishlist.service";
import { mapApiProduct } from "../utils/productUtils";

const STORAGE_KEY = "jacquard_guest_wishlist";

const WishlistContext = createContext(null);

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}

function getGuestWishlist() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function setGuestWishlist(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {}
}

function productId(p) {
  return p?._id ?? p?.id;
}

export function WishlistProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const normalizeItem = useCallback((p) => {
    const mapped = mapApiProduct({ ...p, _id: p._id || p.id });
    return { ...mapped, id: mapped.id || mapped._id, _id: mapped._id || mapped.id };
  }, []);

  // Fetch wishlist when authenticated
  const fetchWishlist = useCallback(async () => {
    const { success, wishlist } = await wishlistApi.getWishlist();
    if (success && Array.isArray(wishlist)) {
      setWishlistItems(wishlist.map(normalizeItem));
    } else {
      setWishlistItems([]);
    }
  }, [normalizeItem]);

  // Load initial: auth => API (or merge then set), guest => localStorage
  useEffect(() => {
    setLoading(true);
    if (isAuthenticated) {
      const guestItems = getGuestWishlist();
      const mongoIds = (guestItems || [])
        .map((p) => (typeof p._id === "string" ? p._id : p.id))
        .filter((id) => id && /^[a-fA-F0-9]{24}$/.test(String(id)));

      if (mongoIds.length > 0) {
        wishlistApi.mergeWishlist(mongoIds).then(({ success, wishlist }) => {
          setGuestWishlist([]);
          setWishlistItems(success && Array.isArray(wishlist) ? wishlist.map(normalizeItem) : []);
          setLoading(false);
        });
      } else {
        setGuestWishlist([]);
        wishlistApi.getWishlist().then(({ success, wishlist }) => {
          setWishlistItems(success && Array.isArray(wishlist) ? wishlist.map(normalizeItem) : []);
          setLoading(false);
        });
      }
    } else {
      setWishlistItems(getGuestWishlist().map(normalizeItem));
      setLoading(false);
    }
  }, [isAuthenticated, normalizeItem]);

  const isInWishlist = useCallback(
    (product) => {
      const id = productId(product);
      if (!id) return false;
      return wishlistItems.some((item) => productId(item) === id || String(productId(item)) === String(id));
    },
    [wishlistItems]
  );

  const addToWishlist = useCallback(
    async (product) => {
      const id = productId(product);
      if (!id) return { success: false, message: "Invalid product" };

      const alreadyIn = wishlistItems.some(
        (p) => productId(p) === id || String(productId(p)) === String(id)
      );
      if (alreadyIn) return { success: true, message: "Already in wishlist" };

      if (isAuthenticated) {
        const prev = [...wishlistItems];
        setWishlistItems((curr) => [...curr, normalizeItem(product)]);
        const { success, wishlist, message } = await wishlistApi.addToWishlist(id);
        if (success && Array.isArray(wishlist)) {
          setWishlistItems(wishlist.map(normalizeItem));
        } else {
          setWishlistItems(prev);
        }
        return { success: success !== false, message };
      } else {
        const guest = getGuestWishlist();
        guest.push({
          _id: id,
          id,
          name: product.name,
          price: product.finalPrice ?? product.price,
          originalPrice: product.originalPrice,
          discount: product.discount,
          images: product.images,
          category: product.category,
          slug: product.slug,
        });
        setGuestWishlist(guest);
        setWishlistItems(guest.map(normalizeItem));
        return { success: true };
      }
    },
    [isAuthenticated, wishlistItems, normalizeItem]
  );

  const removeFromWishlist = useCallback(
    async (productOrId) => {
      const id = typeof productOrId === "string" ? productOrId : productId(productOrId);
      if (!id) return { success: false };

      if (isAuthenticated) {
        const prev = [...wishlistItems];
        setWishlistItems((curr) => curr.filter((p) => productId(p) !== id && String(productId(p)) !== String(id)));
        const { success, wishlist } = await wishlistApi.removeFromWishlist(id);
        if (!success) {
          setWishlistItems(prev);
        } else if (Array.isArray(wishlist)) {
          setWishlistItems(wishlist.map(normalizeItem));
        }
        return { success };
      } else {
        const guest = getGuestWishlist().filter((p) => productId(p) !== id && String(productId(p)) !== String(id));
        setGuestWishlist(guest);
        setWishlistItems(guest.map(normalizeItem));
        return { success: true };
      }
    },
    [isAuthenticated, wishlistItems, normalizeItem]
  );

  const value = {
    wishlistItems,
    loading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    fetchWishlist,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}
