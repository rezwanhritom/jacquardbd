import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, Link } from "react-router";
import { Container } from "../../components";
import { motion, AnimatePresence } from "framer-motion";
import { fadeInUp, staggerContainer } from "../../utils/animations";
import {
  FiTruck,
  FiLock,
  FiMapPin,
  FiCheck,
  FiChevronRight,
  FiChevronLeft,
  FiEdit2,
  FiPlus,
  FiGift,
} from "react-icons/fi";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useCookieConsent } from "../../context/CookieConsentContext";
import { getProfile, updateProfile } from "../../services/user.service";
import { getShippingOptions } from "../../services/shipping.service";
import { createOrder, createGuestOrder } from "../../services/orders.service";
import Loading from "../../components/Loading";

const emptyAddressForm = () => ({
  email: "",
  firstName: "",
  lastName: "",
  address: "",
  city: "",
  state: "",
  zipCode: "",
  country: "Bangladesh",
  phone: "",
});

/** Form fields from address only (street, city, state, zip, country). */
function addressFieldsOnly(addr) {
  return {
    address: (addr && addr.address) ? String(addr.address).trim() : "",
    city: (addr && addr.city) ? String(addr.city).trim() : "",
    state: (addr && addr.state) ? String(addr.state).trim() : "",
    zipCode: (addr && addr.zip) ? String(addr.zip).trim() : "",
    country: (addr && addr.country) ? String(addr.country).trim() : "Bangladesh",
  };
}

/** Contact fields (name, email, phone) from current user profile so checkout always shows latest profile. */
function profileContactFields(user) {
  const name = (user && user.name) ? String(user.name).trim() : "";
  const parts = name ? name.split(/\s+/) : [];
  return {
    email: (user && user.email) ? String(user.email).trim() : "",
    firstName: parts[0] || "",
    lastName: parts.slice(1).join(" ") || "",
    phone: (user && user.phone) ? String(user.phone).trim() : "",
  };
}

/** Full form from address + current profile: contact from profile, address lines from address. */
function addressAndProfileToFormData(addr, user) {
  return {
    ...profileContactFields(user),
    ...addressFieldsOnly(addr),
  };
}

/** Right-side label for shipping option (delivery/availability text). */
function getShippingOptionLabel(option) {
  if (!option || !option.id) return "";
  const id = String(option.id).toLowerCase();
  if (id === "standard") return "5-7 business days";
  if (id === "express") return "2-3 business days";
  if (id === "overnight") return "Dhaka, Chattagram and Barishal only";
  if (option.price != null && typeof option.price === "number") return `৳${Number(option.price).toFixed(2)}`;
  return option.priceLabel || "";
}

