import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from "react-hot-toast";
import "./index.css";
import { AuthProvider } from "./context/AuthContext";
import { WishlistProvider } from "./context/WishlistContext";
import { CartProvider } from "./context/CartContext";
import { ChatProvider } from "./context/ChatContext";
import { router } from "./Routes/Routes.jsx";
import { RouterProvider } from "react-router";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "";

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
        <AuthProvider>
          <ChatProvider>
          <WishlistProvider>
            <CartProvider>
            <>
              <RouterProvider router={router} />
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 3000,
                  style: {
                    background: "var(--bg-secondary)",
                    color: "var(--text-primary)",
                    border: "1px solid var(--border-primary)",
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
                }}
              />
            </>
            </CartProvider>
          </WishlistProvider>
          </ChatProvider>
        </AuthProvider>
      </GoogleOAuthProvider>
    ) : (
      <AuthProvider>
        <ChatProvider>
        <WishlistProvider>
          <CartProvider>
            <>
              <RouterProvider router={router} />
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 3000,
                  style: {
                    background: "var(--bg-secondary)",
                    color: "var(--text-primary)",
                    border: "1px solid var(--border-primary)",
                  },
                  success: { iconTheme: { primary: "var(--color-primary)", secondary: "white" } },
                  error: { iconTheme: { primary: "var(--color-tertiary)", secondary: "white" } },
                }}
              />
            </>
          </CartProvider>
        </WishlistProvider>
        </ChatProvider>
      </AuthProvider>
    )}
  </RemoveLoadingScreen>
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
