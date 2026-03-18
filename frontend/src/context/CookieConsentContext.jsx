import { createContext, useContext, useState, useCallback, useEffect, useMemo } from "react";

const STORAGE_KEY = "jacquard_cookie_consent_v1";
const GUEST_CART_KEY = "jacquard_guest_cart";
const GUEST_WISHLIST_KEY = "jacquard_guest_wishlist";

const CookieConsentContext = createContext(null);

export function useCookieConsent() {
  const ctx = useContext(CookieConsentContext);
  if (!ctx) throw new Error("useCookieConsent must be used within CookieConsentProvider");
  return ctx;
}

function loadStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw);
    if (!p || typeof p !== "object") return null;
    return {
      version: 1,
      decided: !!p.decided,
      necessary: true,
      shopping: !!p.shopping,
      chat: !!p.chat,
      updatedAt: p.updatedAt || null,
    };
  } catch {
    return null;
  }
}

function clearGuestShoppingData() {
  try {
    localStorage.removeItem(GUEST_CART_KEY);
    localStorage.removeItem(GUEST_WISHLIST_KEY);
  } catch {}
}

export function CookieConsentProvider({ children }) {
  const [consent, setConsent] = useState(() => (typeof window !== "undefined" ? loadStored() : null));
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    setConsent(loadStored());
  }, []);

  const decided = consent?.decided === true;
  const shoppingAllowed = decided && consent?.shopping === true;
  const chatAllowed = decided && consent?.chat === true;

  const applyConsent = useCallback((next) => {
    const payload = {
      version: 1,
      decided: true,
      necessary: true,
      shopping: !!next.shopping,
      chat: !!next.chat,
      updatedAt: new Date().toISOString(),
    };
    if (!payload.shopping) {
      clearGuestShoppingData();
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {}
    setConsent(payload);
    window.dispatchEvent(new CustomEvent("jacquard-cookie-consent", { detail: payload }));
  }, []);

  const acceptAll = useCallback(() => {
    applyConsent({ shopping: true, chat: true });
    setSettingsOpen(false);
  }, [applyConsent]);

  const rejectAll = useCallback(() => {
    applyConsent({ shopping: false, chat: false });
    setSettingsOpen(false);
  }, [applyConsent]);

  const saveSelected = useCallback(
    (shopping, chat) => {
      applyConsent({ shopping, chat });
      setSettingsOpen(false);
    },
    [applyConsent]
  );

  const openCookieSettings = useCallback(() => setSettingsOpen(true), []);
  const closeCookieSettings = useCallback(() => setSettingsOpen(false), []);

  const value = useMemo(
    () => ({
      decided,
      shoppingAllowed,
      chatAllowed,
      consent,
      acceptAll,
      rejectAll,
      saveSelected,
      settingsOpen,
      openCookieSettings,
      closeCookieSettings,
      showBanner: !decided,
    }),
    [decided, shoppingAllowed, chatAllowed, consent, acceptAll, rejectAll, saveSelected, settingsOpen, openCookieSettings, closeCookieSettings]
  );

  return <CookieConsentContext.Provider value={value}>{children}</CookieConsentContext.Provider>;
}
