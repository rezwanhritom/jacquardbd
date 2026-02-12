import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "react-hot-toast";
import "./index.css";
import { AuthProvider } from "./context/AuthContext";
import { router } from "./Routes/Routes.jsx";
import { RouterProvider } from "react-router";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
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
    </AuthProvider>
  </StrictMode>
);
