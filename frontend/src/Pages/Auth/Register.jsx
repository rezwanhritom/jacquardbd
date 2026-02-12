import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { FiUser, FiMail, FiLock, FiAlertCircle, FiCheck } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { AuthLayout, FormInput, FormButton, FormCheckbox, PasswordStrength } from "../../components/Form";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

const Register = () => {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
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
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = "You must agree to the terms and conditions";
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
      toast.success("Account created successfully!");
      setTimeout(() => navigate("/login"), 1200);
    } else {
      setErrors({
        ...(result.errors?.length ? { general: result.errors[0] } : {}),
        ...(result.message && !result.errors?.length ? { general: result.message } : {}),
      });
      toast.error(result.message || "Registration failed");
    }

    setIsLoading(false);
  };

  const handleSocialSignup = (provider) => {
    toast.success(`${provider} signup coming soon!`);
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
                Account created! Redirecting to login...
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
            placeholder="John"
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
            placeholder="Doe"
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
          placeholder="john@example.com"
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

        {/* Terms and conditions */}
        <FormCheckbox
          name="agreeToTerms"
          checked={formData.agreeToTerms}
          onChange={handleChange}
          error={errors.agreeToTerms}
          label={
            <span>
              I agree to the{" "}
              <Link
                to="/terms"
                className="font-medium underline"
                style={{ color: "var(--color-primary)" }}
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                to="/privacy"
                className="font-medium underline"
                style={{ color: "var(--color-primary)" }}
              >
                Privacy Policy
              </Link>
            </span>
          }
        />

        {/* Submit button */}
        <FormButton type="submit" loading={isLoading} disabled={showSuccess}>
          Create Account
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
              Or sign up with
            </span>
          </div>
        </div>

        {/* Social signup */}
        <motion.button
          type="button"
          onClick={() => handleSocialSignup("Google")}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 rounded-lg transition-colors"
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
