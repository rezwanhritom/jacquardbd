import { useState } from "react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { FiMail, FiArrowLeft, FiCheck, FiSend } from "react-icons/fi";
import { AuthLayout, FormInput, FormButton } from "../../components/Form";
import toast from "react-hot-toast";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleChange = (e) => {
    setEmail(e.target.value);
    if (error) setError("");
  };

  const handleBlur = () => {
    if (email && !validateEmail(email)) {
      setError("Please enter a valid email address");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setError("Email is required");
      return;
    }
    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsEmailSent(true);
    toast.success("Reset link sent to your email!");
    setIsLoading(false);
  };

  const handleResend = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success("Reset link sent again!");
    setIsLoading(false);
  };

  return (
    <AuthLayout
      title={isEmailSent ? "Check Your Email" : "Forgot Password"}
      subtitle={
        isEmailSent
          ? `We've sent a password reset link to ${email}`
          : "Enter your email and we'll send you a reset link"
      }
    >
      <AnimatePresence mode="wait">
        {!isEmailSent ? (
          <motion.form
            key="form"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {/* Email */}
            <FormInput
              label="Email Address"
              type="email"
              name="email"
              value={email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter your email address"
              error={error}
              icon={FiMail}
              required
              autoComplete="email"
            />

            {/* Submit button */}
            <FormButton type="submit" loading={isLoading} icon={FiSend}>
              Send Reset Link
            </FormButton>

            {/* Back to login */}
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 text-sm font-medium transition-colors"
              style={{ color: "var(--text-secondary)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-primary)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
            >
              <FiArrowLeft size={16} />
              Back to login
            </Link>
          </motion.form>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Success icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="mx-auto w-20 h-20 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "rgba(34, 197, 94, 0.1)" }}
            >
              <FiCheck size={40} style={{ color: "var(--color-secondary)" }} />
            </motion.div>

            {/* Instructions */}
            <div
              className="p-4 rounded-lg text-sm space-y-2"
              style={{ backgroundColor: "var(--bg-secondary)" }}
            >
              <p style={{ color: "var(--text-secondary)" }}>
                Click the link in the email to reset your password. If you don't see it, check your
                spam folder.
              </p>
            </div>

            {/* Resend button */}
            <FormButton
              type="button"
              variant="secondary"
              onClick={handleResend}
              loading={isLoading}
            >
              Resend Email
            </FormButton>

            {/* Back to login */}
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 text-sm font-medium transition-colors"
              style={{ color: "var(--text-secondary)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-primary)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
            >
              <FiArrowLeft size={16} />
              Back to login
            </Link>

            {/* Demo hint */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center text-xs p-3 rounded-lg"
              style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-tertiary)" }}
            >
              Demo: Click{" "}
              <Link
                to="/reset-password"
                className="font-semibold underline"
                style={{ color: "var(--color-primary)" }}
              >
                here
              </Link>{" "}
              to simulate opening the reset link
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthLayout>
  );
};

export default ForgotPassword;
