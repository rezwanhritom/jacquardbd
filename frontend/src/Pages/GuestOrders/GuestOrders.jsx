import { useEffect, useState } from "react";
import { Link } from "react-router";
import { motion } from "framer-motion";
import { Container } from "../../components";
import { fadeInUp, staggerContainer } from "../../utils/animations";
import { FiPackage, FiEye } from "react-icons/fi";
import { getGuestOrders } from "../../services/orders.service";
import { EmptyState } from "../../components";
import { useCookieConsent } from "../../context/CookieConsentContext";

function getStatusColor(status) {
  switch (status) {
    case "paid":
    case "delivered":
      return "var(--color-primary)";
    case "confirmed":
    case "shipped":
      return "var(--color-secondary)";
    case "pending":
      return "var(--color-tertiary)";
    case "cancelled":
    case "failed":
      return "var(--text-tertiary)";
    default:
      return "var(--text-tertiary)";
  }
}

function formatStatus(status) {
  if (!status) return "—";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

const GuestOrders = () => {
  const { decided, shoppingAllowed } = useCookieConsent();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!decided || !shoppingAllowed) {
      setLoading(false);
      setOrders([]);
      return;
    }
    getGuestOrders()
      .then((res) => {
        if (res.success) setOrders(res.orders);
        else setError(res.message);
      })
      .catch(() => setError("Failed to load orders"))
      .finally(() => setLoading(false));
  }, [decided, shoppingAllowed]);

  if (!decided) {
    return (
      <div className="min-h-screen py-16">
        <Container>
          <p style={{ color: "var(--text-secondary)" }}>Loading…</p>
        </Container>
      </div>
    );
  }

  if (!shoppingAllowed) {
    return (
      <div className="min-h-screen py-16">
        <Container>
          <div className="max-w-xl mx-auto text-center space-y-4 p-6 rounded-xl" style={{ backgroundColor: "var(--bg-secondary)" }}>
            <p style={{ color: "var(--text-primary)" }}>
              Enable <strong>shopping & cart</strong> cookies to view guest orders on this device.
            </p>
            <Link
              to="/"
              className="inline-block px-6 py-3 rounded-lg font-semibold text-white"
              style={{ backgroundColor: "var(--color-primary)" }}
            >
              Back to home
            </Link>
          </div>
        </Container>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen py-16">
        <Container>
          <p style={{ color: "var(--text-secondary)" }}>Loading orders…</p>
        </Container>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen py-16">
        <Container>
          <p style={{ color: "var(--text-secondary)" }}>{error}</p>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16">
      <Container>
        <motion.div initial="initial" animate="animate" variants={staggerContainer} className="max-w-3xl mx-auto space-y-6">
          <motion.div variants={fadeInUp} className="space-y-2">
            <div className="flex items-center gap-3">
              <FiPackage size={28} style={{ color: "var(--color-primary)" }} />
              <h1 className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
                My orders (guest)
              </h1>
            </div>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Orders placed on this browser without an account. Clearing cookies or using another device may hide them.
            </p>
          </motion.div>

          {orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((order, index) => (
                <motion.div
                  key={order._id}
                  variants={fadeInUp}
                  className="p-6 rounded-lg space-y-4"
                  style={{ backgroundColor: "var(--bg-secondary)" }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                        {order.orderId}
                      </h3>
                      <span
                        className="inline-block mt-2 px-3 py-1 text-xs font-semibold uppercase rounded-lg"
                        style={{
                          backgroundColor: getStatusColor(order.status) + "20",
                          color: getStatusColor(order.status),
                        }}
                      >
                        {formatStatus(order.status)}
                      </span>
                      <p className="text-sm mt-2" style={{ color: "var(--text-secondary)" }}>
                        {new Date(order.date).toLocaleDateString()}
                      </p>
                      <p className="text-xl font-bold mt-2" style={{ color: "var(--color-primary)" }}>
                        ৳{Number(order.total).toFixed(2)}
                      </p>
                    </div>
                    <Link
                      to={`/my-orders/${order._id}`}
                      className="flex items-center justify-center gap-2 px-4 py-2 border-2 rounded-lg font-semibold text-sm shrink-0"
                      style={{ borderColor: "var(--color-primary)", color: "var(--color-primary)" }}
                    >
                      <FiEye size={16} />
                      View details
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={FiPackage}
              title="No guest orders yet"
              description="Place an order without signing in — they will appear here on this device."
              actionLabel="Start shopping"
              actionPath="/"
            />
          )}
        </motion.div>
      </Container>
    </div>
  );
};

export default GuestOrders;
