import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "../../utils/animations";
import { FiUser, FiMail, FiPhone, FiMapPin, FiCamera, FiSave } from "react-icons/fi";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { getProfile, updateProfile } from "../../services/user.service";
import Loading from "../../components/Loading";

const defaultAvatar = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&q=80";

const Profile = () => {
  const { user: authUser, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
  });
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !authUser?._id) {
      setLoading(false);
      setError("Please log in to view your profile.");
      return;
    }
    setLoading(true);
    setError(null);
    getProfile(authUser._id)
      .then(({ success, user, message }) => {
        if (success && user) {
          setProfile(user);
          const parts = (user.name || "").trim().split(/\s+/);
          const firstName = parts[0] || "";
          const lastName = parts.slice(1).join(" ") || "";
          setFormData((prev) => ({
            ...prev,
            firstName,
            lastName,
            email: user.email || "",
            phone: prev.phone,
            address: prev.address,
            city: prev.city,
            state: prev.state,
            zipCode: prev.zipCode,
            country: prev.country,
          }));
        } else {
          setError(message || "Failed to load profile");
        }
      })
      .catch(() => setError("Failed to load profile"))
      .finally(() => setLoading(false));
  }, [isAuthenticated, authUser?._id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setSaved(false);
  };

  const handleSave = () => {
    if (!authUser?._id || !profile) return;
    const name = [formData.firstName, formData.lastName].filter(Boolean).join(" ").trim();
    if (!name) {
      toast.error("Name is required");
      return;
    }
    if (!formData.email?.trim()) {
      toast.error("Email is required");
      return;
    }
    setSaving(true);
    updateProfile(authUser._id, { name, email: formData.email.trim() })
      .then(({ success, user, message }) => {
        if (success && user) {
          setProfile(user);
          const parts = (user.name || "").trim().split(/\s+/);
          setFormData((prev) => ({
            ...prev,
            firstName: parts[0] || "",
            lastName: parts.slice(1).join(" ") || "",
            email: user.email || "",
          }));
          setSaved(true);
          toast.success("Profile updated successfully!");
          setTimeout(() => setSaved(false), 3000);
        } else {
          toast.error(message || "Failed to update profile");
        }
      })
      .catch(() => toast.error("Failed to update profile"))
      .finally(() => setSaving(false));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loading />
      </div>
    );
  }

  if (error && !profile) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-lg text-center"
        style={{ backgroundColor: "var(--bg-secondary)" }}
      >
        <p className="text-lg" style={{ color: "var(--text-secondary)" }}>
          {error}
        </p>
      </motion.div>
    );
  }

  const displayName = [formData.firstName, formData.lastName].filter(Boolean).join(" ") || profile?.name || "User";
  const avatarUrl = profile?.avatar?.trim() || defaultAvatar;
  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long" })
    : "";

  return (
    <div className="space-y-6">
      {/* Profile Picture Section */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeInUp}
        className="p-6 rounded-lg space-y-4"
        style={{ backgroundColor: "var(--bg-secondary)" }}
      >
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4" style={{ borderColor: "var(--border-primary)" }}>
              <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="absolute bottom-0 right-0 p-2 rounded-full border-2"
              style={{
                borderColor: "var(--border-primary)",
                backgroundColor: "var(--bg-primary)",
                color: "var(--text-primary)",
              }}
            >
              <FiCamera size={18} />
            </motion.button>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>
              {displayName}
            </h3>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              {formData.email || profile?.email}
            </p>
            {memberSince && (
              <p className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>
                Member since {memberSince}
              </p>
            )}
          </div>
        </div>
      </motion.div>

      <motion.div
        initial="initial"
        animate="animate"
        variants={staggerContainer}
        className="space-y-6"
      >
        {/* Personal Information */}
        <motion.div
          variants={fadeInUp}
          className="p-6 rounded-lg space-y-6"
          style={{ backgroundColor: "var(--bg-secondary)" }}
        >
          <div className="flex items-center space-x-3 mb-6">
            <FiUser size={24} style={{ color: "var(--color-primary)" }} />
            <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
              Personal Information
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                First Name *
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 rounded-lg outline-none transition-colors"
                style={{
                  borderColor: "var(--border-primary)",
                  backgroundColor: "var(--bg-primary)",
                  color: "var(--text-primary)",
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                Last Name *
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 rounded-lg outline-none transition-colors"
                style={{
                  borderColor: "var(--border-primary)",
                  backgroundColor: "var(--bg-primary)",
                  color: "var(--text-primary)",
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center space-x-2" style={{ color: "var(--text-secondary)" }}>
                <FiMail size={16} />
                <span>Email *</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 rounded-lg outline-none transition-colors"
                style={{
                  borderColor: "var(--border-primary)",
                  backgroundColor: "var(--bg-primary)",
                  color: "var(--text-primary)",
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center space-x-2" style={{ color: "var(--text-secondary)" }}>
                <FiPhone size={16} />
                <span>Phone *</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 rounded-lg outline-none transition-colors"
                style={{
                  borderColor: "var(--border-primary)",
                  backgroundColor: "var(--bg-primary)",
                  color: "var(--text-primary)",
                }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: "var(--border-primary)" }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: saved ? 1 : 0, scale: saved ? 1 : 0.8 }}
              className="flex items-center gap-2 text-sm"
              style={{ color: "var(--color-primary)" }}
            >
              <FiSave size={18} />
              <span>Changes saved!</span>
            </motion.div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 text-white font-semibold rounded-lg disabled:opacity-60"
              style={{ backgroundColor: "var(--color-primary)" }}
            >
              <FiSave size={18} />
              {saving ? "Saving…" : "Save Changes"}
            </motion.button>
          </div>
        </motion.div>

        {/* Address Section */}
        <motion.div
          variants={fadeInUp}
          className="p-6 rounded-lg space-y-6"
          style={{ backgroundColor: "var(--bg-secondary)" }}
        >
          <div className="flex items-center space-x-3 mb-6">
            <FiMapPin size={24} style={{ color: "var(--color-primary)" }} />
            <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
              Default Address
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                Street Address *
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 rounded-lg outline-none transition-colors"
                style={{
                  borderColor: "var(--border-primary)",
                  backgroundColor: "var(--bg-primary)",
                  color: "var(--text-primary)",
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                City *
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 rounded-lg outline-none transition-colors"
                style={{
                  borderColor: "var(--border-primary)",
                  backgroundColor: "var(--bg-primary)",
                  color: "var(--text-primary)",
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                State/Division *
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 rounded-lg outline-none transition-colors"
                style={{
                  borderColor: "var(--border-primary)",
                  backgroundColor: "var(--bg-primary)",
                  color: "var(--text-primary)",
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                ZIP Code *
              </label>
              <input
                type="text"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 rounded-lg outline-none transition-colors"
                style={{
                  borderColor: "var(--border-primary)",
                  backgroundColor: "var(--bg-primary)",
                  color: "var(--text-primary)",
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                Country *
              </label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 rounded-lg outline-none transition-colors"
                style={{
                  borderColor: "var(--border-primary)",
                  backgroundColor: "var(--bg-primary)",
                  color: "var(--text-primary)",
                }}
              />
            </div>
          </div>

          <div className="flex items-center justify-end pt-4 border-t" style={{ borderColor: "var(--border-primary)" }}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 text-white font-semibold rounded-lg disabled:opacity-60"
              style={{ backgroundColor: "var(--color-primary)" }}
            >
              <FiSave size={18} />
              Update Address
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Profile;