const Checkout = () => {
  const navigate = useNavigate();
  const { user: authUser, isAuthenticated } = useAuth();
  const { cartItems, getCartTotal, refetchCart, clearGuestCart } = useCart();
  const { decided, shoppingAllowed } = useCookieConsent();
  const [profileLoading, setProfileLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [updatingPhone, setUpdatingPhone] = useState(false);
  const [shippingOptions, setShippingOptions] = useState([]);
  const previousStepRef = useRef(null);
  const [formData, setFormData] = useState({
    ...emptyAddressForm(),
    shippingMethod: "",
  });
  const [placingOrder, setPlacingOrder] = useState(false);
  const [sendAsGift, setSendAsGift] = useState(false);
  const guestCheckoutInit = useRef(false);

  // Load shipping options from DB
  useEffect(() => {
    getShippingOptions().then(({ success, options }) => {
      if (success && Array.isArray(options) && options.length > 0) {
        setShippingOptions(options);
        setFormData((prev) => {
          const firstId = options[0].id;
          if (!prev.shippingMethod || !options.some((o) => o.id === prev.shippingMethod)) {
            return { ...prev, shippingMethod: firstId };
          }
          return prev;
        });
      }
    });
  }, []);

  useEffect(() => {
    if (isAuthenticated || guestCheckoutInit.current) return;
    if (!decided || !shoppingAllowed) return;
    if (!shippingOptions.length) return;
    guestCheckoutInit.current = true;
    setFormData((prev) => ({
      ...emptyAddressForm(),
      country: "Bangladesh",
      shippingMethod: shippingOptions[0].id,
    }));
  }, [isAuthenticated, decided, shoppingAllowed, shippingOptions]);

  // Guest checkout: shopping cookies + cart; else require login
  useEffect(() => {
    if (!decided) return;
    if (isAuthenticated) return;
    if (shoppingAllowed) return;
    navigate("/", { replace: true });
    toast.error("Accept shopping cookies to check out as a guest, or sign in.");
  }, [decided, isAuthenticated, shoppingAllowed, navigate]);

  // Load user profile and addresses from DB (refetches every time checkout mounts so we always have latest profile)
  useEffect(() => {
    if (!isAuthenticated) {
      setProfileLoading(false);
      return;
    }
    if (!authUser?._id) {
      setProfileLoading(false);
      return;
    }
    getProfile(authUser._id)
      .then(({ success, user }) => {
        if (success && user) {
          setProfile(user);
          const addrs = Array.isArray(user.addresses) ? user.addresses : [];
          setAddresses(addrs);
          const defaultAddr = addrs.find((a) => a.isDefault) || addrs[0];
          if (defaultAddr && defaultAddr._id) {
            setSelectedAddressId(defaultAddr._id);
            setFormData((prev) => ({
              ...prev,
              ...addressAndProfileToFormData(defaultAddr, user),
            }));
          } else {
            setSelectedAddressId("new");
            setFormData((prev) => ({
              ...prev,
              ...emptyAddressForm(),
              ...profileContactFields(user),
              country: "Bangladesh",
            }));
          }
        }
      })
      .finally(() => setProfileLoading(false));
  }, [isAuthenticated, authUser?._id]);

  // When user returns to address step (e.g. Edit from review), refetch profile and refresh contact fields so we show latest name/email/phone
  const refetchProfileForContact = useCallback(() => {
    if (!authUser?._id) return;
    getProfile(authUser._id).then(({ success, user }) => {
      if (success && user) {
        setProfile(user);
        setFormData((prev) => ({ ...prev, ...profileContactFields(user) }));
      }
    });
  }, [authUser?._id]);

  // When navigating back to address step (e.g. Edit or Previous), refetch profile so contact fields show latest
  useEffect(() => {
    if (currentStep === 1 && previousStepRef.current !== 1 && previousStepRef.current != null && isAuthenticated && authUser?._id) {
      refetchProfileForContact();
    }
    previousStepRef.current = currentStep;
  }, [currentStep, isAuthenticated, authUser?._id, refetchProfileForContact]);

  // When user selects a saved address: contact (name, email, phone) from current profile; address lines from selected address
  const handleSelectAddress = useCallback(
    (addressId) => {
      setSelectedAddressId(addressId);
      const user = profile || authUser;
      if (addressId === "new") {
        setFormData((prev) => ({
          ...prev,
          ...addressFieldsOnly(null),
          ...profileContactFields(user),
          country: "Bangladesh",
        }));
        return;
      }
      const addr = addresses.find((a) => String(a._id) === String(addressId));
      if (addr) {
        setFormData((prev) => ({
          ...prev,
          ...addressAndProfileToFormData(addr, user),
        }));
      }
    },
    [addresses, profile, authUser]
  );

  // Save "new" address to profile when moving to next step (synced with DB & Account)
  const saveNewAddressIfNeeded = useCallback(async () => {
    if (selectedAddressId !== "new" || !authUser?._id) return;
    const { firstName, lastName, address, city, state, zipCode, country, phone } = formData;
    if (!address.trim() || !city.trim() || !phone.trim()) return;
    const name = `${(firstName || "").trim()} ${(lastName || "").trim()}`.trim() || "Shipping";
    const newAddr = {
      label: "Home",
      name,
      phone: phone.trim(),
      address: address.trim(),
      city: city.trim(),
      state: (state || "").trim(),
      zip: (zipCode || "").trim(),
      country: (country || "Bangladesh").trim(),
      isDefault: addresses.length === 0,
    };
    const toSend = [...addresses.map((a) => ({ _id: a._id, label: a.label || "Home", name: a.name || "", phone: a.phone || "", address: a.address || "", city: a.city || "", state: a.state || "", zip: a.zip || "", country: a.country || "", isDefault: !!a.isDefault })), newAddr];
    if (toSend.length === 1) toSend[0].isDefault = true;
    const { success, user } = await updateProfile(authUser._id, { addresses: toSend });
    if (success && user && Array.isArray(user.addresses)) {
      setAddresses(user.addresses);
      setSelectedAddressId(user.addresses[user.addresses.length - 1]._id);
    }
  }, [selectedAddressId, authUser?._id, formData, addresses]);

  const isAddressComplete = useCallback(() => {
    const { email, firstName, lastName, phone, address, city, state, zipCode, country } = formData;
    return (
      (email || "").trim() !== "" &&
      (firstName || "").trim() !== "" &&
      (lastName || "").trim() !== "" &&
      (phone || "").trim() !== "" &&
      (address || "").trim() !== "" &&
      (city || "").trim() !== "" &&
      (state || "").trim() !== "" &&
      (zipCode || "").trim() !== "" &&
      (country || "").trim() !== ""
    );
  }, [formData]);

  const handleNext = async () => {
    if (currentStep === 1) {
      if (!isAddressComplete()) {
        toast.error("Please fill in all address fields before continuing.");
        return;
      }
      if (isAuthenticated && !sendAsGift) {
        await saveNewAddressIfNeeded();
        const currentPhone = (formData.phone || "").trim();
        const savedPhone = (profile?.phone || "").trim();
        if (!savedPhone && currentPhone && authUser?._id) {
          const { success, user: updated } = await updateProfile(authUser._id, { phone: currentPhone });
          if (success && updated) setProfile((p) => (p ? { ...p, phone: updated.phone ?? currentPhone } : p));
        }
      }
    }
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const handleUpdatePhone = async () => {
    const currentPhone = (formData.phone || "").trim();
    if (!currentPhone || !authUser?._id) return;
    setUpdatingPhone(true);
    const { success, user: updated } = await updateProfile(authUser._id, { phone: currentPhone });
    setUpdatingPhone(false);
    if (success && updated) {
      setProfile((p) => (p ? { ...p, phone: updated.phone ?? currentPhone } : p));
      toast.success("Phone number updated in your profile");
    } else {
      toast.error("Failed to update phone number");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handlePlaceOrder = async () => {
    if (!isAddressComplete()) {
      toast.error("Please fill in all address fields.");
      return;
    }
    setPlacingOrder(true);
    toast.loading("Placing your order...", { id: "order-processing" });
    const shippingAddress = {
      name: `${(formData.firstName || "").trim()} ${(formData.lastName || "").trim()}`.trim() || "Customer",
      phone: (formData.phone || "").trim(),
      address: (formData.address || "").trim(),
      city: (formData.city || "").trim(),
      state: (formData.state || "").trim(),
      zip: (formData.zipCode || "").trim(),
    };

    if (!isAuthenticated) {
      const items = cartItems
        .map((i) => {
          const pid = i.product?._id ?? i.product?.id;
          return pid ? { productId: String(pid), quantity: Math.max(1, Math.floor(Number(i.quantity)) || 1) } : null;
        })
        .filter(Boolean);
      const { success, orderId, message } = await createGuestOrder({
        items,
        shippingAddress,
        shippingCost: shipping,
        guestEmail: (formData.email || "").trim(),
      });
      setPlacingOrder(false);
      toast.dismiss("order-processing");
      if (success && orderId) {
        clearGuestCart();
        toast.success("Order placed successfully!");
        navigate(`/order-success/${orderId}`);
      } else {
        toast.error(message || "Failed to place order");
      }
      return;
    }

    const { success, orderId, message } = await createOrder({
      shippingAddress,
      shippingCost: shipping,
    });
    setPlacingOrder(false);
    toast.dismiss("order-processing");
    if (success && orderId) {
      await refetchCart();
      toast.success("Order placed successfully!");
      navigate(`/order-success/${orderId}`);
    } else {
      toast.error(message || "Failed to place order");
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
  };

  const subtotal = getCartTotal();

  const selectedShipping = shippingOptions.find((s) => s.id === formData.shippingMethod);
  const shipping = selectedShipping != null && typeof selectedShipping.price === "number" ? selectedShipping.price : 0;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  if (!decided) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loading />
      </div>
    );
  }
  if (!isAuthenticated && !shoppingAllowed) return null;
  if (profileLoading && isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loading />
      </div>
    );
  }
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen py-16">
        <Container>
          <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4">
            <p className="text-lg" style={{ color: "var(--text-secondary)" }}>Your cart is empty.</p>
            <Link
              to="/cart"
              className="px-6 py-3 rounded-lg font-semibold text-white"
              style={{ backgroundColor: "var(--color-primary)" }}
            >
              Go to Cart
            </Link>
          </div>
        </Container>
      </div>
    );
  }

  const steps = [
    { id: 1, name: "Address", icon: FiMapPin },
    { id: 2, name: "Shipping", icon: FiTruck },
    { id: 3, name: "Review", icon: FiCheck },
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
              <form onSubmit={handleFormSubmit}>
                <AnimatePresence mode="wait">
                  {/* Step 1: Address (DB-synced) */}
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
                      <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
                        <div className="flex items-center space-x-3">
                          <FiMapPin size={24} style={{ color: "var(--color-primary)" }} />
                          <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                            Shipping Address
                          </h2>
                        </div>
                        {isAuthenticated && (
                        <Link
                          to="/account/addresses"
                          className="text-sm font-medium flex items-center gap-1"
                          style={{ color: "var(--color-primary)" }}
                        >
                          Manage addresses
                          <FiChevronRight size={14} />
                        </Link>
                        )}
                      </div>

                      {/* Saved addresses from DB (hidden when sending as gift) */}
                      {!sendAsGift && addresses.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                            Choose a saved address
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {addresses.map((addr) => {
                              const isSelected = selectedAddressId === addr._id;
                              return (
                                <motion.label
                                  key={addr._id}
                                  whileHover={{ scale: 1.01 }}
                                  className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                    isSelected ? "ring-2 ring-offset-2" : ""
                                  }`}
                                  style={{
                                    borderColor: isSelected ? "var(--color-primary)" : "var(--border-primary)",
                                    backgroundColor: "var(--bg-primary)",
                                    ringColor: "var(--color-primary)",
                                  }}
                                >
                                  <input
                                    type="radio"
                                    name="selectedAddress"
                                    checked={isSelected}
                                    onChange={() => handleSelectAddress(addr._id)}
                                    className="mt-1 w-4 h-4"
                                    style={{ accentColor: "var(--color-primary)" }}
                                  />
                                  <div className="min-w-0">
                                    <span className="font-semibold block" style={{ color: "var(--text-primary)" }}>
                                      {addr.label || "Address"}
                                    </span>
                                    <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
                                      {addr.name}
                                      {addr.phone && ` • ${addr.phone}`}
                                    </p>
                                    <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                                      {[addr.address, addr.city, addr.state, addr.zip, addr.country].filter(Boolean).join(", ")}
                                    </p>
                                  </div>
                                </motion.label>
                              );
                            })}
                            {!sendAsGift && (
                              <motion.label
                                whileHover={{ scale: 1.01 }}
                                className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                  selectedAddressId === "new" ? "ring-2 ring-offset-2" : ""
                                }`}
                                style={{
                                  borderColor: selectedAddressId === "new" ? "var(--color-primary)" : "var(--border-primary)",
                                  backgroundColor: "var(--bg-primary)",
                                  ringColor: "var(--color-primary)",
                                }}
                              >
                                <input
                                  type="radio"
                                  name="selectedAddress"
                                  checked={selectedAddressId === "new"}
                                  onChange={() => handleSelectAddress("new")}
                                  className="w-4 h-4"
                                  style={{ accentColor: "var(--color-primary)" }}
                                />
                                <FiPlus size={20} style={{ color: "var(--color-primary)" }} />
                                <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
                                  Add new address
                                </span>
                              </motion.label>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Form: edit selected or new address (or gift recipient when sendAsGift) */}
                      <div className="pt-2">
                        <p className="text-sm font-medium mb-3" style={{ color: "var(--text-secondary)" }}>
                          {sendAsGift ? "Gift recipient address" : selectedAddressId === "new" ? "New address details" : "Edit or confirm details"}
                        </p>
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
                            {profile?.phone?.trim() && (formData.phone || "").trim() !== profile.phone.trim() && (formData.phone || "").trim() && (
                              <button
                                type="button"
                                onClick={handleUpdatePhone}
                                disabled={updatingPhone}
                                className="mt-1.5 text-sm font-medium disabled:opacity-60"
                                style={{ color: "var(--color-primary)" }}
                              >
                                {updatingPhone ? "Updating…" : "Update number?"}
                              </button>
                            )}
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
                          {selectedAddressId === "new" && addresses.length > 0 && !sendAsGift && (
                            <div className="md:col-span-2 mt-2 p-3 rounded-lg border border-dashed" style={{ borderColor: "var(--border-primary)", backgroundColor: "var(--bg-primary)" }}>
                              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                                <strong style={{ color: "var(--text-primary)" }}>Add new address?</strong> This will be saved to your address book (e.g. address #{addresses.length + 1}). Click Next to continue.
                              </p>
                            </div>
                          )}

                          {/* Send as a gift — below address form */}
                          <div className="md:col-span-2 pt-4 border-t flex items-center gap-3" style={{ borderColor: "var(--border-primary)" }}>
                            <input
                              type="checkbox"
                              id="sendAsGift"
                              checked={sendAsGift}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setSendAsGift(checked);
                                if (checked) {
                                  setFormData((prev) => ({ ...emptyAddressForm(), country: "Bangladesh", shippingMethod: prev.shippingMethod }));
                                  setSelectedAddressId("new");
                                  setCurrentStep(1);
                                } else if (profile && authUser) {
                                  const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];
                                  if (defaultAddr) {
                                    setSelectedAddressId(defaultAddr._id);
                                    setFormData((prev) => ({ ...prev, ...addressAndProfileToFormData(defaultAddr, profile) }));
                                  } else {
                                    setFormData((prev) => ({ ...emptyAddressForm(), ...profileContactFields(profile), country: "Bangladesh", shippingMethod: prev.shippingMethod }));
                                  }
                                }
                              }}
                              className="w-5 h-5 rounded"
                              style={{ accentColor: "var(--color-primary)" }}
                            />
                            <label htmlFor="sendAsGift" className="flex items-center gap-2 cursor-pointer text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                              <FiGift size={18} style={{ color: "var(--color-primary)" }} />
                              Send as a gift
                            </label>
                          </div>
                          {sendAsGift && (
                            <p className="md:col-span-2 text-sm" style={{ color: "var(--text-tertiary)" }}>
                              Gift recipient address. All fields must be filled; this address will not be saved to your account.
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 2: Shipping (DB-synced) */}
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
                            className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
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
                            <div className="flex items-center gap-4 min-w-0 flex-1">
                              <input
                                type="radio"
                                name="shippingMethod"
                                value={option.id}
                                checked={formData.shippingMethod === option.id}
                                onChange={handleChange}
                                className="w-5 h-5 flex-shrink-0"
                                style={{ accentColor: "var(--color-primary)" }}
                              />
                              <div className="font-semibold min-w-0" style={{ color: "var(--text-primary)" }}>
                                {option.name}
                              </div>
                            </div>
                            <div className="text-sm font-medium sm:text-right pl-9 sm:pl-0 sm:w-56 flex-shrink-0" style={{ color: "var(--text-secondary)" }}>
                              {getShippingOptionLabel(option)}
                            </div>
                          </motion.label>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3: Review (DB-synced: formData, selectedShipping, cartItems) */}
                  {currentStep === 3 && (
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
                          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
                            {selectedShipping ? getShippingOptionLabel(selectedShipping) : ""}
                          </p>
                        </div>
                      </div>

                      {/* Order Items Review */}
                      <div className="space-y-4">
                        <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>
                          Order Items
                        </h3>
                        <div className="space-y-3">
                          {cartItems.map((item) => {
                            const product = item.product;
                            if (!product) return null;
                            const price = product.finalPrice ?? product.price ?? 0;
                            const img = Array.isArray(product.images) && product.images[0] ? product.images[0] : "/images/product-placeholder.png";
                            return (
                              <div
                                key={product._id ?? product.id}
                                className="flex gap-4 p-4 rounded-lg"
                                style={{ backgroundColor: "var(--bg-primary)" }}
                              >
                                <div className="w-20 h-20 flex-shrink-0 overflow-hidden rounded-lg" style={{ backgroundColor: "var(--bg-tertiary)" }}>
                                  <img src={img} alt={product.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1">
                                  <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
                                    {product.name}
                                  </p>
                                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                                    Qty: {item.quantity}
                                  </p>
                                </div>
                                <div className="font-bold" style={{ color: "var(--color-primary)" }}>
                                  ৳{(price * item.quantity).toFixed(2)}
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
                  {currentStep < 3 ? (
                    <motion.button
                      type="button"
                      onClick={handleNext}
                      disabled={currentStep === 1 && !isAddressComplete()}
                      className="flex items-center gap-2 px-6 py-3 text-white font-semibold rounded-lg disabled:opacity-60 disabled:cursor-not-allowed"
                      style={{ backgroundColor: "var(--color-primary)" }}
                      whileHover={currentStep === 1 && !isAddressComplete() ? {} : { scale: 1.02 }}
                      whileTap={currentStep === 1 && !isAddressComplete() ? {} : { scale: 0.98 }}
                    >
                      Next
                      <FiChevronRight size={20} />
                    </motion.button>
                  ) : (
                    <motion.button
                      type="button"
                      disabled={placingOrder}
                      onClick={handlePlaceOrder}
                      className="flex items-center gap-2 px-8 py-3 text-white font-semibold uppercase tracking-wider rounded-lg disabled:opacity-70"
                      style={{ backgroundColor: "var(--color-primary)" }}
                      whileHover={!placingOrder ? { scale: 1.02 } : {}}
                      whileTap={!placingOrder ? { scale: 0.98 } : {}}
                    >
                      <FiLock size={20} />
                      {placingOrder ? "Placing…" : "Place Order"}
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
                  {cartItems.map((item) => {
                    const product = item.product;
                    if (!product) return null;
                    const price = product.finalPrice ?? product.price ?? 0;
                    const img = Array.isArray(product.images) && product.images[0] ? product.images[0] : "/images/product-placeholder.png";
                    return (
                      <div key={product._id ?? product.id} className="flex gap-3">
                        <div className="w-16 h-16 flex-shrink-0 overflow-hidden rounded-lg" style={{ backgroundColor: "var(--bg-tertiary)" }}>
                          <img src={img} alt={product.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                            {product.name}
                          </p>
                          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                            Qty: {item.quantity}
                          </p>
                          <p className="text-sm font-bold mt-1" style={{ color: "var(--color-primary)" }}>
                            ৳{(price * item.quantity).toFixed(2)}
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
                    <span style={{ color: "var(--text-primary)" }}>৳{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: "var(--text-secondary)" }}>Shipping</span>
                    <span style={{ color: "var(--text-primary)" }}>
                      {selectedShipping?.price != null && typeof selectedShipping.price === "number"
                        ? `৳${shipping.toFixed(2)}`
                        : (selectedShipping?.priceLabel || "Based on distance")}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: "var(--text-secondary)" }}>Tax</span>
                    <span style={{ color: "var(--text-primary)" }}>৳{tax.toFixed(2)}</span>
                  </div>
                  <div className="pt-3 border-t" style={{ borderColor: "var(--border-primary)" }}>
                    <div className="flex justify-between text-lg font-bold">
                      <span style={{ color: "var(--text-primary)" }}>Total</span>
                      <span style={{ color: "var(--color-primary)" }}>৳{total.toFixed(2)}</span>
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
