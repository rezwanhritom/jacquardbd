import { useState } from "react";
import { useNavigate } from "react-router";
import { Container } from "../../components";
import { productsData } from "../../data/products";
import { motion, AnimatePresence } from "framer-motion";
import { fadeInUp, staggerContainer } from "../../utils/animations";
import {
  FiCreditCard,
  FiTruck,
  FiLock,
  FiMapPin,
  FiCheck,
  FiChevronRight,
  FiChevronLeft,
  FiEdit2,
} from "react-icons/fi";

// Fake cart items for checkout
const checkoutItems = [
  { id: 1, productId: 1, quantity: 2, size: "M", color: "Black" },
  { id: 2, productId: 3, quantity: 1, size: "L", color: "Navy" },
];

// Shipping options
const shippingOptions = [
  { id: "standard", name: "Standard Shipping", price: 10, days: "5-7 business days" },
  { id: "express", name: "Express Shipping", price: 25, days: "2-3 business days" },
  { id: "overnight", name: "Overnight Shipping", price: 50, days: "Next business day" },
];

// Payment methods
const paymentMethods = [
  { id: "card", name: "Credit/Debit Card", icon: "💳" },
  { id: "bkash", name: "bKash", icon: "📱" },
  { id: "nagad", name: "Nagad", icon: "📱" },
];

