import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fadeInUp, staggerContainer } from "../../utils/animations";
import { FiUser, FiMail, FiEdit, FiTrash2, FiSearch, FiShoppingBag, FiPlus, FiX, FiMapPin, FiEdit2 } from "react-icons/fi";
import { EmptyState } from "../../components";
import toast from "react-hot-toast";
import { getAdminCustomers, getOneUserAdmin, deleteUserAdmin, createUserAdmin, updateUserAdmin } from "../../services/user.service";

const ROLE_OPTIONS = [
  { value: "user", label: "User" },
  { value: "admin", label: "Admin" },
  { value: "premium", label: "Premium" },
];

const Users = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deletingId, setDeletingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "user",
    addresses: [],
    rewardPoints: 0,
  });
  const [loadingUser, setLoadingUser] = useState(false);
  const [editingAddressIndex, setEditingAddressIndex] = useState(null);
  const [addressForm, setAddressForm] = useState(null);

  const fetchCustomers = async () => {
    setLoading(true);
    const result = await getAdminCustomers();
    if (result.success && result.customers) {
      setCustomers(result.customers);
    } else {
      toast.error(result.message || "Failed to load customers");
      setCustomers([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter((customer) => {
    const name = (customer.name || "").toLowerCase();
    const email = (customer.email || "").toLowerCase();
    const q = searchQuery.toLowerCase();
    const matchesSearch = name.includes(q) || email.includes(q);
    const matchesStatus = statusFilter === "all" || customer.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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

  const openCreateForm = () => {
    setEditingUser(null);
    setFormData({ name: "", email: "", phone: "", password: "", role: "user", addresses: [], rewardPoints: 0 });
    setEditingAddressIndex(null);
    setAddressForm(null);
    setShowForm(true);
  };

  const openEditForm = async (customer) => {
    setEditingUser(customer);
    setFormData({
      name: customer.name || "",
      email: customer.email || "",
      phone: customer.phone || "",
      password: "",
      role: customer.role || "user",
      addresses: [],
      rewardPoints: 0,
    });
    setEditingAddressIndex(null);
    setAddressForm(null);
    setShowForm(true);
    setLoadingUser(true);
    const result = await getOneUserAdmin(customer._id);
    setLoadingUser(false);
    if (result.success && result.user) {
      setFormData((prev) => ({
        ...prev,
        phone: result.user.phone || "",
        addresses: Array.isArray(result.user.addresses) ? result.user.addresses : [],
        rewardPoints: result.user.rewardPoints ?? 0,
      }));
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingUser(null);
    setFormData({ name: "", email: "", phone: "", password: "", role: "user", addresses: [], rewardPoints: 0 });
    setEditingAddressIndex(null);
    setAddressForm(null);
  };

  const addAddress = () => {
    const newAddr = emptyAddress();
    setFormData((prev) => ({ ...prev, addresses: [...(prev.addresses || []), newAddr] }));
    setEditingAddressIndex(formData.addresses?.length ?? 0);
    setAddressForm(newAddr);
  };
  const updateAddressAtIndex = (index, updates) => {
    setFormData((prev) => {
      const next = [...(prev.addresses || [])];
      next[index] = { ...next[index], ...updates };
      return { ...prev, addresses: next };
    });
  };
  const removeAddress = (index) => {
    setFormData((prev) => ({ ...prev, addresses: (prev.addresses || []).filter((_, i) => i !== index) }));
    setEditingAddressIndex(null);
    setAddressForm(null);
  };
  const setDefaultAddress = (index) => {
    setFormData((prev) => ({
      ...prev,
      addresses: (prev.addresses || []).map((a, i) => ({ ...a, isDefault: i === index })),
    }));
  };
  const startEditAddress = (index) => {
    setEditingAddressIndex(index);
    setAddressForm({ ...(formData.addresses || [])[index] });
  };
  const saveAddressEdit = () => {
    if (addressForm && editingAddressIndex !== null) {
      updateAddressAtIndex(editingAddressIndex, addressForm);
      setEditingAddressIndex(null);
      setAddressForm(null);
    }
  };

  const handleSubmitUser = async (e) => {
    e.preventDefault();
    if (editingUser) {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: (formData.phone || "").trim(),
        role: formData.role,
        rewardPoints: Math.max(0, Math.floor(Number(formData.rewardPoints)) || 0),
      };
      if (formData.password.trim()) payload.password = formData.password;
      if (Array.isArray(formData.addresses)) {
        const defaultIdx = formData.addresses.findIndex((a) => a.isDefault);
        payload.addresses = formData.addresses.map((a, i) => ({
          ...a,
          isDefault: defaultIdx === -1 ? i === 0 : i === defaultIdx,
        }));
      }
      setSubmitting(true);
      const result = await updateUserAdmin(editingUser._id, payload);
      setSubmitting(false);
      if (result.success && result.user) {
        setCustomers((prev) => prev.map((c) => (c._id === editingUser._id ? { ...c, ...result.user, name: result.user.name, email: result.user.email, role: result.user.role } : c)));
        toast.success("User updated");
        handleCancelForm();
      } else {
        toast.error(result.message || "Failed to update user");
      }
    } else {
      if (!formData.password.trim()) {
        toast.error("Password is required");
        return;
      }
      setSubmitting(true);
      const result = await createUserAdmin({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
      });
      setSubmitting(false);
      if (result.success && result.user) {
        const withStats = { ...result.user, orders: 0, totalSpent: 0, status: "Inactive", joined: result.user.createdAt };
        setCustomers((prev) => [withStats, ...prev]);
        toast.success("User created");
        handleCancelForm();
      } else {
        toast.error(result.message || "Failed to create user");
      }
    }
  };

  const handleDelete = async (customer) => {
    if (!window.confirm(`Are you sure you want to delete "${customer?.name}"? This cannot be undone.`)) return;
    setDeletingId(customer._id);
    const result = await deleteUserAdmin(customer._id);
    if (result.success) {
      setCustomers((prev) => prev.filter((c) => c._id !== customer._id));
      toast.success(`"${customer?.name}" deleted successfully`);
    } else {
      toast.error(result.message || "Failed to delete customer");
    }
    setDeletingId(null);
  };

  if (loading) {
    return (
      <div
        className="p-6 rounded-lg flex items-center justify-center min-h-[200px]"
        style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-secondary)" }}
      >
        Loading customers…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <FiUser size={24} style={{ color: "var(--color-primary)" }} />
          <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            Customers Management
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Total: {customers.length} customers
          </span>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={openCreateForm}
            className="flex items-center gap-2 px-4 py-2 text-white font-semibold rounded-lg"
            style={{ backgroundColor: "var(--color-primary)" }}
          >
            <FiPlus size={18} />
            Add new user
          </motion.button>
        </div>
      </div>

      {/* Add/Edit User Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="p-6 rounded-lg space-y-4"
            style={{ backgroundColor: "var(--bg-secondary)" }}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                {editingUser ? "Edit User" : "Add New User"}
              </h3>
              <motion.button
                type="button"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleCancelForm}
                className="p-2 rounded-lg"
                style={{ color: "var(--text-secondary)" }}
              >
                <FiX size={20} />
              </motion.button>
            </div>
            <form onSubmit={handleSubmitUser} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                    Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-4 py-3 border-2 rounded-lg outline-none"
                    style={{
                      borderColor: "var(--border-primary)",
                      backgroundColor: "var(--bg-primary)",
                      color: "var(--text-primary)",
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="w-full px-4 py-3 border-2 rounded-lg outline-none"
                    style={{
                      borderColor: "var(--border-primary)",
                      backgroundColor: "var(--bg-primary)",
                      color: "var(--text-primary)",
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. +880 1712 345678"
                    className="w-full px-4 py-3 border-2 rounded-lg outline-none"
                    style={{
                      borderColor: "var(--border-primary)",
                      backgroundColor: "var(--bg-primary)",
                      color: "var(--text-primary)",
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                    Role
                  </label>
                  {editingUser?.premiumAppliedAt && (
                    <p className="text-sm mb-2 px-3 py-2 rounded-lg" style={{ backgroundColor: "rgba(234, 179, 8, 0.15)", color: "rgb(202, 138, 4)" }}>
                      This user has applied for premium membership. Set role to <strong>Premium</strong> to approve.
                    </p>
                  )}
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-4 py-3 border-2 rounded-lg outline-none"
                    style={{
                      borderColor: "var(--border-primary)",
                      backgroundColor: "var(--bg-primary)",
                      color: "var(--text-primary)",
                    }}
                  >
                    {ROLE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                    Password {editingUser ? "(leave blank to keep current)" : "*"}
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required={!editingUser}
                    minLength={editingUser ? 0 : 8}
                    placeholder={editingUser ? "••••••••" : ""}
                    className="w-full px-4 py-3 border-2 rounded-lg outline-none"
                    style={{
                      borderColor: "var(--border-primary)",
                      backgroundColor: "var(--bg-primary)",
                      color: "var(--text-primary)",
                    }}
                  />
                </div>
                {editingUser && (
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                      Reward points
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formData.rewardPoints}
                      onChange={(e) => setFormData({ ...formData, rewardPoints: e.target.value })}
                      className="w-full px-4 py-3 border-2 rounded-lg outline-none"
                      style={{
                        borderColor: "var(--border-primary)",
                        backgroundColor: "var(--bg-primary)",
                        color: "var(--text-primary)",
                      }}
                    />
                    <p className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>
                      Admin only. Customers earn 1 point per ৳100 spent on orders.
                    </p>
                  </div>
                )}
              </div>

              {editingUser && (
                <div className="border-t pt-4 mt-4" style={{ borderColor: "var(--border-primary)" }}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="flex flex-col gap-0.5">
                      <span className="flex items-center gap-2 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                        <FiMapPin size={18} style={{ color: "var(--color-primary)" }} />
                        Addresses
                      </span>
                      <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>Change default address using &quot;Set default&quot; on any address.</span>
                    </span>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={addAddress}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg border-2"
                      style={{ borderColor: "var(--color-primary)", color: "var(--color-primary)" }}
                    >
                      <FiPlus size={14} /> Add
                    </motion.button>
                  </div>
                  {loadingUser ? (
                    <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>Loading addresses…</p>
                  ) : (
                    <div className="space-y-3 max-h-48 overflow-y-auto">
                      {(formData.addresses || []).map((addr, index) => (
                        <div
                          key={addr._id || index}
                          className="p-3 rounded-lg border-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                          style={{ borderColor: "var(--border-primary)", backgroundColor: "var(--bg-primary)" }}
                        >
                          {editingAddressIndex === index && addressForm ? (
                            <div className="flex-1 grid grid-cols-2 gap-2 text-sm">
                              <input placeholder="Label" value={addressForm.label} onChange={(e) => setAddressForm((p) => ({ ...p, label: e.target.value }))} className="px-2 py-1 border rounded" style={ { borderColor: "var(--border-primary)", backgroundColor: "var(--bg-secondary)", color: "var(--text-primary)" }} />
                              <input placeholder="Name" value={addressForm.name} onChange={(e) => setAddressForm((p) => ({ ...p, name: e.target.value }))} className="px-2 py-1 border rounded" style={ { borderColor: "var(--border-primary)", backgroundColor: "var(--bg-secondary)", color: "var(--text-primary)" }} />
                              <input placeholder="Address" value={addressForm.address} onChange={(e) => setAddressForm((p) => ({ ...p, address: e.target.value }))} className="col-span-2 px-2 py-1 border rounded" style={ { borderColor: "var(--border-primary)", backgroundColor: "var(--bg-secondary)", color: "var(--text-primary)" }} />
                              <input placeholder="City" value={addressForm.city} onChange={(e) => setAddressForm((p) => ({ ...p, city: e.target.value }))} className="px-2 py-1 border rounded" style={ { borderColor: "var(--border-primary)", backgroundColor: "var(--bg-secondary)", color: "var(--text-primary)" }} />
                              <input placeholder="State" value={addressForm.state} onChange={(e) => setAddressForm((p) => ({ ...p, state: e.target.value }))} className="px-2 py-1 border rounded" style={ { borderColor: "var(--border-primary)", backgroundColor: "var(--bg-secondary)", color: "var(--text-primary)" }} />
                              <input placeholder="ZIP" value={addressForm.zip} onChange={(e) => setAddressForm((p) => ({ ...p, zip: e.target.value }))} className="px-2 py-1 border rounded" style={ { borderColor: "var(--border-primary)", backgroundColor: "var(--bg-secondary)", color: "var(--text-primary)" }} />
                              <input placeholder="Country" value={addressForm.country} onChange={(e) => setAddressForm((p) => ({ ...p, country: e.target.value }))} className="px-2 py-1 border rounded" style={ { borderColor: "var(--border-primary)", backgroundColor: "var(--bg-secondary)", color: "var(--text-primary)" }} />
                              <div className="col-span-2 flex items-center gap-2">
                                <label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={!!addressForm.isDefault} onChange={(e) => setAddressForm((p) => ({ ...p, isDefault: e.target.checked }))} /> Default</label>
                                <button type="button" onClick={saveAddressEdit} className="text-xs px-2 py-1 rounded font-medium" style={{ backgroundColor: "var(--color-primary)", color: "white" }}>Save</button>
                                <button type="button" onClick={() => { setEditingAddressIndex(null); setAddressForm(null); }} className="text-xs px-2 py-1 rounded border" style={{ borderColor: "var(--border-primary)", color: "var(--text-secondary)" }}>Cancel</button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  {addr.label && <span className="text-xs font-semibold" style={{ color: "var(--color-primary)" }}>{addr.label}</span>}
                                  {addr.isDefault && <span className="px-1.5 py-0.5 text-xs rounded" style={{ backgroundColor: "var(--color-primary)", color: "white" }}>Default</span>}
                                </div>
                                <p className="text-xs truncate" style={{ color: "var(--text-secondary)" }}>{[addr.address, addr.city, addr.state, addr.zip, addr.country].filter(Boolean).join(", ") || "—"}</p>
                              </div>
                              <div className="flex items-center gap-1">
                                {!addr.isDefault && (formData.addresses || []).length > 1 && (
                                  <button type="button" onClick={() => setDefaultAddress(index)} className="text-xs px-2 py-1 rounded border" style={{ borderColor: "var(--border-primary)", color: "var(--text-secondary)" }}>Set default</button>
                                )}
                                <motion.button type="button" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => startEditAddress(index)} className="p-1.5 rounded" style={{ color: "var(--color-primary)" }} title="Edit address"><FiEdit2 size={14} /></motion.button>
                                <motion.button type="button" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => removeAddress(index)} className="p-1.5 rounded" style={{ color: "var(--text-tertiary)" }} title="Remove"><FiX size={14} /></motion.button>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                      {(formData.addresses || []).length === 0 && !loadingUser && (
                        <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>No addresses. Click Add to add one.</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCancelForm}
                  className="px-4 py-2 rounded-lg font-medium"
                  style={{ borderColor: "var(--border-primary)", borderWidth: 2, color: "var(--text-secondary)" }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  disabled={submitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-2 rounded-lg font-semibold text-white disabled:opacity-60"
                  style={{ backgroundColor: "var(--color-primary)" }}
                >
                  {submitting ? "Saving…" : editingUser ? "Update User" : "Create User"}
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <FiSearch size={20} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-tertiary)" }} />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border-2 rounded-lg outline-none"
            style={{
              borderColor: "var(--border-primary)",
              backgroundColor: "var(--bg-primary)",
              color: "var(--text-primary)",
            }}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border-2 rounded-lg outline-none"
          style={{
            borderColor: "var(--border-primary)",
            backgroundColor: "var(--bg-primary)",
            color: "var(--text-primary)",
          }}
        >
          <option value="all">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      {/* Customers Table */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={staggerContainer}
        className="p-6 rounded-lg space-y-4 overflow-x-auto"
        style={{ backgroundColor: "var(--bg-secondary)" }}
      >
        <div className="min-w-full">
          <table className="w-full">
            <thead>
              <tr className="border-b-2" style={{ borderColor: "var(--border-primary)" }}>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: "var(--text-primary)" }}>
                  Customer
                </th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: "var(--text-primary)" }}>
                  Contact
                </th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: "var(--text-primary)" }}>
                  Orders
                </th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: "var(--text-primary)" }}>
                  Total Spent
                </th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: "var(--text-primary)" }}>
                  Status
                </th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: "var(--text-primary)" }}>
                  Role
                </th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: "var(--text-primary)" }}>
                  Joined
                </th>
                <th className="text-right py-3 px-4 font-semibold" style={{ color: "var(--text-primary)" }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer, index) => (
                <motion.tr
                  key={customer._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b"
                  style={{ borderColor: "var(--border-primary)" }}
                  whileHover={{ backgroundColor: "var(--bg-tertiary)" }}
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: "var(--bg-tertiary)", color: "var(--color-primary)" }}
                      >
                        <FiUser size={24} />
                      </div>
                      <div>
                        <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
                          {customer.name || "—"}
                        </p>
                        <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                          ID: {String(customer._id).slice(-8)}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <FiMail size={14} style={{ color: "var(--text-tertiary)" }} />
                        <span style={{ color: "var(--text-secondary)" }}>{customer.email || "—"}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <FiShoppingBag size={16} style={{ color: "var(--text-tertiary)" }} />
                      <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
                        {customer.orders ?? 0}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-bold" style={{ color: "var(--color-primary)" }}>
                      ৳{(customer.totalSpent != null ? customer.totalSpent : 0).toFixed(2)}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className="px-3 py-1 text-xs font-semibold rounded-lg"
                      style={{
                        backgroundColor: customer.status === "Active" ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)",
                        color: customer.status === "Active" ? "rgb(34, 197, 94)" : "rgb(239, 68, 68)",
                      }}
                    >
                      {customer.status || "Inactive"}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className="text-xs font-medium px-2 py-1 rounded"
                        style={{
                          backgroundColor: "var(--bg-tertiary)",
                          color: "var(--text-secondary)",
                        }}
                      >
                        {customer.role || "user"}
                      </span>
                      {customer.premiumAppliedAt && (
                        <span
                          className="text-xs font-semibold px-2 py-1 rounded"
                          style={{
                            backgroundColor: "rgba(234, 179, 8, 0.2)",
                            color: "rgb(202, 138, 4)",
                          }}
                          title={`Applied on ${new Date(customer.premiumAppliedAt).toLocaleDateString()}`}
                        >
                          Applied for Premium
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                      {customer.joined ? new Date(customer.joined).toLocaleDateString() : "—"}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => openEditForm(customer)}
                        className="p-2 rounded-lg transition-colors"
                        style={{ color: "var(--color-primary)" }}
                        title="Edit user"
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "var(--bg-tertiary)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                        }}
                      >
                        <FiEdit size={18} />
                      </motion.button>
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDelete(customer)}
                        disabled={deletingId === customer._id || customer.role === "admin"}
                        className="p-2 rounded-lg transition-colors disabled:opacity-50"
                        style={{ color: "var(--color-tertiary)" }}
                        title={customer.role === "admin" ? "Cannot delete admin" : "Delete customer"}
                        onMouseEnter={(e) => {
                          if (customer.role !== "admin") e.currentTarget.style.backgroundColor = "var(--bg-tertiary)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                        }}
                      >
                        <FiTrash2 size={18} />
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredCustomers.length === 0 && (
          <EmptyState
            icon={FiUser}
            title="No customers found"
            description={searchQuery || statusFilter !== "all" ? "Try adjusting your filters" : "No customers in the database yet"}
          />
        )}
      </motion.div>
    </div>
  );
};

export default Users;
