import { useNavigate } from "react-router";
import { useCart } from "../../context/CartContext";

/**
 * Shown once (until dismissed) after a guest successfully adds an item to cart.
 */
const GuestCartLoginPrompt = () => {
  const navigate = useNavigate();
  const { guestCartLoginPromptOpen, dismissGuestCartLoginPrompt, completeGuestCartLoginPrompt } =
    useCart();

  if (!guestCartLoginPromptOpen) return null;

  const goLogin = () => {
    completeGuestCartLoginPrompt();
    navigate("/login");
  };

  const goRegister = () => {
    completeGuestCartLoginPrompt();
    navigate("/register");
  };

  return (
    <div
      className="fixed inset-0 z-[160] flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0, 20, 14, 0.55)" }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="guest-cart-login-title"
      aria-describedby="guest-cart-login-desc"
    >
      <div
        className="w-full max-w-md rounded-xl shadow-xl border p-5 sm:p-6 relative"
        style={{
          backgroundColor: "var(--bg-primary)",
          borderColor: "var(--border-primary)",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.18)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="guest-cart-login-title"
          className="text-base sm:text-lg font-bold mb-3"
          style={{ color: "var(--text-primary)", fontFamily: "var(--font-sans)" }}
        >
          Added to your cart
        </h2>
        <p
          id="guest-cart-login-desc"
          className="text-sm leading-relaxed mb-5"
          style={{ color: "var(--text-secondary)" }}
        >
          You can still order without logging in or creating an account. For a better experience—saved
          addresses, order history, and wishlist—we suggest{" "}
          <strong style={{ color: "var(--text-primary)" }}>logging in</strong> or{" "}
          <strong style={{ color: "var(--text-primary)" }}>signing up</strong>.
        </p>
        <div className="flex flex-col-reverse sm:flex-row sm:flex-wrap gap-2 sm:gap-3">
          <button
            type="button"
            onClick={dismissGuestCartLoginPrompt}
            className="w-full sm:w-auto sm:flex-1 min-w-0 py-2.5 px-4 rounded-lg text-sm font-medium border transition-colors"
            style={{
              borderColor: "var(--border-primary)",
              color: "var(--text-secondary)",
              backgroundColor: "var(--bg-secondary)",
            }}
          >
            Dismiss
          </button>
          <button
            type="button"
            onClick={goLogin}
            className="w-full sm:w-auto sm:flex-1 min-w-0 py-2.5 px-4 rounded-lg text-sm font-semibold text-white transition-colors"
            style={{ backgroundColor: "var(--color-primary)" }}
          >
            Log in
          </button>
          <button
            type="button"
            onClick={goRegister}
            className="w-full sm:w-auto sm:flex-1 min-w-0 py-2.5 px-4 rounded-lg text-sm font-semibold border-2 transition-colors"
            style={{
              borderColor: "var(--color-primary)",
              color: "var(--color-primary)",
              backgroundColor: "transparent",
            }}
          >
            Sign up
          </button>
        </div>
      </div>
    </div>
  );
};

export default GuestCartLoginPrompt;
