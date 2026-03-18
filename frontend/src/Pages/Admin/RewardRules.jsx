import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiPlus, FiEdit, FiTrash2, FiX, FiSave, FiGift } from "react-icons/fi";
import { EmptyState } from "../../components";
import toast from "react-hot-toast";
import {
  getAdminRewardRules,
  createRewardRule,
  updateRewardRule,
  deleteRewardRule,
} from "../../services/rewards.service";
import { getAdminProducts } from "../../services/productApi";

const emptyForm = () => ({
  name: "",
  description: "",
  status: "Active",
  pointsRequired: "1000",
  benefitType: "discount",
  discountType: "percentage",
  discountValue: "10",
  maxDiscountAmount: "",
  minOrderSubtotal: "0",
  products: [],
  sortOrder: "0",
});

const RewardRules = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState(emptyForm());
  const [allProducts, setAllProducts] = useState([]);
  const [productSearch, setProductSearch] = useState("");

  const fetchRules = async () => {
    setLoading(true);
    const result = await getAdminRewardRules();
    if (result.success && result.rules) setList(result.rules);
    else {
      toast.error(result.message || "Failed to load reward rules");
      setList([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRules();
  }, []);

  useEffect(() => {
    if (showForm) {
      getAdminProducts()
        .then((res) => {
          if (res.success && Array.isArray(res.products)) setAllProducts(res.products);
          else setAllProducts([]);
        })
        .catch(() => setAllProducts([]));
    }
  }, [showForm]);

  const handleEdit = (r) => {
    setEditingId(r._id);
    setFormData({
      name: r.name || "",
      description: r.description || "",
      status: r.status || "Active",
      pointsRequired: String(r.pointsRequired ?? 1000),
      benefitType: r.benefitType === "free_shipping" ? "free_shipping" : "discount",
      discountType: r.discountType === "fixed" ? "fixed" : "percentage",
      discountValue: r.discountValue != null ? String(r.discountValue) : "0",
      maxDiscountAmount:
        r.maxDiscountAmount != null && r.maxDiscountAmount !== "" ? String(r.maxDiscountAmount) : "",
      minOrderSubtotal: r.minOrderSubtotal != null ? String(r.minOrderSubtotal) : "0",
      products: Array.isArray(r.products) ? r.products.map((p) => String(p._id ?? p)) : [],
      sortOrder: String(r.sortOrder ?? 0),
    });
    setShowForm(true);
  };

  const handleDelete = async (r) => {
    if (!window.confirm(`Delete reward rule "${r.name}"?`)) return;
    const result = await deleteRewardRule(r._id);
    if (result.success) {
      setList((prev) => prev.filter((x) => x._id !== r._id));
      toast.success("Deleted");
    } else toast.error(result.message || "Failed");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      status: formData.status,
      pointsRequired: parseInt(formData.pointsRequired, 10) || 1,
      benefitType: formData.benefitType,
      discountType: formData.discountType,
      discountValue: parseFloat(formData.discountValue) || 0,
      maxDiscountAmount:
        formData.benefitType === "discount" && formData.discountType === "percentage"
          ? formData.maxDiscountAmount
          : "",
      minOrderSubtotal: parseFloat(formData.minOrderSubtotal) || 0,
      products: formData.products,
      sortOrder: parseInt(formData.sortOrder, 10) || 0,
    };
    if (editingId) {
      const result = await updateRewardRule(editingId, payload);
      if (result.success && result.rule) {
        setList((prev) => prev.map((x) => (x._id === editingId ? result.rule : x)));
        toast.success("Updated");
        handleCancel();
      } else toast.error(result.message || "Failed");
    } else {
      const result = await createRewardRule(payload);
      if (result.success && result.rule) {
        setList((prev) => [result.rule, ...prev]);
        toast.success("Created");
        handleCancel();
      } else toast.error(result.message || "Failed");
    }
    setSubmitting(false);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setProductSearch("");
    setFormData(emptyForm());
  };

  const toggleProduct = (productId) => {
    const id = String(productId);
    setFormData((prev) => ({
      ...prev,
      products: prev.products.includes(id) ? prev.products.filter((p) => p !== id) : [...prev.products, id],
    }));
  };

  const filteredProducts = allProducts.filter((p) => {
    const name = (p.name || "").toLowerCase();
    const search = productSearch.toLowerCase().trim();
    return !search || name.includes(search);
  });

  const formatBenefit = (r) => {
    if (r.benefitType === "free_shipping") return "Free shipping";
    if (r.discountType === "fixed") return `৳${Number(r.discountValue).toFixed(2)} off`;
    return `${r.discountValue}% off`;
  };

  if (loading) {
    return (
      <div
        className="p-6 rounded-lg flex items-center justify-center min-h-[200px]"
        style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-secondary)" }}
      >
        Loading reward rules…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <FiGift size={24} style={{ color: "var(--color-primary)" }} />
          <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            Reward point rules
          </h2>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditingId(null);
            setFormData(emptyForm());
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium"
          style={{ backgroundColor: "var(--color-primary)" }}
        >
          <FiPlus size={18} /> New rule
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-xl border p-6 space-y-4"
            style={{ borderColor: "var(--border-primary)", backgroundColor: "var(--bg-secondary)" }}
          >
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-lg">{editingId ? "Edit rule" : "New rule"}</h3>
              <button type="button" onClick={handleCancel} className="p-2 rounded-lg hover:opacity-80">
                <FiX size={22} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    required
                    value={formData.name}
                    onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border"
                    style={{ borderColor: "var(--border-primary)", backgroundColor: "var(--bg-primary)" }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Points required</label>
                  <input
                    required
                    type="number"
                    min={1}
                    value={formData.pointsRequired}
                    onChange={(e) => setFormData((p) => ({ ...p, pointsRequired: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border"
                    style={{ borderColor: "var(--border-primary)", backgroundColor: "var(--bg-primary)" }}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border"
                  style={{ borderColor: "var(--border-primary)", backgroundColor: "var(--bg-primary)" }}
                />
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData((p) => ({ ...p, status: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border"
                    style={{ borderColor: "var(--border-primary)", backgroundColor: "var(--bg-primary)" }}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Benefit</label>
                  <select
                    value={formData.benefitType}
                    onChange={(e) => setFormData((p) => ({ ...p, benefitType: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border"
                    style={{ borderColor: "var(--border-primary)", backgroundColor: "var(--bg-primary)" }}
                  >
                    <option value="discount">Discount</option>
                    <option value="free_shipping">Free shipping</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Sort order</label>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData((p) => ({ ...p, sortOrder: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border"
                    style={{ borderColor: "var(--border-primary)", backgroundColor: "var(--bg-primary)" }}
                  />
                </div>
              </div>
              {formData.benefitType === "discount" && (
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Discount type</label>
                    <select
                      value={formData.discountType}
                      onChange={(e) => setFormData((p) => ({ ...p, discountType: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border"
                      style={{ borderColor: "var(--border-primary)", backgroundColor: "var(--bg-primary)" }}
                    >
                      <option value="percentage">Percentage</option>
                      <option value="fixed">Fixed (৳)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Value</label>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={formData.discountValue}
                      onChange={(e) => setFormData((p) => ({ ...p, discountValue: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border"
                      style={{ borderColor: "var(--border-primary)", backgroundColor: "var(--bg-primary)" }}
                    />
                  </div>
                  {formData.discountType === "percentage" && (
                    <div>
                      <label className="block text-sm font-medium mb-1">Max discount (৳)</label>
                      <input
                        type="number"
                        min={0}
                        placeholder="Optional"
                        value={formData.maxDiscountAmount}
                        onChange={(e) => setFormData((p) => ({ ...p, maxDiscountAmount: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg border"
                        style={{ borderColor: "var(--border-primary)", backgroundColor: "var(--bg-primary)" }}
                      />
                    </div>
                  )}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1">Min. order subtotal after coupon (৳)</label>
                <input
                  type="number"
                  min={0}
                  value={formData.minOrderSubtotal}
                  onChange={(e) => setFormData((p) => ({ ...p, minOrderSubtotal: e.target.value }))}
                  className="w-full max-w-xs px-3 py-2 rounded-lg border"
                  style={{ borderColor: "var(--border-primary)", backgroundColor: "var(--bg-primary)" }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Restrict to products (empty = all products)
                </label>
                <input
                  type="search"
                  placeholder="Search products…"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full max-w-md px-3 py-2 rounded-lg border mb-2 flex items-center gap-2"
                  style={{ borderColor: "var(--border-primary)", backgroundColor: "var(--bg-primary)" }}
                />
                <div
                  className="max-h-48 overflow-y-auto rounded-lg border p-2 space-y-1"
                  style={{ borderColor: "var(--border-primary)" }}
                >
                  {filteredProducts.slice(0, 80).map((p) => (
                    <label key={p._id} className="flex items-center gap-2 text-sm cursor-pointer py-1">
                      <input
                        type="checkbox"
                        checked={formData.products.includes(String(p._id))}
                        onChange={() => toggleProduct(p._id)}
                      />
                      {p.name}
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium"
                  style={{ backgroundColor: "var(--color-primary)" }}
                >
                  <FiSave size={18} /> {submitting ? "Saving…" : "Save"}
                </button>
                <button type="button" onClick={handleCancel} className="px-4 py-2 rounded-lg border">
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {list.length === 0 ? (
        <EmptyState
          icon={FiGift}
          title="No reward rules"
          description="Create rules so customers can redeem points for discounts or free shipping."
        />
      ) : (
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--border-primary)" }}>
          <table className="w-full text-sm">
            <thead style={{ backgroundColor: "var(--bg-secondary)" }}>
              <tr>
                <th className="text-left p-3">Name</th>
                <th className="text-left p-3">Points</th>
                <th className="text-left p-3">Benefit</th>
                <th className="text-left p-3">Status</th>
                <th className="text-right p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((r) => (
                <tr key={r._id} className="border-t" style={{ borderColor: "var(--border-primary)" }}>
                  <td className="p-3 font-medium">{r.name}</td>
                  <td className="p-3">{r.pointsRequired}</td>
                  <td className="p-3">{formatBenefit(r)}</td>
                  <td className="p-3">{r.status}</td>
                  <td className="p-3 text-right space-x-2">
                    <button type="button" onClick={() => handleEdit(r)} className="inline-flex p-2 rounded hover:opacity-80">
                      <FiEdit />
                    </button>
                    <button type="button" onClick={() => handleDelete(r)} className="inline-flex p-2 rounded text-red-500">
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RewardRules;
