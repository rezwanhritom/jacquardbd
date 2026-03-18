import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from "react-hot-toast";
import "./index.css";
import { CookieConsentProvider } from "./context/CookieConsentContext";
import { AuthProvider } from "./context/AuthContext";
import { WishlistProvider } from "./context/WishlistContext";
import { CartProvider } from "./context/CartContext";
import { ChatProvider } from "./context/ChatContext";
import CookieConsentBanner from "./components/CookieConsent/CookieConsentBanner";
import ChatWidget from "./components/ChatWidget";
import { router } from "./Routes/Routes.jsx";
import { RouterProvider } from "react-router";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "";

const toasterOptions = {
  duration: 1500,
  className: "toast-compact",
  style: {
    background: "var(--bg-secondary)",
    color: "var(--text-primary)",
    border: "1px solid var(--border-primary)",
    fontSize: "0.6875rem",
    padding: "4px 8px",
    minHeight: "auto",
    maxWidth: "min(200px, calc(100vw - 28px))",
    boxShadow: "0 1px 6px rgba(0, 0, 0, 0.08)",
  },
  success: {
    iconTheme: {
      primary: "var(--color-primary)",
      secondary: "white",
    },
  },
  error: {
    iconTheme: {
      primary: "var(--color-tertiary)",
      secondary: "white",
    },
  },
};

function RemoveLoadingScreen({ children }) {
  useEffect(() => {
    const el = document.getElementById("app-loading");
    if (el) el.remove();
  }, []);
  return children;
}

const App = () => (
  <RemoveLoadingScreen>
    {googleClientId ? (
      <GoogleOAuthProvider clientId={googleClientId}>
        <CookieConsentProvider>
        <AuthProvider>
          <ChatProvider>
          <WishlistProvider>
            <CartProvider>
            <>
              <RouterProvider router={router} />
              <CookieConsentBanner />
              <ChatWidget />
              <Toaster position="top-right" toastOptions={toasterOptions} />
            </>
            </CartProvider>
          </WishlistProvider>
          </ChatProvider>
        </AuthProvider>
        </CookieConsentProvider>
      </GoogleOAuthProvider>
    ) : (
      <CookieConsentProvider>
      <AuthProvider>
        <ChatProvider>
        <WishlistProvider>
          <CartProvider>
            <>
              <RouterProvider router={router} />
              <CookieConsentBanner />
              <ChatWidget />
              <Toaster position="top-right" toastOptions={toasterOptions} />
            </>
          </CartProvider>
        </WishlistProvider>
        </ChatProvider>
      </AuthProvider>
      </CookieConsentProvider>
    )}
  </RemoveLoadingScreen>
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
