import { Container } from "../../components";
import { motion } from "framer-motion";
import { fadeInUp } from "../../utils/animations";
import { FiUser, FiMail, FiPhone, FiMapPin } from "react-icons/fi";

const Profile = () => {
  // Fake user data
  const userData = {
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    address: "123 Main Street",
    city: "New York",
    state: "NY",
    zipCode: "10001",
    country: "United States",
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial="initial"
        animate="animate"
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
              First Name
            </label>
            <input
              type="text"
              defaultValue={userData.firstName}
              className="w-full px-4 py-3 border rounded-lg outline-none transition-colors"
              style={{
                borderColor: "var(--border-primary)",
                backgroundColor: "var(--bg-primary)",
                color: "var(--text-primary)",
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
              Last Name
            </label>
            <input
              type="text"
              defaultValue={userData.lastName}
              className="w-full px-4 py-3 border rounded-lg outline-none transition-colors"
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
              <span>Email</span>
            </label>
            <input
              type="email"
              defaultValue={userData.email}
              className="w-full px-4 py-3 border rounded-lg outline-none transition-colors"
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
              <span>Phone</span>
            </label>
            <input
              type="tel"
              defaultValue={userData.phone}
              className="w-full px-4 py-3 border rounded-lg outline-none transition-colors"
              style={{
                borderColor: "var(--border-primary)",
                backgroundColor: "var(--bg-primary)",
                color: "var(--text-primary)",
              }}
            />
          </div>
        </div>

        <button
          className="px-6 py-3 text-white font-semibold uppercase tracking-wider rounded-lg"
          style={{ backgroundColor: "var(--color-primary)" }}
        >
          Save Changes
        </button>
      </motion.div>

      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeInUp}
        className="p-6 rounded-lg space-y-6"
        style={{ backgroundColor: "var(--bg-secondary)" }}
      >
        <div className="flex items-center space-x-3 mb-6">
          <FiMapPin size={24} style={{ color: "var(--color-primary)" }} />
          <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            Address
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
              Street Address
            </label>
            <input
              type="text"
              defaultValue={userData.address}
              className="w-full px-4 py-3 border rounded-lg outline-none transition-colors"
              style={{
                borderColor: "var(--border-primary)",
                backgroundColor: "var(--bg-primary)",
                color: "var(--text-primary)",
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
              City
            </label>
            <input
              type="text"
              defaultValue={userData.city}
              className="w-full px-4 py-3 border rounded-lg outline-none transition-colors"
              style={{
                borderColor: "var(--border-primary)",
                backgroundColor: "var(--bg-primary)",
                color: "var(--text-primary)",
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
              State
            </label>
            <input
              type="text"
              defaultValue={userData.state}
              className="w-full px-4 py-3 border rounded-lg outline-none transition-colors"
              style={{
                borderColor: "var(--border-primary)",
                backgroundColor: "var(--bg-primary)",
                color: "var(--text-primary)",
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
              ZIP Code
            </label>
            <input
              type="text"
              defaultValue={userData.zipCode}
              className="w-full px-4 py-3 border rounded-lg outline-none transition-colors"
              style={{
                borderColor: "var(--border-primary)",
                backgroundColor: "var(--bg-primary)",
                color: "var(--text-primary)",
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
              Country
            </label>
            <input
              type="text"
              defaultValue={userData.country}
              className="w-full px-4 py-3 border rounded-lg outline-none transition-colors"
              style={{
                borderColor: "var(--border-primary)",
                backgroundColor: "var(--bg-primary)",
                color: "var(--text-primary)",
              }}
            />
          </div>
        </div>

        <button
          className="px-6 py-3 text-white font-semibold uppercase tracking-wider rounded-lg"
          style={{ backgroundColor: "var(--color-primary)" }}
        >
          Update Address
        </button>
      </motion.div>
    </div>
  );
};

export default Profile;
