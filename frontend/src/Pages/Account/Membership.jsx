import { useState } from "react";
import { motion } from "framer-motion";
import { fadeInUp } from "../../utils/animations";
import { FaCrown } from "react-icons/fa";
import { FiCheck, FiStar, FiGift, FiTruck, FiPercent } from "react-icons/fi";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { applyForPremium } from "../../services/user.service";

function membershipLabel(role) {
  if (role === "premium") return "Premium";
  if (role === "admin") return "Admin";
  return "Standard";
}

const Membership = () => {
  const { user, loadUser } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const role = user?.role ?? "user";
  const premiumAppliedAt = user?.premiumAppliedAt;
  const tierLabel = membershipLabel(role);
  const isPremium = role === "premium";
  const isAdmin = role === "admin";
  const isStandard = role === "user";
  const applicationPending = !!premiumAppliedAt;

  const handleApplyForPremium = async () => {
    if (!user?._id || applicationPending || !isStandard) return;
    setSubmitting(true);
    const result = await applyForPremium(user._id);
    setSubmitting(false);
    if (result.success) {
      toast.success(result.message || "Application submitted!");
      await loadUser();
    } else {
      toast.error(result.message || "Failed to submit application");
    }
  };

  return (
    <div className="space-y-8">
      {/* Current Membership — single card: Premium Member / Admin / Standard (with Apply or Pending) */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeInUp}
        className="p-6 rounded-lg border-2 text-center"
        style={{
          borderColor: "var(--color-primary)",
          backgroundColor: "var(--bg-secondary)",
        }}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center justify-center gap-3">
            <FaCrown size={32} style={{ color: "var(--color-primary)" }} />
            <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
              {tierLabel} Member
            </h2>
          </div>

          {isPremium && (
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              You have full access to premium benefits including free shipping, exclusive discounts, and early access to new collections.
            </p>
          )}

          {isAdmin && (
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Administrator access. You can manage users and approve premium applications from the Admin panel.
            </p>
          )}

          {isStandard && !applicationPending && (
            <>
              <p className="text-sm max-w-md" style={{ color: "var(--text-secondary)" }}>
                Upgrade to Premium for free shipping, exclusive discounts, and early access to new collections. Submit an application and an admin will review it.
              </p>
              <motion.button
                type="button"
                disabled={submitting}
                onClick={handleApplyForPremium}
                className="px-6 py-3 rounded-lg font-semibold text-white transition-all disabled:opacity-70"
                style={{ backgroundColor: "var(--color-primary)" }}
                whileHover={!submitting ? { scale: 1.02 } : {}}
                whileTap={!submitting ? { scale: 0.98 } : {}}
              >
                {submitting ? "Submitting…" : "Apply for Premium Membership"}
              </motion.button>
            </>
          )}

          {isStandard && applicationPending && (
            <p className="text-sm font-medium" style={{ color: "var(--color-primary)" }}>
              Application pending. An admin will review your request and update your membership soon.
            </p>
          )}
        </div>
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
              On all orders for Premium members
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
              Birthday gifts and member-only offers
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
