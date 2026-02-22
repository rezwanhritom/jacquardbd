import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "../../utils/animations";
import { FiUser, FiMail, FiPhone, FiMapPin, FiSave, FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { getProfile, updateProfile } from "../../services/user.service";
import Loading from "../../components/Loading";

const emptyAddress = () => ({
  _id: `new-${Date.now()}`,
  label: "",
  name: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  zip: "",
  country: "",
  isDefault: false,
});

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
  });
  const [addresses, setAddresses] = useState([]);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingAddresses, setSavingAddresses] = useState(false);
  const [editingAddressIndex, setEditingAddressIndex] = useState(null);
  const [addingAddress, setAddingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState(emptyAddress());

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
          setFormData({
            firstName: parts[0] || "",
            lastName: parts.slice(1).join(" ") || "",
            email: user.email || "",
            phone: user.phone || "",
          });
          setAddresses(Array.isArray(user.addresses) ? user.addresses.map((a) => ({ ...a, _id: a._id || `addr-${Date.now()}-${Math.random().toString(36).slice(2)}` })) : []);
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
    updateProfile(authUser._id, { name, email: formData.email.trim(), phone: formData.phone.trim(), addresses })
      .then(({ success, user, message }) => {
        if (success && user) {
          setProfile(user);
          const parts = (user.name || "").trim().split(/\s+/);
          setFormData((prev) => ({
            ...prev,
            firstName: parts[0] || "",
            lastName: parts.slice(1).join(" ") || "",
            email: user.email || "",
            phone: user.phone || "",
          }));
          if (Array.isArray(user.addresses)) setAddresses(user.addresses);
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

  const setDefaultAddress = (index) => {
    setAddresses((prev) =>
      prev.map((a, i) => ({ ...a, isDefault: i === index }))
    );
  };

  const deleteAddress = (index) => {
    setAddresses((prev) => prev.filter((_, i) => i !== index));
    setEditingAddressIndex(null);
    setAddingAddress(false);
  };

  const openEditAddress = (index) => {
    setEditingAddressIndex(index);
    setAddingAddress(false);
    setAddressForm({ ...addresses[index] });
  };

  const openAddAddress = () => {
    setAddingAddress(true);
    setEditingAddressIndex(null);
    setAddressForm(emptyAddress());
  };

  const cancelAddressForm = () => {
    setEditingAddressIndex(null);
    setAddingAddress(false);
  };

  const handleAddressFormChange = (e) => {
    const { name, value } = e.target;
    setAddressForm((prev) => ({ ...prev, [name]: value }));
  };

  const saveAddressForm = () => {
    const a = addressForm;
    if (!a.address?.trim() && !a.city?.trim()) {
      toast.error("Enter at least address or city");
      return;
    }
    if (editingAddressIndex !== null) {
      setAddresses((prev) =>
        prev.map((ad, i) => (i === editingAddressIndex ? { ...a, _id: ad._id } : ad))
      );
    } else {
      setAddresses((prev) => {
        const next = [...prev, { ...a }];
        if (next.length === 1) next[0].isDefault = true;
        return next;
      });
    }
    cancelAddressForm();
  };

  const saveAddresses = () => {
    if (!authUser?._id) return;
    const defaultIndex = addresses.findIndex((a) => a.isDefault);
    const final = addresses.map((a, i) => ({
      ...a,
      isDefault: defaultIndex === -1 ? i === 0 : i === defaultIndex,
    }));
    setSavingAddresses(true);
    updateProfile(authUser._id, { addresses: final })
      .then(({ success, user, message }) => {
        if (success && user && Array.isArray(user.addresses)) {
          setAddresses(user.addresses);
          setProfile((p) => (p ? { ...p, addresses: user.addresses } : p));
          toast.success("Addresses saved!");
        } else {
          toast.error(message || "Failed to save addresses");
        }
      })
      .catch(() => toast.error("Failed to save addresses"))
      .finally(() => setSavingAddresses(false));
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
  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long" })
    : "";

  const addressInputStyle = {
    borderColor: "var(--border-primary)",
    backgroundColor: "var(--bg-primary)",
    color: "var(--text-primary)",
  };

  return (
    <div className="space-y-6">
      {/* Profile identity */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeInUp}
        className="p-6 rounded-lg space-y-4"
        style={{ backgroundColor: "var(--bg-secondary)" }}
      >
        <div className="flex items-center gap-6">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center border-4 flex-shrink-0"
            style={{ borderColor: "var(--border-primary)", backgroundColor: "var(--bg-primary)", color: "var(--color-primary)" }}
          >
            <FiUser size={40} />
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
                style={addressInputStyle}
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
                style={addressInputStyle}
              />
            </div>
            <div className="md:col-span-2">
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
                style={addressInputStyle}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2 flex items-center space-x-2" style={{ color: "var(--text-secondary)" }}>
                <FiPhone size={16} />
                <span>Phone</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="e.g. +880 1712 345678"
                className="w-full px-4 py-3 border-2 rounded-lg outline-none transition-colors"
                style={addressInputStyle}
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
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center space-x-3">
                <FiMapPin size={24} style={{ color: "var(--color-primary)" }} />
                <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                  Address
                </h2>
              </div>
              <p className="text-sm mt-1" style={{ color: "var(--text-tertiary)" }}>
                Change the default address for checkout using &quot;Set default&quot; below.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={openAddAddress}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium border-2"
                style={{ borderColor: "var(--color-primary)", color: "var(--color-primary)" }}
              >
                <FiPlus size={18} />
                Add address
              </motion.button>
              {addresses.length > 0 && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={saveAddresses}
                  disabled={savingAddresses}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-white disabled:opacity-60"
                  style={{ backgroundColor: "var(--color-primary)" }}
                >
                  <FiSave size={18} />
                  {savingAddresses ? "Saving…" : "Save addresses"}
                </motion.button>
              )}
            </div>
          </div>

          {/* Add / Edit address form */}
          {(addingAddress || editingAddressIndex !== null) && (
            <div className="p-4 rounded-lg border-2 space-y-4" style={{ borderColor: "var(--border-primary)", backgroundColor: "var(--bg-primary)" }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Label (e.g. Home, Office)</label>
                  <input type="text" name="label" value={addressForm.label} onChange={handleAddressFormChange} className="w-full px-4 py-2 border-2 rounded-lg outline-none" style={addressInputStyle} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Name</label>
                  <input type="text" name="name" value={addressForm.name} onChange={handleAddressFormChange} className="w-full px-4 py-2 border-2 rounded-lg outline-none" style={addressInputStyle} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Street address</label>
                  <input type="text" name="address" value={addressForm.address} onChange={handleAddressFormChange} className="w-full px-4 py-2 border-2 rounded-lg outline-none" style={addressInputStyle} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>City</label>
                  <input type="text" name="city" value={addressForm.city} onChange={handleAddressFormChange} className="w-full px-4 py-2 border-2 rounded-lg outline-none" style={addressInputStyle} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>State / Division</label>
                  <input type="text" name="state" value={addressForm.state} onChange={handleAddressFormChange} className="w-full px-4 py-2 border-2 rounded-lg outline-none" style={addressInputStyle} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>ZIP</label>
                  <input type="text" name="zip" value={addressForm.zip} onChange={handleAddressFormChange} className="w-full px-4 py-2 border-2 rounded-lg outline-none" style={addressInputStyle} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Country</label>
                  <input type="text" name="country" value={addressForm.country} onChange={handleAddressFormChange} className="w-full px-4 py-2 border-2 rounded-lg outline-none" style={addressInputStyle} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Phone</label>
                  <input type="text" name="phone" value={addressForm.phone} onChange={handleAddressFormChange} className="w-full px-4 py-2 border-2 rounded-lg outline-none" style={addressInputStyle} />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={!!addressForm.isDefault}
                    onChange={(e) => setAddressForm((p) => ({ ...p, isDefault: e.target.checked }))}
                  />
                  <label htmlFor="isDefault" className="text-sm" style={{ color: "var(--text-secondary)" }}>Default address</label>
                </div>
              </div>
              <div className="flex gap-2">
                <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={saveAddressForm} className="px-4 py-2 rounded-lg font-semibold text-white" style={{ backgroundColor: "var(--color-primary)" }}>
                  {editingAddressIndex !== null ? "Update" : "Add"}
                </motion.button>
                <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={cancelAddressForm} className="px-4 py-2 rounded-lg border-2" style={{ borderColor: "var(--border-primary)", color: "var(--text-secondary)" }}>
                  Cancel
                </motion.button>
              </div>
            </div>
          )}

          {/* Address list */}
          <div className="space-y-4">
            {addresses.length === 0 && !addingAddress && (
              <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>No addresses saved. Add one above.</p>
            )}
            {addresses.map((addr, index) => (
              <motion.div
                key={addr._id || index}
                variants={fadeInUp}
                className="p-4 rounded-lg border-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                style={{ borderColor: "var(--border-primary)", backgroundColor: "var(--bg-primary)" }}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {addr.label && <span className="text-sm font-semibold" style={{ color: "var(--color-primary)" }}>{addr.label}</span>}
                    {addr.isDefault && <span className="px-2 py-0.5 text-xs font-semibold rounded" style={{ backgroundColor: "var(--color-primary)", color: "white" }}>Default</span>}
                  </div>
                  {addr.name && <p className="text-sm font-medium mt-1" style={{ color: "var(--text-primary)" }}>{addr.name}</p>}
                  <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
                    {[addr.address, addr.city, addr.state, addr.zip, addr.country].filter(Boolean).join(", ") || "—"}
                  </p>
                  {addr.phone && <p className="text-sm mt-1 flex items-center gap-1" style={{ color: "var(--text-tertiary)" }}><FiPhone size={14} /> {addr.phone}</p>}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {!addr.isDefault && (
                    <button type="button" onClick={() => setDefaultAddress(index)} className="text-xs font-medium px-3 py-1.5 rounded border-2" style={{ borderColor: "var(--border-primary)", color: "var(--text-secondary)" }}>
                      Set default
                    </button>
                  )}
                  <motion.button type="button" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => openEditAddress(index)} className="p-2 rounded-lg" style={{ color: "var(--color-primary)" }} title="Edit">
                    <FiEdit2 size={18} />
                  </motion.button>
                  <motion.button type="button" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => deleteAddress(index)} className="p-2 rounded-lg" style={{ color: "var(--text-tertiary)" }} title="Delete">
                    <FiTrash2 size={18} />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Profile;
