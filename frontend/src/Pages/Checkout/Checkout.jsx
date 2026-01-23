import { useState } from "react";
import { useNavigate } from "react-router";
import { Container } from "../../components";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "../../utils/animations";
import { FiCreditCard, FiTruck, FiLock } from "react-icons/fi";

const Checkout = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "customer@example.com",
    firstName: "John",
    lastName: "Doe",
    address: "123 Main Street",
    city: "New York",
    state: "NY",
    zipCode: "10001",
    country: "United States",
    phone: "+1 (555) 123-4567",
    cardNumber: "1234 5678 9012 3456",
    expiryDate: "12/25",
    cvv: "123",
    cardName: "John Doe",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Generate fake order ID
    const orderId = `ORD-${Date.now()}`;
    navigate(`/order-success/${orderId}`);
  };

  return (
    <div className="min-h-screen py-16">
      <Container>
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerContainer}
          className="max-w-4xl mx-auto space-y-8"
        >
          <motion.div variants={fadeInUp} className="text-center space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold" style={{ color: "var(--color-primary)" }}>
              Checkout
            </h1>
            <p className="text-lg" style={{ color: "var(--text-secondary)" }}>
              Complete your order
            </p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Shipping Information */}
            <motion.div
              variants={fadeInUp}
              className="p-6 rounded-lg space-y-6"
              style={{ backgroundColor: "var(--bg-secondary)" }}
            >
              <div className="flex items-center space-x-3 mb-4">
                <FiTruck size={24} style={{ color: "var(--color-primary)" }} />
                <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                  Shipping Information
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
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
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
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
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
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
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border rounded-lg outline-none transition-colors"
                    style={{
                      borderColor: "var(--border-primary)",
                      backgroundColor: "var(--bg-primary)",
                      color: "var(--text-primary)",
                    }}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
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
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
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
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    required
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
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleChange}
                    required
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
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border rounded-lg outline-none transition-colors"
                    style={{
                      borderColor: "var(--border-primary)",
                      backgroundColor: "var(--bg-primary)",
                      color: "var(--text-primary)",
                    }}
                  />
                </div>
              </div>
            </motion.div>

            {/* Payment Information */}
            <motion.div
              variants={fadeInUp}
              className="p-6 rounded-lg space-y-6"
              style={{ backgroundColor: "var(--bg-secondary)" }}
            >
              <div className="flex items-center space-x-3 mb-4">
                <FiCreditCard size={24} style={{ color: "var(--color-primary)" }} />
                <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                  Payment Information
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                    Card Number
                  </label>
                  <input
                    type="text"
                    name="cardNumber"
                    value={formData.cardNumber}
                    onChange={handleChange}
                    required
                    placeholder="1234 5678 9012 3456"
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
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleChange}
                    required
                    placeholder="MM/YY"
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
                    CVV
                  </label>
                  <input
                    type="text"
                    name="cvv"
                    value={formData.cvv}
                    onChange={handleChange}
                    required
                    placeholder="123"
                    className="w-full px-4 py-3 border rounded-lg outline-none transition-colors"
                    style={{
                      borderColor: "var(--border-primary)",
                      backgroundColor: "var(--bg-primary)",
                      color: "var(--text-primary)",
                    }}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    name="cardName"
                    value={formData.cardName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border rounded-lg outline-none transition-colors"
                    style={{
                      borderColor: "var(--border-primary)",
                      backgroundColor: "var(--bg-primary)",
                      color: "var(--text-primary)",
                    }}
                  />
                </div>
              </div>
            </motion.div>

            {/* Order Summary */}
            <motion.div
              variants={fadeInUp}
              className="p-6 rounded-lg space-y-4"
              style={{ backgroundColor: "var(--bg-secondary)" }}
            >
              <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                Order Summary
              </h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span style={{ color: "var(--text-secondary)" }}>Subtotal</span>
                  <span style={{ color: "var(--text-primary)" }}>$249.98</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: "var(--text-secondary)" }}>Shipping</span>
                  <span style={{ color: "var(--text-primary)" }}>Free</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: "var(--text-secondary)" }}>Tax</span>
                  <span style={{ color: "var(--text-primary)" }}>$20.00</span>
                </div>
                <div className="pt-4 border-t" style={{ borderColor: "var(--border-primary)" }}>
                  <div className="flex justify-between text-xl font-bold">
                    <span style={{ color: "var(--text-primary)" }}>Total</span>
                    <span style={{ color: "var(--color-primary)" }}>$269.98</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Submit Button */}
            <motion.button
              variants={fadeInUp}
              type="submit"
              className="w-full px-8 py-4 text-white font-semibold uppercase tracking-wider rounded-lg flex items-center justify-center space-x-2"
              style={{ backgroundColor: "var(--color-primary)" }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FiLock size={20} />
              <span>Place Order</span>
            </motion.button>
          </form>
        </motion.div>
      </Container>
    </div>
  );
};

export default Checkout;
