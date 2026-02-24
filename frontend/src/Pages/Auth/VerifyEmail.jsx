import { useEffect, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { FiCheck, FiAlertCircle } from "react-icons/fi";
import { AuthLayout } from "../../components/Form";
import { verifyEmail as verifyEmailApi } from "../../services/auth.service";
import toast from "react-hot-toast";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const [status, setStatus] = useState("loading"); // loading | success | error

  useEffect(() => {
    if (!token) {
      setStatus("error");
      return;
    }
    let cancelled = false;
    verifyEmailApi(token).then((result) => {
      if (cancelled) return;
      if (result.success) {
        setStatus("success");
        toast.success(result.message || "Email verified. You can sign in now.");
        setTimeout(() => navigate("/login", { replace: true }), 2000);
      } else {
        setStatus("error");
      }
    });
    return () => {
      cancelled = true;
    };
  }, [token, navigate]);

  return (
    <AuthLayout
      title="Verify your email"
      subtitle={status === "loading" ? "Verifying..." : status === "success" ? "Done!" : "Something went wrong"}
    >
      <div className="space-y-6">
        <AnimatePresence mode="wait">
          {status === "loading" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4"
            >
              <div
                className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin"
                style={{ borderColor: "var(--color-primary)", borderTopColor: "transparent" }}
              />
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Verifying your email...
              </p>
            </motion.div>
          )}
          {status === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="p-6 rounded-lg flex flex-col items-center gap-3"
              style={{ backgroundColor: "rgba(34, 197, 94, 0.1)" }}
            >
              <FiCheck size={40} style={{ color: "var(--color-secondary)" }} />
              <p className="text-sm text-center" style={{ color: "var(--color-secondary)" }}>
                Your email has been verified. Redirecting to sign in...
              </p>
            </motion.div>
          )}
          {status === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div
                className="p-4 rounded-lg flex items-center gap-3"
                style={{ backgroundColor: "rgba(220, 38, 38, 0.1)" }}
              >
                <FiAlertCircle style={{ color: "var(--color-tertiary)" }} />
                <p className="text-sm" style={{ color: "var(--color-tertiary)" }}>
                  {token
                    ? "Invalid or expired verification link. Request a new one from the sign-in page."
                    : "Missing verification token. Use the link from your email."}
                </p>
              </div>
              <p className="text-center">
                <Link
                  to="/login"
                  className="font-semibold transition-colors"
                  style={{ color: "var(--color-primary)" }}
                  onMouseEnter={(e) => (e.target.style.color = "var(--active-color)")}
                  onMouseLeave={(e) => (e.target.style.color = "var(--color-primary)")}
                >
                  Go to sign in
                </Link>
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AuthLayout>
  );
};

export default VerifyEmail;
