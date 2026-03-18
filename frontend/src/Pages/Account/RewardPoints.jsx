import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { FiGift, FiCheck } from "react-icons/fi";
import toast from "react-hot-toast";
import { getRewardAccount, redeemRewardLater } from "../../services/rewards.service";
import { fadeInUp, staggerContainer } from "../../utils/animations";
import Loading from "../../components/Loading";

function describeRule(r) {
  if (r.benefitType === "free_shipping") return "Free shipping on next order";
  if (r.discountType === "fixed") return `৳${Number(r.discountValue).toFixed(2)} off eligible items`;
  const cap =
    r.maxDiscountAmount != null && Number(r.maxDiscountAmount) > 0
      ? ` (max ৳${Number(r.maxDiscountAmount).toFixed(2)})`
      : "";
  return `${r.discountValue}% off eligible items${cap}`;
}

const RewardPoints = () => {
  const [loading, setLoading] = useState(true);
  const [points, setPoints] = useState(0);
  const [pending, setPending] = useState(null);
  const [rules, setRules] = useState([]);
  const [redeeming, setRedeeming] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await getRewardAccount();
    setLoading(false);
    if (res.success) {
      setPoints(res.rewardPoints ?? 0);
      setPending(res.pendingReward || null);
      setRules(Array.isArray(res.rules) ? res.rules : []);
    } else {
      toast.error(res.message || "Failed to load rewards");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleRedeemLater = async (rule) => {
    if (pending) {
      toast.error("You already have a reward ready. Use it at checkout first.");
      return;
    }
    const cost = Number(rule.pointsRequired) || 0;
    if (points < cost) {
      toast.error(`Not enough points (need ${cost})`);
      return;
    }
    setRedeeming(rule._id);
    const res = await redeemRewardLater(rule._id);
    setRedeeming(null);
    if (res.success) {
      toast.success(res.message || "Reward saved for checkout");
      setPoints(res.rewardPoints ?? points - cost);
      setPending(res.pendingReward ? { ...res.pendingReward, name: rule.name, pointsCost: cost } : { name: rule.name, pointsCost: cost });
      load();
    } else {
      toast.error(res.message || "Could not redeem");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loading />
      </div>
    );
  }

  return (
    <motion.div initial="initial" animate="animate" variants={staggerContainer} className="space-y-8">
      <motion.div variants={fadeInUp}>
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
          <FiGift className="text-[var(--color-primary)]" />
          Reward points
        </h2>
        <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
          Earn 1 point for every ৳100 you spend on orders (signed-in checkout). Redeem points for discounts or free
          shipping on eligible carts.
        </p>
        <div
          className="rounded-xl p-6 border-2"
          style={{ borderColor: "var(--color-primary)", backgroundColor: "var(--bg-secondary)" }}
        >
          <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
            Total points
          </p>
          <p className="text-4xl font-bold mt-1" style={{ color: "var(--color-primary)" }}>
            {points.toLocaleString()}
          </p>
        </div>
      </motion.div>

      {pending && (
        <motion.div
          variants={fadeInUp}
          className="rounded-xl p-4 border flex items-start gap-3"
          style={{ borderColor: "var(--color-primary)", backgroundColor: "var(--bg-primary)" }}
        >
          <FiCheck className="flex-shrink-0 mt-0.5 text-[var(--color-primary)]" size={22} />
          <div>
            <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
              Reward ready for checkout
            </p>
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
              {pending.name} — will apply automatically on your next order when your cart qualifies. You used{" "}
              {pending.pointsCost} points.
            </p>
          </div>
        </motion.div>
      )}

      <motion.div variants={fadeInUp}>
        <h3 className="text-lg font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
          Available rewards
        </h3>
        <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
          These offers are set by the store. At checkout you can redeem if your cart qualifies and you have enough
          points—or redeem now to lock the benefit for your next qualifying order.
        </p>
        <div className="space-y-3">
          {rules.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
              No reward offers yet. Check back later.
            </p>
          ) : (
            rules.map((r) => {
              const cost = Number(r.pointsRequired) || 0;
              const enough = points >= cost;
              const restricted = Array.isArray(r.products) && r.products.length > 0;
              return (
                <div
                  key={r._id}
                  className="rounded-lg p-4 border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                  style={{ borderColor: "var(--border-primary)", backgroundColor: "var(--bg-secondary)" }}
                >
                  <div>
                    <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
                      {r.name}
                    </p>
                    <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
                      {describeRule(r)}
                      {restricted ? " · Selected products only" : " · All products"}
                      {Number(r.minOrderSubtotal) > 0 && ` · Min. order ৳${Number(r.minOrderSubtotal).toFixed(2)} after coupon`}
                    </p>
                    {r.description ? (
                      <p className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>
                        {r.description}
                      </p>
                    ) : null}
                    <p className="text-sm font-medium mt-2" style={{ color: "var(--color-primary)" }}>
                      {cost.toLocaleString()} points
                    </p>
                  </div>
                  <div className="flex flex-col items-stretch sm:items-end gap-2">
                    {!enough && (
                      <span className="text-xs" style={{ color: "var(--color-tertiary)" }}>
                        Not enough points
                      </span>
                    )}
                    <button
                      type="button"
                      disabled={!enough || !!pending || redeeming === r._id}
                      onClick={() => handleRedeemLater(r)}
                      className="px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ backgroundColor: "var(--color-primary)" }}
                    >
                      {redeeming === r._id ? "…" : "Redeem for next order"}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default RewardPoints;
