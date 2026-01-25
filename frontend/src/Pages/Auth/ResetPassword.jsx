import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { FiLock, FiCheck, FiShield } from "react-icons/fi";
import { AuthLayout, FormInput, FormButton, PasswordStrength } from "../../components/Form";
import toast from "react-hot-toast";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isReset, setIsReset] = useState(false);

  const validatePassword = (password) => {
    return password.length >= 8;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const newErrors = {};

    if (name === "password" && value && !validatePassword(value)) {
      newErrors.password = "Password must be at least 8 characters";
    }
    if (name === "confirmPassword" && value && value !== formData.password) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...newErrors }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (!validatePassword(formData.password)) {
      newErrors.password = "Password must be at least 8 characters";
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsReset(true);
    toast.success("Password reset successfully!");
    setIsLoading(false);
  };

  return (
    <AuthLayout
      title={isReset ? "Password Reset!" : "Reset Password"}
      subtitle={
        isReset ? "Your password has been successfully reset" : "Create a new secure password"
      }
    >
      <AnimatePresence mode="wait">
        {!isReset ? (
          <motion.form
            key="form"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {/* Security notice */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-lg flex items-start gap-3"
              style={{ backgroundColor: "var(--bg-secondary)" }}
            >
              <FiShield size={20} style={{ color: "var(--color-primary)" }} className="mt-0.5" />
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Your new password must be different from previously used passwords.
              </p>
            </motion.div>

            {/* New Password */}
            <div className="space-y-2">
              <FormInput
                label="New Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter your new password"
                error={errors.password}
                icon={FiLock}
                required
                autoComplete="new-password"
              />
              <AnimatePresence>
                {formData.password && <PasswordStrength password={formData.password} />}
              </AnimatePresence>
            </div>

            {/* Confirm Password */}
            <FormInput
              label="Confirm New Password"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Confirm your new password"
              error={errors.confirmPassword}
              success={
                formData.confirmPassword &&
                formData.password === formData.confirmPassword &&
                !errors.confirmPassword
              }
              icon={FiLock}
              required
              autoComplete="new-password"
            />

            {/* Submit button */}
            <FormButton type="submit" loading={isLoading}>
              Reset Password
            </FormButton>

            {/* Back to login */}
            <p className="text-center text-sm" style={{ color: "var(--text-secondary)" }}>
              Remember your password?{" "}
              <Link
                to="/login"
                className="font-semibold transition-colors"
                style={{ color: "var(--color-primary)" }}
                onMouseEnter={(e) => (e.target.style.color = "var(--active-color)")}
                onMouseLeave={(e) => (e.target.style.color = "var(--color-primary)")}
              >
                Sign in
              </Link>
            </p>
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

            {/* Success message */}
            <div className="text-center space-y-2">
              <p style={{ color: "var(--text-secondary)" }}>
                You can now use your new password to sign in to your account.
              </p>
            </div>

            {/* Continue to login */}
            <FormButton onClick={() => navigate("/login")}>Continue to Login</FormButton>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthLayout>
  );
};

export default ResetPassword;
