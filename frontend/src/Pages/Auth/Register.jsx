import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { GoogleLogin } from "@react-oauth/google";
import { FiUser, FiMail, FiLock, FiAlertCircle, FiCheck } from "react-icons/fi";
import { AuthLayout, FormInput, FormButton, PasswordStrength } from "../../components/Form";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "";

const Register = () => {
  const navigate = useNavigate();
  const { register: registerUser, loginWithGoogle } = useAuth();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 8;
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
    const newErrors = {};

    switch (name) {
      case "email":
        if (value && !validateEmail(value)) {
          newErrors.email = "Please enter a valid email address";
        }
        break;
      case "password":
        if (value && !validatePassword(value)) {
          newErrors.password = "Password must be at least 8 characters";
        }
        break;
      case "confirmPassword":
        if (value && value !== formData.password) {
          newErrors.confirmPassword = "Passwords do not match";
        }
        break;
      default:
        break;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...newErrors }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields
    const newErrors = {};
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (!validatePassword(formData.password)) {
      newErrors.password = "Password must be at least 8 characters";
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else     if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = "You must agree to the Terms of Service and Privacy Policy";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    const name = `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim();
    const result = await registerUser(name, formData.email.trim(), formData.password);

    if (result.success) {
      setShowSuccess(true);
      toast.success("Account created. Please verify your email to sign in.");
      const emailForUrl = result.email || formData.email;
      setTimeout(() => navigate(`/verify-email-sent${emailForUrl ? `?email=${encodeURIComponent(emailForUrl)}` : ""}`), 800);
    } else {
      setErrors({
        ...(result.errors?.length ? { general: result.errors[0] } : {}),
        ...(result.message && !result.errors?.length ? { general: result.message } : {}),
      });
      toast.error(result.message || "Registration failed");
    }

    setIsLoading(false);
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    const idToken = credentialResponse?.credential;
    if (!idToken) {
      toast.error("Google sign-in failed");
      return;
    }
    setGoogleLoading(true);
    setErrors({});
    const result = await loginWithGoogle(idToken);
    setGoogleLoading(false);
    if (result.success) {
      toast.success("Account created and signed in!");
      navigate("/", { replace: true });
    } else {
      setErrors({ general: result.message || "Google sign-up failed" });
      toast.error(result.message || "Google sign-up failed");
    }
  };

  return (
    <AuthLayout title="Create Account" subtitle="Join us and discover premium fashion">
      <form onSubmit={handleSubmit} className="space-y-5">
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
                Account created! Check your email to verify, then sign in.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Name fields */}
        <div className="grid grid-cols-2 gap-4">
          <FormInput
            label="First Name"
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="First name"
            error={errors.firstName}
            icon={FiUser}
            required
            autoComplete="given-name"
          />
          <FormInput
            label="Last Name"
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Last name"
            error={errors.lastName}
            required
            autoComplete="family-name"
          />
        </div>

        {/* Email */}
        <FormInput
          label="Email Address"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Provide a Gmail"
          error={errors.email}
          success={formData.email && validateEmail(formData.email) && !errors.email}
          icon={FiMail}
          required
          autoComplete="email"
        />

        {/* Password */}
        <div className="space-y-2">
          <FormInput
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Create a strong password"
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
          label="Confirm Password"
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Confirm your password"
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

        {/* Terms and Privacy */}
        <div className="space-y-2">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="agreeToTerms"
              checked={formData.agreeToTerms}
              onChange={handleChange}
              className="mt-1 rounded"
              style={{ accentColor: "var(--color-primary)" }}
            />
            <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
              I agree to the{" "}
              <Link to="/terms" className="font-medium underline" style={{ color: "var(--color-primary)" }}>
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="font-medium underline" style={{ color: "var(--color-primary)" }}>
                Privacy Policy
              </Link>
            </span>
          </label>
          {errors.agreeToTerms && (
            <p className="text-sm" style={{ color: "var(--color-tertiary)" }}>
              {errors.agreeToTerms}
            </p>
          )}
        </div>

        {/* Submit button */}
        <FormButton type="submit" loading={isLoading} disabled={showSuccess}>
          Create Account
        </FormButton>

        {googleClientId && (
          <>
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
              Or sign up with
            </span>
          </div>
        </div>

        {/* Social signup */}
        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => {
              setGoogleLoading(false);
              toast.error("Google sign-up was cancelled or failed");
            }}
            useOneTap={false}
            theme="filled_black"
            size="large"
            text="signup_with"
            shape="rectangular"
            width="320"
          />
        </div>
          </>
        )}

        {/* Login link */}
        <p className="text-center text-sm" style={{ color: "var(--text-secondary)" }}>
          Already have an account?{" "}
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
      </form>
    </AuthLayout>
  );
};

export default Register;
