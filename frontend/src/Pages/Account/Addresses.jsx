import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fadeInUp, staggerContainer } from "../../utils/animations";
import { FiMapPin, FiEdit2, FiTrash2, FiPlus, FiCheck, FiX } from "react-icons/fi";
import { EmptyState } from "../../components";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { getProfile, updateProfile } from "../../services/user.service";
import Loading from "../../components/Loading";

const emptyForm = () => ({
  label: "Home",
  name: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  zip: "",
  country: "Bangladesh",
  isDefault: false,
});

const Addresses = () => {
  const { user: authUser, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [addresses, setAddresses] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState(emptyForm());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !authUser?._id) {
      setLoading(false);
      return;
    }
    getProfile(authUser._id)
      .then(({ success, user }) => {
        if (success && user && Array.isArray(user.addresses)) {
          setAddresses(user.addresses);
        }
      })
      .finally(() => setLoading(false));
  }, [isAuthenticated, authUser?._id]);

  const saveToServer = (nextAddresses) => {
    const defaultIndex = nextAddresses.findIndex((a) => a.isDefault);
    const final = nextAddresses.map((a, i) => ({
      ...a,
      isDefault: defaultIndex === -1 ? i === 0 : i === defaultIndex,
    }));
    setSaving(true);
    updateProfile(authUser._id, { addresses: final })
      .then(({ success, user }) => {
        if (success && user && Array.isArray(user.addresses)) {
          setAddresses(user.addresses);
          toast.success("Addresses saved");
        } else {
          toast.error("Failed to save addresses");
        }
      })
      .catch(() => toast.error("Failed to save addresses"))
      .finally(() => setSaving(false));
  };

  const handleEdit = (address) => {
    setFormData({
      label: address.label || "Home",
      name: address.name || "",
      phone: address.phone || "",
      address: address.address || "",
      city: address.city || "",
      state: address.state || "",
      zip: address.zip || "",
      country: address.country || "Bangladesh",
      isDefault: !!address.isDefault,
    });
    setEditingId(address._id);
    setShowAddForm(true);
  };

  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this address?")) return;
    const next = addresses.filter((addr) => String(addr._id) !== String(id));
    setAddresses(next);
    saveToServer(next);
    setShowAddForm(false);
    setEditingId(null);
  };

  const handleSetDefault = (id) => {
    const next = addresses.map((addr) => ({
      ...addr,
      isDefault: String(addr._id) === String(id),
    }));
    setAddresses(next);
    saveToServer(next);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      _id: editingId || `new-${Date.now()}`,
      label: formData.label.trim() || "Home",
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      address: formData.address.trim(),
      city: formData.city.trim(),
      state: formData.state.trim(),
      zip: formData.zip.trim(),
      country: formData.country.trim() || "Bangladesh",
      isDefault: formData.isDefault,
    };
    let next;
    if (editingId) {
      next = addresses.map((addr) => (String(addr._id) === String(editingId) ? { ...payload, _id: addr._id } : addr));
    } else {
      next = [...addresses, payload];
      if (next.length === 1) next[0].isDefault = true;
    }
    setAddresses(next);
    saveToServer(next);
    setShowAddForm(false);
    setEditingId(null);
    setFormData(emptyForm());
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingId(null);
    setFormData(emptyForm());
  };

  const inputStyle = {
    borderColor: "var(--border-primary)",
    backgroundColor: "var(--bg-primary)",
    color: "var(--text-primary)",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loading />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeInUp}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <FiMapPin size={24} style={{ color: "var(--color-primary)" }} />
          <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            Address Book
          </h2>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setShowAddForm(true);
            setEditingId(null);
            setFormData(emptyForm());
          }}
          className="flex items-center gap-2 px-4 py-2 text-white font-semibold rounded-lg"
          style={{ backgroundColor: "var(--color-primary)" }}
        >
          <FiPlus size={18} />
          Add New Address
        </motion.button>
      </motion.div>

      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="p-6 rounded-lg space-y-4"
            style={{ backgroundColor: "var(--bg-secondary)" }}
          >
            <h3 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
              {editingId ? "Edit Address" : "Add New Address"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                    Label (e.g. Home, Office)
                  </label>
                  <select
                    value={formData.label}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                    className="w-full px-4 py-3 border-2 rounded-lg outline-none"
                    style={inputStyle}
                  >
                    <option value="Home">Home</option>
                    <option value="Office">Office</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 pt-8">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={formData.isDefault}
                    onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                    className="w-5 h-5"
                    style={{ accentColor: "var(--color-primary)" }}
                  />
                  <label htmlFor="isDefault" className="text-sm" style={{ color: "var(--text-secondary)" }}>
                    Set as default address
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>Name</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 border-2 rounded-lg outline-none" style={inputStyle} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>Phone</label>
                  <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-3 border-2 rounded-lg outline-none" style={inputStyle} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>Street Address</label>
                  <input type="text" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="w-full px-4 py-3 border-2 rounded-lg outline-none" style={inputStyle} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>City</label>
                  <input type="text" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className="w-full px-4 py-3 border-2 rounded-lg outline-none" style={inputStyle} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>State/Division</label>
                  <input type="text" value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} className="w-full px-4 py-3 border-2 rounded-lg outline-none" style={inputStyle} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>ZIP Code</label>
                  <input type="text" value={formData.zip} onChange={(e) => setFormData({ ...formData, zip: e.target.value })} className="w-full px-4 py-3 border-2 rounded-lg outline-none" style={inputStyle} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>Country</label>
                  <input type="text" value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} className="w-full px-4 py-3 border-2 rounded-lg outline-none" style={inputStyle} />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <motion.button type="submit" disabled={saving} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex items-center gap-2 px-6 py-3 text-white font-semibold rounded-lg disabled:opacity-60" style={{ backgroundColor: "var(--color-primary)" }}>
                  <FiCheck size={18} />
                  {editingId ? "Update Address" : "Add Address"}
                </motion.button>
                <motion.button type="button" onClick={handleCancel} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex items-center gap-2 px-6 py-3 border-2 rounded-lg font-semibold" style={{ borderColor: "var(--border-primary)", color: "var(--text-primary)" }}>
                  <FiX size={18} /> Cancel
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div initial="initial" animate="animate" variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {addresses.length === 0 && !showAddForm && (
          <div className="md:col-span-2">
            <EmptyState
              icon={FiMapPin}
              title="No addresses"
              description="Add an address to use at checkout"
              actionLabel="Add New Address"
              onAction={() => { setFormData(emptyForm()); setEditingId(null); setShowAddForm(true); }}
            />
          </div>
        )}
        {addresses.map((address) => (
          <motion.div
            key={address._id}
            variants={fadeInUp}
            className="p-6 rounded-lg border-2 relative"
            style={{ borderColor: address.isDefault ? "var(--color-primary)" : "var(--border-primary)", backgroundColor: "var(--bg-secondary)" }}
            whileHover={{ scale: 1.02, y: -4 }}
            transition={{ duration: 0.2 }}
          >
            {address.isDefault && (
              <div className="absolute top-4 right-4 px-2 py-1 text-xs font-semibold uppercase rounded" style={{ backgroundColor: "var(--color-primary)", color: "white" }}>
                Default
              </div>
            )}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg" style={{ color: "var(--text-primary)" }}>
                  {address.label || "Address"}
                </h3>
                <div className="flex gap-2">
                  <motion.button type="button" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleEdit(address)} className="p-2 rounded-lg transition-colors" style={{ color: "var(--color-primary)" }}>
                    <FiEdit2 size={18} />
                  </motion.button>
                  <motion.button type="button" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleDelete(address._id)} className="p-2 rounded-lg transition-colors" style={{ color: "var(--text-tertiary)" }}>
                    <FiTrash2 size={18} />
                  </motion.button>
                </div>
              </div>
              <div className="space-y-1 text-sm" style={{ color: "var(--text-secondary)" }}>
                {address.name && <p>{address.name}</p>}
                <p>{address.address || "—"}</p>
                <p>{[address.city, address.state, address.zip].filter(Boolean).join(", ") || "—"}</p>
                {address.country && <p>{address.country}</p>}
                {address.phone && <p className="pt-2">{address.phone}</p>}
              </div>
              {!address.isDefault && (
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSetDefault(address._id)}
                  className="w-full mt-4 px-4 py-2 border-2 rounded-lg font-semibold text-sm transition-colors"
                  style={{ borderColor: "var(--border-primary)", color: "var(--text-primary)" }}
                >
                  Set as Default
                </motion.button>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default Addresses;
