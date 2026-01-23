import { useState } from "react";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "../../utils/animations";
import { FiUser, FiMail, FiEdit, FiTrash2, FiSearch, FiFilter, FiPhone, FiShoppingBag } from "react-icons/fi";
import { adminCustomers } from "../../data/adminData";
import { EmptyState } from "../../components";
import toast from "react-hot-toast";

const Users = () => {
  const [customers, setCustomers] = useState(adminCustomers);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || customer.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = (id) => {
    const customer = customers.find((c) => c.id === id);
    if (window.confirm(`Are you sure you want to delete "${customer?.name}"?`)) {
      setCustomers(customers.filter((c) => c.id !== id));
      toast.success(`"${customer?.name}" deleted successfully`);
    }
  };

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
        <div className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Total: {customers.length} customers
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <FiSearch size={20} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-tertiary)" }} />
          <input
            type="text"
            placeholder="Search customers..."
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
                <th className="text-left py-3 px-4 font-semibold" style={{ color: "var(--text-primary)" }}>Customer</th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: "var(--text-primary)" }}>Contact</th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: "var(--text-primary)" }}>Orders</th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: "var(--text-primary)" }}>Total Spent</th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: "var(--text-primary)" }}>Status</th>
                <th className="text-left py-3 px-4 font-semibold" style={{ color: "var(--text-primary)" }}>Joined</th>
                <th className="text-right py-3 px-4 font-semibold" style={{ color: "var(--text-primary)" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer, index) => (
                <motion.tr
                  key={customer.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b" style={{ borderColor: "var(--border-primary)" }}
                  whileHover={{ backgroundColor: "var(--bg-tertiary)" }}
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--bg-tertiary)" }}>
                        <FiUser size={24} style={{ color: "var(--color-primary)" }} />
                      </div>
                      <div>
                        <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
                          {customer.name}
                        </p>
                        <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                          ID: {customer.id}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <FiMail size={14} style={{ color: "var(--text-tertiary)" }} />
                        <span style={{ color: "var(--text-secondary)" }}>{customer.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <FiPhone size={14} style={{ color: "var(--text-tertiary)" }} />
                        <span style={{ color: "var(--text-secondary)" }}>{customer.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <FiShoppingBag size={16} style={{ color: "var(--text-tertiary)" }} />
                      <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
                        {customer.orders}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-bold" style={{ color: "var(--color-primary)" }}>
                      ${customer.totalSpent.toFixed(2)}
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
                      {customer.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                      {new Date(customer.joined).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 rounded-lg transition-colors"
                        style={{ color: "var(--color-primary)" }}
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
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDelete(customer.id)}
                        className="p-2 rounded-lg transition-colors"
                        style={{ color: "var(--color-tertiary)" }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "var(--bg-tertiary)";
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
            description={searchQuery || statusFilter !== "all" ? "Try adjusting your filters" : "No customers available"}
          />
        )}
      </motion.div>
    </div>
  );
};

export default Users;