const Checkout = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Address
    email: "customer@example.com",
    firstName: "John",
    lastName: "Doe",
    address: "123 Main Street",
    city: "Dhaka",
    state: "Dhaka",
    zipCode: "1200",
    country: "Bangladesh",
    phone: "+880 1712 345678",
    // Shipping
    shippingMethod: "standard",
    // Payment
    paymentMethod: "card",
    cardNumber: "1234 5678 9012 3456",
    expiryDate: "12/25",
    cvv: "123",
    cardName: "John Doe",
    bkashNumber: "+880 1712 345678",
    nagadNumber: "+880 1712 345678",
  });

  const getProduct = (productId) => {
    return productsData.find((p) => p.id === productId);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const orderId = `ORD-${Date.now()}`;
    navigate(`/order-success/${orderId}`);
  };

  const subtotal = checkoutItems.reduce((sum, item) => {
    const product = getProduct(item.productId);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);

  const selectedShipping = shippingOptions.find((s) => s.id === formData.shippingMethod);
  const shipping = selectedShipping ? selectedShipping.price : 10;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const steps = [
    { id: 1, name: "Address", icon: FiMapPin },
    { id: 2, name: "Shipping", icon: FiTruck },
    { id: 3, name: "Payment", icon: FiCreditCard },
    { id: 4, name: "Review", icon: FiCheck },
  ];

  const stepVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  };

  return (
    <div className="min-h-screen py-16">
      <Container>
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerContainer}
          className="max-w-6xl mx-auto space-y-8"
        >
          {/* Header */}
          <motion.div variants={fadeInUp} className="text-center space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold" style={{ color: "var(--color-primary)" }}>
              Checkout
            </h1>
            <p className="text-lg" style={{ color: "var(--text-secondary)" }}>
              Complete your order in a few simple steps
            </p>
          </motion.div>

          {/* Step Indicator */}
          <motion.div variants={fadeInUp} className="relative">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;
                const isLast = index === steps.length - 1;

                return (
                  <div key={step.id} className="flex items-center flex-1">
                    <div className="flex flex-col items-center flex-1">
                      <motion.div
                        className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                          isActive || isCompleted ? "scale-110" : ""
                        }`}
                        style={{
                          backgroundColor: isActive || isCompleted ? "var(--color-primary)" : "var(--bg-secondary)",
                          borderColor: isActive || isCompleted ? "var(--color-primary)" : "var(--border-primary)",
                          color: isActive || isCompleted ? "white" : "var(--text-secondary)",
                        }}
                        whileHover={{ scale: 1.15 }}
                      >
                        {isCompleted ? (
                          <FiCheck size={20} />
                        ) : (
                          <Icon size={20} />
                        )}
                      </motion.div>
                      <span
                        className={`text-xs mt-2 font-semibold ${
                          isActive ? "" : "opacity-60"
                        }`}
                        style={{ color: isActive ? "var(--text-primary)" : "var(--text-secondary)" }}
                      >
                        {step.name}
                      </span>
                    </div>
                    {!isLast && (
                      <div className="flex-1 mx-4 h-0.5 relative">
                        <div
                          className="absolute inset-0"
                          style={{ backgroundColor: "var(--bg-tertiary)" }}
                        />
                        <motion.div
                          className="absolute inset-0"
                          style={{ backgroundColor: "var(--color-primary)" }}
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: isCompleted ? 1 : 0 }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit}>
                <AnimatePresence mode="wait">
                  {/* Step 1: Address */}
                  {currentStep === 1 && (
                    <motion.div
                      key="address"
                      variants={stepVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      transition={{ duration: 0.3 }}
                      className="p-6 rounded-lg space-y-6"
                      style={{ backgroundColor: "var(--bg-secondary)" }}
                    >
                      <div className="flex items-center space-x-3 mb-4">
                        <FiMapPin size={24} style={{ color: "var(--color-primary)" }} />
                        <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                          Shipping Address
                        </h2>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                            Email *
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
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
                            Phone *
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            required
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
                            First Name *
                          </label>
                          <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            required
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
                            required
                            className="w-full px-4 py-3 border-2 rounded-lg outline-none transition-colors"
                            style={{
                              borderColor: "var(--border-primary)",
                              backgroundColor: "var(--bg-primary)",
                              color: "var(--text-primary)",
                            }}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                            Address *
                          </label>
                          <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            required
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
                            required
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
                            required
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
                            required
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
                            required
                            className="w-full px-4 py-3 border-2 rounded-lg outline-none transition-colors"
                            style={{
                              borderColor: "var(--border-primary)",
                              backgroundColor: "var(--bg-primary)",
                              color: "var(--text-primary)",
                            }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 2: Shipping */}
                  {currentStep === 2 && (
                    <motion.div
                      key="shipping"
                      variants={stepVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      transition={{ duration: 0.3 }}
                      className="p-6 rounded-lg space-y-6"
                      style={{ backgroundColor: "var(--bg-secondary)" }}
                    >
                      <div className="flex items-center space-x-3 mb-4">
                        <FiTruck size={24} style={{ color: "var(--color-primary)" }} />
                        <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                          Shipping Method
                        </h2>
                      </div>
                      <div className="space-y-3">
                        {shippingOptions.map((option) => (
                          <motion.label
                            key={option.id}
                            whileHover={{ scale: 1.02 }}
                            className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all ${
                              formData.shippingMethod === option.id ? "ring-2" : ""
                            }`}
                            style={{
                              borderColor:
                                formData.shippingMethod === option.id
                                  ? "var(--color-primary)"
                                  : "var(--border-primary)",
                              backgroundColor: "var(--bg-primary)",
                            }}
                          >
                            <div className="flex items-center gap-4">
                              <input
                                type="radio"
                                name="shippingMethod"
                                value={option.id}
                                checked={formData.shippingMethod === option.id}
                                onChange={handleChange}
                                className="w-5 h-5"
                                style={{ accentColor: "var(--color-primary)" }}
                              />
                              <div>
                                <div className="font-semibold" style={{ color: "var(--text-primary)" }}>
                                  {option.name}
                                </div>
                                <div className="text-sm" style={{ color: "var(--text-secondary)" }}>
                                  {option.days}
                                </div>
                              </div>
                            </div>
                            <div className="font-bold" style={{ color: "var(--color-primary)" }}>
                              ${option.price.toFixed(2)}
                            </div>
                          </motion.label>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3: Payment */}
                  {currentStep === 3 && (
                    <motion.div
                      key="payment"
                      variants={stepVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      transition={{ duration: 0.3 }}
                      className="p-6 rounded-lg space-y-6"
                      style={{ backgroundColor: "var(--bg-secondary)" }}
                    >
                      <div className="flex items-center space-x-3 mb-4">
                        <FiCreditCard size={24} style={{ color: "var(--color-primary)" }} />
                        <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                          Payment Method
                        </h2>
                      </div>

                      {/* Payment Method Selection */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        {paymentMethods.map((method) => (
                          <motion.label
                            key={method.id}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                              formData.paymentMethod === method.id ? "ring-2" : ""
                            }`}
                            style={{
                              borderColor:
                                formData.paymentMethod === method.id
                                  ? "var(--color-primary)"
                                  : "var(--border-primary)",
                              backgroundColor: "var(--bg-primary)",
                            }}
                          >
                            <input
                              type="radio"
                              name="paymentMethod"
                              value={method.id}
                              checked={formData.paymentMethod === method.id}
                              onChange={handleChange}
                              className="hidden"
                            />
                            <span className="text-3xl mb-2">{method.icon}</span>
                            <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                              {method.name}
                            </span>
                          </motion.label>
                        ))}
                      </div>

                      {/* Payment Details */}
                      <AnimatePresence mode="wait">
                        {formData.paymentMethod === "card" && (
                          <motion.div
                            key="card"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-4"
                          >
                            <div>
                              <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                                Card Number *
                              </label>
                              <input
                                type="text"
                                name="cardNumber"
                                value={formData.cardNumber}
                                onChange={handleChange}
                                required
                                placeholder="1234 5678 9012 3456"
                                maxLength={19}
                                className="w-full px-4 py-3 border-2 rounded-lg outline-none transition-colors"
                                style={{
                                  borderColor: "var(--border-primary)",
                                  backgroundColor: "var(--bg-primary)",
                                  color: "var(--text-primary)",
                                }}
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                                  Expiry Date *
                                </label>
                                <input
                                  type="text"
                                  name="expiryDate"
                                  value={formData.expiryDate}
                                  onChange={handleChange}
                                  required
                                  placeholder="MM/YY"
                                  maxLength={5}
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
                                  CVV *
                                </label>
                                <input
                                  type="text"
                                  name="cvv"
                                  value={formData.cvv}
                                  onChange={handleChange}
                                  required
                                  placeholder="123"
                                  maxLength={3}
                                  className="w-full px-4 py-3 border-2 rounded-lg outline-none transition-colors"
                                  style={{
                                    borderColor: "var(--border-primary)",
                                    backgroundColor: "var(--bg-primary)",
                                    color: "var(--text-primary)",
                                  }}
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                                Cardholder Name *
                              </label>
                              <input
                                type="text"
                                name="cardName"
                                value={formData.cardName}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 border-2 rounded-lg outline-none transition-colors"
                                style={{
                                  borderColor: "var(--border-primary)",
                                  backgroundColor: "var(--bg-primary)",
                                  color: "var(--text-primary)",
                                }}
                              />
                            </div>
                          </motion.div>
                        )}

                        {formData.paymentMethod === "bkash" && (
                          <motion.div
                            key="bkash"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-4"
                          >
                            <div className="p-4 rounded-lg" style={{ backgroundColor: "var(--bg-primary)" }}>
                              <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
                                Pay with bKash mobile number
                              </p>
                              <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                                bKash Number *
                              </label>
                              <input
                                type="tel"
                                name="bkashNumber"
                                value={formData.bkashNumber}
                                onChange={handleChange}
                                required
                                placeholder="+880 1XXX XXXXXX"
                                className="w-full px-4 py-3 border-2 rounded-lg outline-none transition-colors"
                                style={{
                                  borderColor: "var(--border-primary)",
                                  backgroundColor: "var(--bg-primary)",
                                  color: "var(--text-primary)",
                                }}
                              />
                            </div>
                          </motion.div>
                        )}

                        {formData.paymentMethod === "nagad" && (
                          <motion.div
                            key="nagad"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-4"
                          >
                            <div className="p-4 rounded-lg" style={{ backgroundColor: "var(--bg-primary)" }}>
                              <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
                                Pay with Nagad mobile number
                              </p>
                              <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                                Nagad Number *
                              </label>
                              <input
                                type="tel"
                                name="nagadNumber"
                                value={formData.nagadNumber}
                                onChange={handleChange}
                                required
                                placeholder="+880 1XXX XXXXXX"
                                className="w-full px-4 py-3 border-2 rounded-lg outline-none transition-colors"
                                style={{
                                  borderColor: "var(--border-primary)",
                                  backgroundColor: "var(--bg-primary)",
                                  color: "var(--text-primary)",
                                }}
                              />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )}

                  {/* Step 4: Review */}
                  {currentStep === 4 && (
                    <motion.div
                      key="review"
                      variants={stepVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      transition={{ duration: 0.3 }}
                      className="p-6 rounded-lg space-y-6"
                      style={{ backgroundColor: "var(--bg-secondary)" }}
                    >
                      <div className="flex items-center space-x-3 mb-4">
                        <FiCheck size={24} style={{ color: "var(--color-primary)" }} />
                        <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                          Review & Confirm
                        </h2>
                      </div>

                      {/* Shipping Address Review */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>
                            Shipping Address
                          </h3>
                          <button
                            type="button"
                            onClick={() => setCurrentStep(1)}
                            className="flex items-center gap-1 text-sm"
                            style={{ color: "var(--color-primary)" }}
                          >
                            <FiEdit2 size={14} />
                            Edit
                          </button>
                        </div>
                        <div className="p-4 rounded-lg" style={{ backgroundColor: "var(--bg-primary)" }}>
                          <p className="text-sm" style={{ color: "var(--text-primary)" }}>
                            {formData.firstName} {formData.lastName}
                          </p>
                          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                            {formData.address}
                          </p>
                          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                            {formData.city}, {formData.state} {formData.zipCode}
                          </p>
                          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                            {formData.country}
                          </p>
                          <p className="text-sm mt-2" style={{ color: "var(--text-secondary)" }}>
                            {formData.phone}
                          </p>
                        </div>
                      </div>

                      {/* Shipping Method Review */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>
                            Shipping Method
                          </h3>
                          <button
                            type="button"
                            onClick={() => setCurrentStep(2)}
                            className="flex items-center gap-1 text-sm"
                            style={{ color: "var(--color-primary)" }}
                          >
                            <FiEdit2 size={14} />
                            Edit
                          </button>
                        </div>
                        <div className="p-4 rounded-lg" style={{ backgroundColor: "var(--bg-primary)" }}>
                          <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                            {selectedShipping?.name}
                          </p>
                          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                            {selectedShipping?.days}
                          </p>
                        </div>
                      </div>

                      {/* Payment Method Review */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>
                            Payment Method
                          </h3>
                          <button
                            type="button"
                            onClick={() => setCurrentStep(3)}
                            className="flex items-center gap-1 text-sm"
                            style={{ color: "var(--color-primary)" }}
                          >
                            <FiEdit2 size={14} />
                            Edit
                          </button>
                        </div>
                        <div className="p-4 rounded-lg" style={{ backgroundColor: "var(--bg-primary)" }}>
                          <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                            {paymentMethods.find((m) => m.id === formData.paymentMethod)?.name}
                          </p>
                          {formData.paymentMethod === "card" && (
                            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
                              **** **** **** {formData.cardNumber.slice(-4)}
                            </p>
                          )}
                          {(formData.paymentMethod === "bkash" || formData.paymentMethod === "nagad") && (
                            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
                              {formData[`${formData.paymentMethod}Number`]}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Order Items Review */}
                      <div className="space-y-4">
                        <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>
                          Order Items
                        </h3>
                        <div className="space-y-3">
                          {checkoutItems.map((item) => {
                            const product = getProduct(item.productId);
                            if (!product) return null;

                            return (
                              <div
                                key={item.id}
                                className="flex gap-4 p-4 rounded-lg"
                                style={{ backgroundColor: "var(--bg-primary)" }}
                              >
                                <div className="w-20 h-20 flex-shrink-0 overflow-hidden rounded-lg" style={{ backgroundColor: "var(--bg-tertiary)" }}>
                                  <img
                                    src={product.images[0]}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="flex-1">
                                  <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
                                    {product.name}
                                  </p>
                                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                                    Size: {item.size} | Qty: {item.quantity}
                                  </p>
                                </div>
                                <div className="font-bold" style={{ color: "var(--color-primary)" }}>
                                  ${(product.price * item.quantity).toFixed(2)}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Navigation Buttons */}
                <div className="flex justify-between gap-4 mt-6">
                  {currentStep > 1 && (
                    <motion.button
                      type="button"
                      onClick={handlePrevious}
                      className="flex items-center gap-2 px-6 py-3 border-2 rounded-lg font-semibold transition-colors"
                      style={{
                        borderColor: "var(--border-primary)",
                        color: "var(--text-primary)",
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <FiChevronLeft size={20} />
                      Previous
                    </motion.button>
                  )}
                  <div className="flex-1" />
                  {currentStep < 4 ? (
                    <motion.button
                      type="button"
                      onClick={handleNext}
                      className="flex items-center gap-2 px-6 py-3 text-white font-semibold rounded-lg"
                      style={{ backgroundColor: "var(--color-primary)" }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Next
                      <FiChevronRight size={20} />
                    </motion.button>
                  ) : (
                    <motion.button
                      type="submit"
                      className="flex items-center gap-2 px-8 py-3 text-white font-semibold uppercase tracking-wider rounded-lg"
                      style={{ backgroundColor: "var(--color-primary)" }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <FiLock size={20} />
                      Place Order
                    </motion.button>
                  )}
                </div>
              </form>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="sticky top-24 p-6 rounded-lg space-y-6"
                style={{ backgroundColor: "var(--bg-secondary)" }}
              >
                <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                  Order Summary
                </h2>

                {/* Order Items */}
                <div className="space-y-3">
                  {checkoutItems.map((item) => {
                    const product = getProduct(item.productId);
                    if (!product) return null;

                    return (
                      <div key={item.id} className="flex gap-3">
                        <div className="w-16 h-16 flex-shrink-0 overflow-hidden rounded-lg" style={{ backgroundColor: "var(--bg-tertiary)" }}>
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                            {product.name}
                          </p>
                          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                            Qty: {item.quantity}
                          </p>
                          <p className="text-sm font-bold mt-1" style={{ color: "var(--color-primary)" }}>
                            ${(product.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 pt-4 border-t" style={{ borderColor: "var(--border-primary)" }}>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: "var(--text-secondary)" }}>Subtotal</span>
                    <span style={{ color: "var(--text-primary)" }}>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: "var(--text-secondary)" }}>Shipping</span>
                    <span style={{ color: "var(--text-primary)" }}>${shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: "var(--text-secondary)" }}>Tax</span>
                    <span style={{ color: "var(--text-primary)" }}>${tax.toFixed(2)}</span>
                  </div>
                  <div className="pt-3 border-t" style={{ borderColor: "var(--border-primary)" }}>
                    <div className="flex justify-between text-lg font-bold">
                      <span style={{ color: "var(--text-primary)" }}>Total</span>
                      <span style={{ color: "var(--color-primary)" }}>${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </Container>
    </div>
  );
};

export default Checkout;
