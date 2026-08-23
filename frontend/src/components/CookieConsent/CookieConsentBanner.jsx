import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiShield, FiShoppingBag, FiMessageCircle, FiSettings, FiX } from "react-icons/fi";
import { useCookieConsent } from "../../context/CookieConsentContext";

/**
 * Full cookie consent: first visit banner + reopenable preferences (footer).
 */
export default function CookieConsentBanner() {
  const {
    showBanner,
    settingsOpen,
    openCookieSettings,
    closeCookieSettings,
    acceptAll,
    rejectAll,
    saveSelected,
    shoppingAllowed,
    chatAllowed,
    decided,
  } = useCookieConsent();

  const [shop, setShop] = useState(true);
  const [chat, setChat] = useState(true);
  /** First visit: 'choose' then 'custom' for selected cookies */
  const [bannerStep, setBannerStep] = useState("choose");

  useEffect(() => {
    if (showBanner) setBannerStep("choose");
  }, [showBanner]);

  const openPrefs = () => {
    setShop(decided ? shoppingAllowed : true);
    setChat(decided ? chatAllowed : true);
    openCookieSettings();
  };

  const showCustomOnBanner = showBanner && bannerStep === "custom";
  const visible = showBanner || settingsOpen;

  return (
    <AnimatePresence>
      {visible && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[250] bg-black/50 backdrop-blur-sm"
            aria-hidden="true"
            onClick={showBanner ? undefined : closeCookieSettings}
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[251] flex items-center justify-center p-3 sm:p-4 pointer-events-none"
          >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="cookie-consent-title"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            className="pointer-events-auto w-full max-w-xl lg:max-w-2xl max-h-full overflow-hidden flex flex-col rounded-2xl shadow-2xl border"
            style={{
              backgroundColor: "var(--bg-primary)",
              borderColor: "var(--border-primary)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="flex items-start justify-between gap-3 p-4 sm:p-5 border-b shrink-0"
              style={{ borderColor: "var(--border-primary)", backgroundColor: "var(--bg-secondary)" }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: "var(--color-primary)", color: "white" }}
                >
                  <FiShield size={22} />
                </div>
                <div>
                  <h2 id="cookie-consent-title" className="text-lg sm:text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                    {showBanner ? "Cookies & your privacy" : "Cookie preferences"}
                  </h2>
                  <p className="text-xs sm:text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
                    Control how we use cookies on Jacquard.
                  </p>
                </div>
              </div>
              {!showBanner && (
                <button
                  type="button"
                  onClick={closeCookieSettings}
                  className="p-2 rounded-lg shrink-0"
                  style={{ color: "var(--text-secondary)" }}
                  aria-label="Close"
                >
                  <FiX size={22} />
                </button>
              )}
            </div>

            <div className="overflow-y-auto flex-1 p-4 sm:p-5 space-y-4 text-sm" style={{ color: "var(--text-secondary)" }}>
              <p className="leading-relaxed">
                We use cookies and similar technologies to run our site, remember your choices, and improve your experience.
                By law we need your consent for non-essential cookies.
              </p>

              <div
                className="rounded-xl p-4 border-2"
                style={{
                  borderColor: "var(--color-primary)",
                  backgroundColor: "var(--bg-secondary)",
                }}
              >
                <p className="font-bold text-sm sm:text-base mb-2" style={{ color: "var(--color-primary)" }}>
                  Shop without an account
                </p>
                <p className="leading-relaxed" style={{ color: "var(--text-primary)" }}>
                  If you accept <strong>shopping & cart</strong> cookies, you can add items to your cart and wishlist, place orders,
                  and view your order history on this device — <strong>without creating an account or logging in</strong>. Your cart
                  and guest orders are tied to cookies in your browser.
                </p>
              </div>

              <p className="text-xs leading-relaxed opacity-90">
                <strong style={{ color: "var(--text-primary)" }}>Strictly necessary</strong> cookies are always on (e.g. security,
                load balancing). Login sessions use separate authentication cookies when you sign in.
              </p>

              {(settingsOpen || showCustomOnBanner) && (
                <div className="space-y-3 pt-2">
                  <div
                    className="flex items-start gap-3 p-3 rounded-xl border"
                    style={{ borderColor: "var(--border-primary)", backgroundColor: "var(--bg-secondary)" }}
                  >
                    <FiShoppingBag className="shrink-0 mt-0.5" size={20} style={{ color: "var(--color-primary)" }} />
                    <div className="flex-1 min-w-0">
                      <label className="flex items-center gap-2 cursor-pointer font-semibold" style={{ color: "var(--text-primary)" }}>
                        <input
                          type="checkbox"
                          checked={shop}
                          onChange={(e) => setShop(e.target.checked)}
                          className="w-4 h-4 rounded"
                          style={{ accentColor: "var(--color-primary)" }}
                        />
                        Shopping, cart & wishlist
                      </label>
                      <p className="text-xs mt-1 leading-relaxed">
                        Saves your cart and wishlist locally and allows guest checkout. Required to buy without an account on this device.
                      </p>
                    </div>
                  </div>

                  <div
                    className="flex items-start gap-3 p-3 rounded-xl border"
                    style={{ borderColor: "var(--border-primary)", backgroundColor: "var(--bg-secondary)" }}
                  >
                    <FiMessageCircle className="shrink-0 mt-0.5" size={20} style={{ color: "var(--color-primary)" }} />
                    <div className="flex-1 min-w-0">
                      <label className="flex items-center gap-2 cursor-pointer font-semibold" style={{ color: "var(--text-primary)" }}>
                        <input
                          type="checkbox"
                          checked={chat}
                          onChange={(e) => setChat(e.target.checked)}
                          className="w-4 h-4 rounded"
                          style={{ accentColor: "var(--color-primary)" }}
                        />
                        Live chat
                      </label>
                      <p className="text-xs mt-1 leading-relaxed">
                        Remembers your chat thread on this device so you can talk to support without logging in.
                      </p>
                    </div>
                  </div>

                  <div
                    className="flex items-start gap-3 p-3 rounded-xl opacity-80 border"
                    style={{ borderColor: "var(--border-primary)" }}
                  >
                    <FiSettings className="shrink-0 mt-0.5" size={20} />
                    <div>
                      <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
                        Strictly necessary
                      </p>
                      <p className="text-xs mt-1">Always active. Needed for the website to function securely.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div
              className="shrink-0 p-4 sm:p-5 border-t flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end"
              style={{ borderColor: "var(--border-primary)", backgroundColor: "var(--bg-secondary)" }}
            >
              {showBanner && bannerStep === "choose" ? (
                <>
                  <button
                    type="button"
                    onClick={rejectAll}
                    className="w-full sm:w-auto order-3 sm:order-1 px-4 py-3 rounded-xl text-sm font-semibold border-2 transition-colors"
                    style={{ borderColor: "var(--border-primary)", color: "var(--text-primary)" }}
                  >
                    Reject all
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShop(true);
                      setChat(true);
                      setBannerStep("custom");
                    }}
                    className="w-full sm:w-auto order-2 px-4 py-3 rounded-xl text-sm font-semibold border-2 transition-colors"
                    style={{ borderColor: "var(--color-primary)", color: "var(--color-primary)" }}
                  >
                    Customise
                  </button>
                  <button
                    type="button"
                    onClick={acceptAll}
                    className="w-full sm:w-auto order-1 sm:order-3 px-4 py-3 rounded-xl text-sm font-semibold text-white"
                    style={{ backgroundColor: "var(--color-primary)" }}
                  >
                    Accept all cookies
                  </button>
                </>
              ) : showBanner && bannerStep === "custom" ? (
                <>
                  <button
                    type="button"
                    onClick={() => setBannerStep("choose")}
                    className="w-full sm:w-auto px-4 py-3 rounded-xl text-sm font-semibold border-2"
                    style={{ borderColor: "var(--border-primary)", color: "var(--text-primary)" }}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => saveSelected(shop, chat)}
                    className="w-full sm:w-auto px-4 py-3 rounded-xl text-sm font-semibold text-white"
                    style={{ backgroundColor: "var(--color-primary)" }}
                  >
                    Save selected preferences
                  </button>
                </>
              ) : !showBanner ? (
                <>
                  <button
                    type="button"
                    onClick={closeCookieSettings}
                    className="w-full sm:w-auto px-4 py-3 rounded-xl text-sm font-semibold border-2"
                    style={{ borderColor: "var(--border-primary)", color: "var(--text-primary)" }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => saveSelected(shop, chat)}
                    className="w-full sm:w-auto px-4 py-3 rounded-xl text-sm font-semibold text-white"
                    style={{ backgroundColor: "var(--color-primary)" }}
                  >
                    Save selected preferences
                  </button>
                </>
              ) : null}
            </div>
          </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
