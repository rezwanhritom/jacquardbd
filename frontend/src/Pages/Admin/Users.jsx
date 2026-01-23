import { Container } from "../../components";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "../../utils/animations";
import { FiUser, FiMail, FiEdit, FiTrash2 } from "react-icons/fi";

const users = [
  { id: 1, name: "John Doe", email: "john@example.com", role: "Customer", joined: "2024-01-01" },
  { id: 2, name: "Jane Smith", email: "jane@example.com", role: "Customer", joined: "2024-01-05" },
  { id: 3, name: "Admin User", email: "admin@example.com", role: "Admin", joined: "2023-12-01" },
];

const Users = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
        Users
      </h2>

      <motion.div
        initial="initial"
        animate="animate"
        variants={staggerContainer}
        className="space-y-4"
      >
        {users.map((user) => (
          <motion.div
            key={user.id}
            variants={fadeInUp}
            className="flex items-center justify-between p-6 rounded-lg"
            style={{ backgroundColor: "var(--bg-secondary)" }}
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--bg-tertiary)" }}>
                <FiUser size={24} style={{ color: "var(--color-primary)" }} />
              </div>
              <div>
                <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>
                  {user.name}
                </h3>
                <p className="text-sm flex items-center space-x-2" style={{ color: "var(--text-secondary)" }}>
                  <FiMail size={14} />
                  <span>{user.email}</span>
                </p>
                <p className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>
                  {user.role} • Joined {user.joined}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                className="p-2 rounded-lg transition-colors"
                style={{ backgroundColor: "var(--bg-primary)", color: "var(--color-primary)" }}
              >
                <FiEdit size={20} />
              </button>
              <button
                className="p-2 rounded-lg transition-colors"
                style={{ backgroundColor: "var(--bg-primary)", color: "var(--color-tertiary)" }}
              >
                <FiTrash2 size={20} />
              </button>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default Users;
