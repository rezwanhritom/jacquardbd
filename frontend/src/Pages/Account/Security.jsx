import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fadeInUp, staggerContainer } from "../../utils/animations";
import {
  FiShield,
  FiLock,
  FiEye,
  FiEyeOff,
  FiCheck,
  FiX,
  FiAlertTriangle,
  FiSmartphone,
  FiActivity,
  FiMonitor,
  FiLogOut,
} from "react-icons/fi";
import toast from "react-hot-toast";

// Mock login activity data
const loginActivity = [
  {
    id: 1,
    device: "MacBook Pro",
    browser: "Chrome",
    location: "Dhaka, Bangladesh",
    ip: "103.xxx.xxx.xxx",
    time: "2024-01-20T10:30:00",
    current: true,
  },
  {
    id: 2,
    device: "iPhone 14",
    browser: "Safari",
    location: "Dhaka, Bangladesh",
    ip: "103.xxx.xxx.xxx",
    time: "2024-01-19T15:45:00",
    current: false,
  },
  {
    id: 3,
    device: "Windows PC",
    browser: "Firefox",
    location: "Chittagong, Bangladesh",
    ip: "103.xxx.xxx.xxx",
    time: "2024-01-18T09:20:00",
    current: false,
  },
];

const Security = () => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    const password = passwordData.newPassword;
    let score = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    Object.values(checks).forEach((passed) => {
      if (passed) score++;
    });

    let label = "Very Weak";
    let color = "var(--color-tertiary)";

    if (score === 5) {
      label = "Very Strong";
      color = "#22c55e";
    } else if (score === 4) {
      label = "Strong";
      color = "#84cc16";
    } else if (score === 3) {
      label = "Medium";
      color = "#eab308";
    } else if (score === 2) {
      label = "Weak";
      color = "#f97316";
    }

    return { score, label, color, checks };
  }, [passwordData.newPassword]);

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleSavePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }
    if (passwordStrength.score < 3) {
      toast.error("Please use a stronger password");
      return;
    }

    setIsChangingPassword(true);
    // Simulate API call
    setTimeout(() => {
      setIsChangingPassword(false);
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast.success("Password updated successfully!");
    }, 1500);
  };

  const handleToggle2FA = () => {
    setTwoFactorEnabled(!twoFactorEnabled);
    toast.success(
      twoFactorEnabled
        ? "Two-factor authentication disabled"
        : "Two-factor authentication enabled!"
    );
  };

  const handleLogoutDevice = (deviceId) => {
    toast.success("Device logged out successfully");
  };

  const handleLogoutAllDevices = () => {
    toast.success("All other devices logged out");
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeInUp}
        className="flex items-center gap-3"
      >
        <div
          className="p-3 rounded-xl"
          style={{ backgroundColor: "var(--bg-secondary)" }}
        >
          <FiShield size={24} style={{ color: "var(--color-primary)" }} />
        </div>
        <div>
          <h2
            className="text-2xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            Security Settings
          </h2>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Manage your password and security preferences
          </p>
        </div>
      </motion.div>

      <motion.div
        initial="initial"
        animate="animate"
        variants={staggerContainer}
        className="space-y-6"
      >
        {/* Change Password Section */}
        <motion.div
          variants={fadeInUp}
          className="p-6 rounded-xl"
          style={{ backgroundColor: "var(--bg-secondary)" }}
        >
          <div className="flex items-center gap-3 mb-6">
            <FiLock size={20} style={{ color: "var(--color-primary)" }} />
            <h3
              className="text-lg font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              Change Password
            </h3>
          </div>

          <div className="space-y-4 max-w-md">
            {/* Current Password */}
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--text-secondary)" }}
              >
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter current password"
                  className="w-full px-4 py-3 pr-12 border-2 rounded-lg outline-none transition-colors"
                  style={{
                    borderColor: "var(--border-primary)",
                    backgroundColor: "var(--bg-primary)",
                    color: "var(--text-primary)",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "var(--color-primary)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "var(--border-primary)";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  {showCurrentPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--text-secondary)" }}
              >
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter new password"
                  className="w-full px-4 py-3 pr-12 border-2 rounded-lg outline-none transition-colors"
                  style={{
                    borderColor: "var(--border-primary)",
                    backgroundColor: "var(--bg-primary)",
                    color: "var(--text-primary)",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "var(--color-primary)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "var(--border-primary)";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  {showNewPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {passwordData.newPassword && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-3 space-y-3"
                >
                  {/* Strength Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span style={{ color: "var(--text-secondary)" }}>
                        Password strength
                      </span>
                      <span style={{ color: passwordStrength.color, fontWeight: 600 }}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div
                      className="h-2 rounded-full overflow-hidden"
                      style={{ backgroundColor: "var(--bg-tertiary)" }}
                    >
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                        transition={{ duration: 0.3 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: passwordStrength.color }}
                      />
                    </div>
                  </div>

                  {/* Requirements Checklist */}
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { key: "length", label: "8+ characters" },
                      { key: "lowercase", label: "Lowercase letter" },
                      { key: "uppercase", label: "Uppercase letter" },
                      { key: "number", label: "Number" },
                      { key: "special", label: "Special character" },
                    ].map((req) => (
                      <div
                        key={req.key}
                        className="flex items-center gap-2 text-xs"
                        style={{
                          color: passwordStrength.checks[req.key]
                            ? "#22c55e"
                            : "var(--text-tertiary)",
                        }}
                      >
                        {passwordStrength.checks[req.key] ? (
                          <FiCheck size={14} />
                        ) : (
                          <FiX size={14} />
                        )}
                        {req.label}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--text-secondary)" }}
              >
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Confirm new password"
                  className="w-full px-4 py-3 pr-12 border-2 rounded-lg outline-none transition-colors"
                  style={{
                    borderColor:
                      passwordData.confirmPassword &&
                      passwordData.confirmPassword !== passwordData.newPassword
                        ? "var(--color-tertiary)"
                        : "var(--border-primary)",
                    backgroundColor: "var(--bg-primary)",
                    color: "var(--text-primary)",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  {showConfirmPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
              {passwordData.confirmPassword &&
                passwordData.confirmPassword !== passwordData.newPassword && (
                  <p className="text-xs mt-1" style={{ color: "var(--color-tertiary)" }}>
                    Passwords do not match
                  </p>
                )}
            </div>

            {/* Save Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSavePassword}
              disabled={isChangingPassword || !passwordData.currentPassword || !passwordData.newPassword}
              className="w-full py-3 rounded-lg font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: "var(--color-primary)" }}
            >
              {isChangingPassword ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  >
                    <FiActivity size={18} />
                  </motion.div>
                  Updating...
                </span>
              ) : (
                "Update Password"
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* Two-Factor Authentication */}
        <motion.div
          variants={fadeInUp}
          className="p-6 rounded-xl"
          style={{ backgroundColor: "var(--bg-secondary)" }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FiSmartphone size={20} style={{ color: "var(--color-primary)" }} />
              <div>
                <h3
                  className="text-lg font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  Two-Factor Authentication
                </h3>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  Add an extra layer of security to your account
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleToggle2FA}
              className={`relative w-14 h-8 rounded-full transition-colors ${
                twoFactorEnabled ? "" : ""
              }`}
              style={{
                backgroundColor: twoFactorEnabled ? "var(--color-primary)" : "var(--bg-tertiary)",
              }}
            >
              <motion.span
                animate={{ x: twoFactorEnabled ? 24 : 4 }}
                className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-md"
              />
            </motion.button>
          </div>

          <AnimatePresence>
            {twoFactorEnabled && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t"
                style={{ borderColor: "var(--border-primary)" }}
              >
                <div
                  className="flex items-start gap-3 p-4 rounded-lg"
                  style={{ backgroundColor: "var(--bg-primary)" }}
                >
                  <FiCheck
                    size={20}
                    className="mt-0.5"
                    style={{ color: "#22c55e" }}
                  />
                  <div>
                    <p
                      className="font-medium text-sm"
                      style={{ color: "var(--text-primary)" }}
                    >
                      2FA is enabled
                    </p>
                    <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                      You'll be asked for a verification code when signing in from
                      a new device.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Active Sessions */}
        <motion.div
          variants={fadeInUp}
          className="p-6 rounded-xl"
          style={{ backgroundColor: "var(--bg-secondary)" }}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <FiMonitor size={20} style={{ color: "var(--color-primary)" }} />
              <div>
                <h3
                  className="text-lg font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  Active Sessions
                </h3>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  Manage devices where you're logged in
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogoutAllDevices}
              className="text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              style={{
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                color: "var(--color-tertiary)",
              }}
            >
              Logout All
            </motion.button>
          </div>

          <div className="space-y-3">
            {loginActivity.map((session, index) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 rounded-lg border"
                style={{
                  borderColor: session.current
                    ? "var(--color-primary)"
                    : "var(--border-primary)",
                  backgroundColor: "var(--bg-primary)",
                }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: "var(--bg-secondary)" }}
                  >
                    <FiMonitor size={20} style={{ color: "var(--text-secondary)" }} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p
                        className="font-medium text-sm"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {session.device}
                      </p>
                      {session.current && (
                        <span
                          className="px-2 py-0.5 text-xs font-medium rounded"
                          style={{
                            backgroundColor: "var(--color-primary)",
                            color: "white",
                          }}
                        >
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                      {session.browser} • {session.location}
                    </p>
                    <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                      {new Date(session.time).toLocaleString()}
                    </p>
                  </div>
                </div>
                {!session.current && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleLogoutDevice(session.id)}
                    className="p-2 rounded-lg transition-colors"
                    style={{ color: "var(--color-tertiary)" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    <FiLogOut size={18} />
                  </motion.button>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Security Tips */}
        <motion.div
          variants={fadeInUp}
          className="p-6 rounded-xl"
          style={{ backgroundColor: "rgba(234, 179, 8, 0.1)" }}
        >
          <div className="flex items-start gap-3">
            <FiAlertTriangle
              size={20}
              className="mt-0.5 flex-shrink-0"
              style={{ color: "#eab308" }}
            />
            <div>
              <h4
                className="font-semibold text-sm mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                Security Tips
              </h4>
              <ul
                className="text-sm space-y-1"
                style={{ color: "var(--text-secondary)" }}
              >
                <li>• Use a unique password that you don't use elsewhere</li>
                <li>• Enable two-factor authentication for extra security</li>
                <li>• Review your active sessions regularly</li>
                <li>• Never share your password with anyone</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Security;
