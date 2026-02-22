import { useState } from "react";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "../../utils/animations";
import { FiCrown, FiCheck, FiStar, FiGift, FiTruck, FiPercent } from "react-icons/fi";
import { mockUser, membershipTiers } from "../../data/accountData";
import toast from "react-hot-toast";

const Membership = () => {
  const [selectedTier, setSelectedTier] = useState(null);

  const getTierIcon = (tierId) => {
    switch (tierId) {
      case "basic":
        return null;
      case "premium":
        return FiStar;
      case "vip":
        return FiCrown;
      default:
        return null;
    }
  };

  const handleUpgrade = (tierId) => {
    const tier = membershipTiers.find((t) => t.id === tierId);
    setSelectedTier(tierId);
    toast.loading("Processing upgrade...", { id: "upgrade" });
    // In real app, this would process payment
    setTimeout(() => {
      toast.success(`Upgraded to ${tier?.name} membership!`, { id: "upgrade" });
      setSelectedTier(null);
    }, 1500);
  };

  return (
    <div className="space-y-8">
      {/* Current Membership */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeInUp}
        className="p-6 rounded-lg border-2"
        style={{
          borderColor: "var(--color-primary)",
          backgroundColor: "var(--bg-secondary)",
        }}
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <FiCrown size={32} style={{ color: "var(--color-primary)" }} />
              <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                {mockUser.membershipTier} Member
              </h2>
            </div>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Member since {new Date(mockUser.memberSince).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
              })}
            </p>
            {mockUser.membershipTier !== "Basic" && (
              <p className="text-sm mt-2" style={{ color: "var(--text-secondary)" }}>
                Expires on {new Date(mockUser.membershipExpiry).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold mb-1" style={{ color: "var(--color-primary)" }}>
              {mockUser.loyaltyPoints}
            </p>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Loyalty Points
            </p>
          </div>
        </div>
      </motion.div>

      {/* Membership Tiers */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={staggerContainer}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {membershipTiers.map((tier, index) => {
          const Icon = getTierIcon(tier.id);
          const isCurrent = tier.isCurrent;
          const isUpgrading = selectedTier === tier.id;

          return (
            <motion.div
              key={tier.id}
              variants={fadeInUp}
              className={`p-6 rounded-lg border-2 relative ${
                isCurrent ? "ring-2" : ""
              }`}
              style={{
                borderColor: isCurrent ? "var(--color-primary)" : "var(--border-primary)",
                backgroundColor: "var(--bg-secondary)",
              }}
              whileHover={{ scale: 1.02, y: -4 }}
              transition={{ duration: 0.2 }}
            >
              {isCurrent && (
                <div className="absolute top-4 right-4 px-3 py-1 text-xs font-semibold uppercase rounded-lg" style={{ backgroundColor: "var(--color-primary)", color: "white" }}>
                  Current
                </div>
              )}
              <div className="space-y-4">
                <div>
                  {Icon && (
                    <Icon size={40} className="mb-3" style={{ color: "var(--color-primary)" }} />
                  )}
                  <h3 className="text-2xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
                    {tier.name}
                  </h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold" style={{ color: "var(--color-primary)" }}>
                      ৳{tier.price}
                    </span>
                    {tier.price > 0 && (
                      <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                        /year
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t" style={{ borderColor: "var(--border-primary)" }}>
                  {tier.benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <FiCheck size={20} className="flex-shrink-0 mt-0.5" style={{ color: "var(--color-primary)" }} />
                      <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                        {benefit}
                      </span>
                    </div>
                  ))}
                </div>

                <motion.button
                  whileHover={!isCurrent && !isUpgrading ? { scale: 1.02 } : {}}
                  whileTap={!isCurrent && !isUpgrading ? { scale: 0.98 } : {}}
                  onClick={() => !isCurrent && handleUpgrade(tier.id)}
                  disabled={isCurrent || isUpgrading}
                  className={`w-full px-6 py-3 rounded-lg font-semibold transition-all ${
                    isCurrent
                      ? "opacity-50 cursor-not-allowed"
                      : isUpgrading
                      ? "opacity-75 cursor-wait"
                      : ""
                  }`}
                  style={{
                    backgroundColor: isCurrent ? "var(--bg-tertiary)" : "var(--color-primary)",
                    color: "white",
                  }}
                >
                  {isCurrent
                    ? "Current Plan"
                    : isUpgrading
                    ? "Processing..."
                    : tier.price === 0
                    ? "Free"
                    : "Upgrade Now"}
                </motion.button>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Benefits Overview */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeInUp}
        className="p-6 rounded-lg space-y-6"
        style={{ backgroundColor: "var(--bg-secondary)" }}
      >
        <h3 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
          Membership Benefits
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--color-primary)20" }}>
              <FiTruck size={32} style={{ color: "var(--color-primary)" }} />
            </div>
            <h4 className="font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
              Free Shipping
            </h4>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              On all orders for Premium and VIP members
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--color-primary)20" }}>
              <FiPercent size={32} style={{ color: "var(--color-primary)" }} />
            </div>
            <h4 className="font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
              Exclusive Discounts
            </h4>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Up to 15% off on all purchases
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--color-primary)20" }}>
              <FiGift size={32} style={{ color: "var(--color-primary)" }} />
            </div>
            <h4 className="font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
              Special Gifts
            </h4>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Birthday gifts and annual gift boxes
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--color-primary)20" }}>
              <FiStar size={32} style={{ color: "var(--color-primary)" }} />
            </div>
            <h4 className="font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
              Early Access
            </h4>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              First access to new collections and sales
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Membership;
