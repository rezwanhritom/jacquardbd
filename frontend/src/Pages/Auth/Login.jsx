import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { FiMail, FiLock, FiAlertCircle, FiCheck } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { AuthLayout, FormInput, FormButton, FormCheckbox } from "../../components/Form";
import toast from "react-hot-toast";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    // Validate on blur
    if (name === "email" && value && !validateEmail(value)) {
      setErrors((prev) => ({ ...prev, email: "Please enter a valid email address" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Mock login
    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Mock validation - demo@example.com with any password succeeds
    if (formData.email === "demo@example.com") {
      setShowSuccess(true);
      toast.success("Login successful! Welcome back.");
      setTimeout(() => {
        navigate("/");
      }, 1000);
    } else {
      // For demo: show error for other emails
      setErrors({ general: "Invalid email or password. Try demo@example.com" });
      toast.error("Invalid credentials");
    }

    setIsLoading(false);
  };

  const handleSocialLogin = (provider) => {
    toast.success(`${provider} login coming soon!`);
  };

  return (
    <AuthLayout title="Welcome Back" subtitle="Sign in to your account to continue">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General error */}
        <AnimatePresence>
          {errors.general && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 rounded-lg flex items-center gap-3"
              style={{ backgroundColor: "rgba(220, 38, 38, 0.1)" }}
            >
              <FiAlertCircle style={{ color: "var(--color-tertiary)" }} />
              <p className="text-sm" style={{ color: "var(--color-tertiary)" }}>
                {errors.general}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success message */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 rounded-lg flex items-center gap-3"
              style={{ backgroundColor: "rgba(34, 197, 94, 0.1)" }}
            >
              <FiCheck style={{ color: "var(--color-secondary)" }} />
              <p className="text-sm" style={{ color: "var(--color-secondary)" }}>
                Login successful! Redirecting...
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Email */}
        <FormInput
          label="Email Address"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Enter your email"
          error={errors.email}
          icon={FiMail}
          required
          autoComplete="email"
        />

        {/* Password */}
        <FormInput
          label="Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Enter your password"
          error={errors.password}
          icon={FiLock}
          required
          autoComplete="current-password"
        />

        {/* Remember me & Forgot password */}
        <div className="flex items-center justify-between">
          <FormCheckbox
            name="rememberMe"
            checked={formData.rememberMe}
            onChange={handleChange}
            label="Remember me"
          />
          <Link
            to="/forgot-password"
            className="text-sm font-medium transition-colors"
            style={{ color: "var(--color-primary)" }}
            onMouseEnter={(e) => (e.target.style.color = "var(--active-color)")}
            onMouseLeave={(e) => (e.target.style.color = "var(--color-primary)")}
          >
            Forgot password?
          </Link>
        </div>

        {/* Submit button */}
        <FormButton type="submit" loading={isLoading} disabled={showSuccess}>
          Sign In
        </FormButton>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t" style={{ borderColor: "var(--border-primary)" }} />
          </div>
          <div className="relative flex justify-center text-sm">
            <span
              className="px-4"
              style={{ backgroundColor: "var(--bg-primary)", color: "var(--text-tertiary)" }}
            >
              Or continue with
            </span>
          </div>
        </div>

        {/* Social login buttons */}
        <div className="grid grid-cols-1 gap-3">
          <motion.button
            type="button"
            onClick={() => handleSocialLogin("Google")}
            className="flex items-center justify-center gap-3 px-4 py-3 border-2 rounded-lg transition-colors"
            style={{
              borderColor: "var(--border-primary)",
              backgroundColor: "var(--bg-primary)",
              color: "var(--text-primary)",
            }}
            whileHover={{ scale: 1.02, backgroundColor: "var(--bg-secondary)" }}
            whileTap={{ scale: 0.98 }}
          >
            <FcGoogle size={20} />
            <span className="text-sm font-medium">Continue with Google</span>
          </motion.button>
        </div>

        {/* Sign up link */}
        <p className="text-center text-sm" style={{ color: "var(--text-secondary)" }}>
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-semibold transition-colors"
            style={{ color: "var(--color-primary)" }}
            onMouseEnter={(e) => (e.target.style.color = "var(--active-color)")}
            onMouseLeave={(e) => (e.target.style.color = "var(--color-primary)")}
          >
            Create one
          </Link>
        </p>

        {/* Demo hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-xs p-3 rounded-lg"
          style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-tertiary)" }}
        >
          Demo: Use <strong>demo@example.com</strong> with any password
        </motion.p>
      </form>
    </AuthLayout>
  );
};

export default Login;
