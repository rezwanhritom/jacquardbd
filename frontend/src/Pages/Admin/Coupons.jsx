import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiPlus, FiEdit, FiTrash2, FiX, FiSave, FiTag, FiPackage, FiSearch } from "react-icons/fi";
import { EmptyState } from "../../components";
import toast from "react-hot-toast";
import { getCoupons, createCoupon, updateCoupon, deleteCoupon } from "../../services/coupons.service";
import { getAdminProducts } from "../../services/productApi";

const toDateInput = (date) => {
  if (!date) return "";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
};

const emptyForm = () => ({
  code: "",
  name: "",
  description: "",
  status: "Active",
  startDate: "",
  endDate: "",
  discountType: "percentage",
  discountValue: "",
  maxDiscountAmount: "",
  minOrderSubtotal: "0",
  products: [],
  usageLimit: "",
  perUserLimit: "",
});

const Coupons = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState(emptyForm());
  const [allProducts, setAllProducts] = useState([]);
  const [productSearch, setProductSearch] = useState("");

  const fetchCoupons = async () => {
    setLoading(true);
    const result = await getCoupons();
    if (result.success && result.coupons) {
      setList(result.coupons);
    } else {
      toast.error(result.message || "Failed to load coupons");
      setList([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCoupons();
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

  const handleEdit = (c) => {
    setEditingId(c._id);
    setFormData({
      code: c.code || "",
      name: c.name || "",
      description: c.description || "",
      status: c.status || "Active",
      startDate: toDateInput(c.startDate),
      endDate: toDateInput(c.endDate),
      discountType: c.discountType === "fixed" ? "fixed" : "percentage",
      discountValue: c.discountValue != null ? String(c.discountValue) : "",
      maxDiscountAmount:
        c.maxDiscountAmount != null && c.maxDiscountAmount !== "" ? String(c.maxDiscountAmount) : "",
      minOrderSubtotal: c.minOrderSubtotal != null ? String(c.minOrderSubtotal) : "0",
      products: Array.isArray(c.products) ? c.products.map(String) : [],
      usageLimit: c.usageLimit != null ? String(c.usageLimit) : "",
      perUserLimit: c.perUserLimit != null ? String(c.perUserLimit) : "",
    });
    setShowForm(true);
  };

  const handleDelete = async (c) => {
    if (!window.confirm(`Delete coupon "${c.code}"?`)) return;
    const result = await deleteCoupon(c._id);
    if (result.success) {
      setList((prev) => prev.filter((x) => x._id !== c._id));
      toast.success("Coupon deleted");
    } else {
      toast.error(result.message || "Failed to delete");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const payload = {
      code: formData.code.trim().toUpperCase(),
      name: formData.name.trim(),
      description: formData.description.trim(),
      status: formData.status,
      startDate: formData.startDate,
      endDate: formData.endDate,
      discountType: formData.discountType,
      discountValue: parseFloat(formData.discountValue) || 0,
      maxDiscountAmount: formData.discountType === "percentage" ? formData.maxDiscountAmount : "",
      minOrderSubtotal: parseFloat(formData.minOrderSubtotal) || 0,
      products: formData.products,
      usageLimit: formData.usageLimit.trim(),
      perUserLimit: formData.perUserLimit.trim(),
    };

    if (editingId) {
      const result = await updateCoupon(editingId, payload);
      if (result.success && result.coupon) {
        setList((prev) => prev.map((x) => (x._id === editingId ? result.coupon : x)));
        toast.success("Coupon updated");
        handleCancel();
      } else {
        toast.error(result.message || "Failed to update");
      }
    } else {
      const result = await createCoupon(payload);
      if (result.success && result.coupon) {
        setList((prev) => [result.coupon, ...prev]);
        toast.success("Coupon created");
        handleCancel();
      } else {
        toast.error(result.message || "Failed to create");
      }
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
      products: prev.products.includes(id)
        ? prev.products.filter((p) => p !== id)
        : [...prev.products, id],
    }));
  };

  const filteredProducts = allProducts.filter((p) => {
    const name = (p.name || "").toLowerCase();
    const search = productSearch.toLowerCase().trim();
    return !search || name.includes(search);
  });

  const formatDiscount = (c) => {
    if (c.discountType === "fixed") return `৳${Number(c.discountValue).toFixed(2)} off`;
    const cap =
      c.maxDiscountAmount != null && Number(c.maxDiscountAmount) > 0
        ? ` (max ৳${Number(c.maxDiscountAmount).toFixed(2)})`
        : "";
    return `${c.discountValue}% off${cap}`;
  };

  if (loading) {
    return (
      <div
        className="p-6 rounded-lg flex items-center justify-center min-h-[200px]"
        style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-secondary)" }}
      >
        Loading coupons…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
          <FiTag style={{ color: "var(--color-primary)" }} />
          Coupons
        </h2>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            setEditingId(null);
            setFormData(emptyForm());
            setShowForm(true);
          }}
          className="flex items-center justify-center gap-2 px-4 py-2 text-white font-semibold rounded-lg w-full sm:w-auto"
          style={{ backgroundColor: "var(--color-primary)" }}
        >
          <FiPlus size={18} />
          Create coupon
        </motion.button>
      </div>

      <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
        Customers enter these codes at checkout (Payment step). Discount applies to eligible cart lines, then tax is calculated on the reduced subtotal.
      </p>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 sm:p-6 rounded-lg space-y-4"
            style={{ backgroundColor: "var(--bg-secondary)" }}
          >
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-lg sm:text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                {editingId ? "Edit coupon" : "New coupon"}
              </h3>
              <button type="button" onClick={handleCancel} className="p-2 rounded-lg shrink-0" style={{ color: "var(--text-secondary)" }}>
                <FiX size={22} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                    Code * <span className="text-xs font-normal">(customers type this)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    required
                    disabled={!!editingId}
                    className="w-full px-4 py-3 border-2 rounded-lg outline-none font-mono disabled:opacity-70"
                    style={{
                      borderColor: "var(--border-primary)",
                      backgroundColor: "var(--bg-primary)",
                      color: "var(--text-primary)",
                    }}
                    placeholder="SAVE10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                    Status *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-3 border-2 rounded-lg outline-none"
                    style={{
                      borderColor: "var(--border-primary)",
                      backgroundColor: "var(--bg-primary)",
                      color: "var(--text-primary)",
                    }}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                    Label (internal)
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                    Discount type *
                  </label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    className="w-full px-4 py-3 border-2 rounded-lg outline-none"
                    style={{
                      borderColor: "var(--border-primary)",
                      backgroundColor: "var(--bg-primary)",
                      color: "var(--text-primary)",
                    }}
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed amount (BDT)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                    {formData.discountType === "percentage" ? "Percent off *" : "Amount off (BDT) *"}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={formData.discountType === "percentage" ? 100 : undefined}
                    step={formData.discountType === "fixed" ? "0.01" : "1"}
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    required
                    className="w-full px-4 py-3 border-2 rounded-lg outline-none"
                    style={{
                      borderColor: "var(--border-primary)",
                      backgroundColor: "var(--bg-primary)",
                      color: "var(--text-primary)",
                    }}
                  />
                </div>
                {formData.discountType === "percentage" && (
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                      Max discount (BDT, optional)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.maxDiscountAmount}
                      onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value })}
                      className="w-full px-4 py-3 border-2 rounded-lg outline-none"
                      style={{
                        borderColor: "var(--border-primary)",
                        backgroundColor: "var(--bg-primary)",
                        color: "var(--text-primary)",
                      }}
                      placeholder="No cap"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                    Min. order subtotal (BDT)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.minOrderSubtotal}
                    onChange={(e) => setFormData({ ...formData, minOrderSubtotal: e.target.value })}
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
                    Start date *
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
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
                    End date *
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
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
                    Total uses (blank = unlimited)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                    className="w-full px-4 py-3 border-2 rounded-lg outline-none"
                    style={{
                      borderColor: "var(--border-primary)",
                      backgroundColor: "var(--bg-primary)",
                      color: "var(--text-primary)",
                    }}
                    placeholder="Unlimited"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                    Per user / guest session (blank = unlimited)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.perUserLimit}
                    onChange={(e) => setFormData({ ...formData, perUserLimit: e.target.value })}
                    className="w-full px-4 py-3 border-2 rounded-lg outline-none"
                    style={{
                      borderColor: "var(--border-primary)",
                      backgroundColor: "var(--bg-primary)",
                      color: "var(--text-primary)",
                    }}
                    placeholder="Unlimited"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                    Description (optional)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 border-2 rounded-lg outline-none resize-y"
                    style={{
                      borderColor: "var(--border-primary)",
                      backgroundColor: "var(--bg-primary)",
                      color: "var(--text-primary)",
                    }}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2" style={{ color: "var(--text-secondary)" }}>
                    <FiPackage size={16} />
                    Limit to products (empty = all products in cart)
                  </label>
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Search products…"
                    className="w-full px-4 py-2 border-2 rounded-lg outline-none mb-2"
                    style={{
                      borderColor: "var(--border-primary)",
                      backgroundColor: "var(--bg-primary)",
                      color: "var(--text-primary)",
                    }}
                  />
                  <div
                    className="max-h-48 overflow-y-auto border-2 rounded-lg p-2 space-y-1"
                    style={{ borderColor: "var(--border-primary)", backgroundColor: "var(--bg-primary)" }}
                  >
                    {filteredProducts.slice(0, 80).map((p) => {
                      const id = String(p._id);
                      const on = formData.products.includes(id);
                      return (
                        <label key={id} className="flex items-center gap-2 text-sm cursor-pointer py-1 px-2 rounded hover:opacity-90">
                          <input type="checkbox" checked={on} onChange={() => toggleProduct(id)} style={{ accentColor: "var(--color-primary)" }} />
                          <span style={{ color: "var(--text-primary)" }}>{p.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 justify-end">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 rounded-lg font-medium border-2"
                  style={{ borderColor: "var(--border-primary)", color: "var(--text-primary)" }}
                >
                  Cancel
                </button>
                <motion.button
                  type="submit"
                  disabled={submitting}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 px-6 py-2 text-white font-semibold rounded-lg disabled:opacity-60"
                  style={{ backgroundColor: "var(--color-primary)" }}
                >
                  <FiSave size={18} />
                  {submitting ? "Saving…" : editingId ? "Update" : "Create"}
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {list.length === 0 ? (
        <EmptyState title="No coupons yet" description="Create a coupon for checkout discounts." />
      ) : (
        <div className="rounded-lg overflow-hidden border" style={{ borderColor: "var(--border-primary)" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr style={{ backgroundColor: "var(--bg-secondary)" }}>
                  <th className="text-left p-3 font-semibold" style={{ color: "var(--text-primary)" }}>
                    Code
                  </th>
                  <th className="text-left p-3 font-semibold" style={{ color: "var(--text-primary)" }}>
                    Discount
                  </th>
                  <th className="text-left p-3 font-semibold hidden md:table-cell" style={{ color: "var(--text-primary)" }}>
                    Valid
                  </th>
                  <th className="text-left p-3 font-semibold" style={{ color: "var(--text-primary)" }}>
                    Uses
                  </th>
                  <th className="text-right p-3 font-semibold" style={{ color: "var(--text-primary)" }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {list.map((c) => (
                  <tr key={c._id} className="border-t" style={{ borderColor: "var(--border-primary)" }}>
                    <td className="p-3">
                      <span className="font-mono font-bold" style={{ color: "var(--color-primary)" }}>
                        {c.code}
                      </span>
                      <div className="text-xs md:hidden mt-1" style={{ color: "var(--text-tertiary)" }}>
                        {toDateInput(c.startDate)} → {toDateInput(c.endDate)}
                      </div>
                    </td>
                    <td className="p-3" style={{ color: "var(--text-primary)" }}>
                      {formatDiscount(c)}
                    </td>
                    <td className="p-3 hidden md:table-cell" style={{ color: "var(--text-secondary)" }}>
                      {toDateInput(c.startDate)} — {toDateInput(c.endDate)}
                    </td>
                    <td className="p-3" style={{ color: "var(--text-secondary)" }}>
                      {c.usedCount ?? 0}
                      {c.usageLimit != null ? ` / ${c.usageLimit}` : ""}
                      <div className="text-xs" style={{ color: c.status === "Active" ? "var(--color-primary)" : "var(--text-tertiary)" }}>
                        {c.status}
                      </div>
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(c)}
                        className="p-2 rounded-lg inline-flex"
                        style={{ color: "var(--color-primary)" }}
                        aria-label="Edit"
                      >
                        <FiEdit size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(c)}
                        className="p-2 rounded-lg inline-flex"
                        style={{ color: "var(--color-tertiary)" }}
                        aria-label="Delete"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Coupons;
