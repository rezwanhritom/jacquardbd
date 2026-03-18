import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import { motion } from "framer-motion";
import { Container } from "../../components";
import { downloadOrderInvoice } from "../../utils/orderInvoicePdf";
import { fadeInUp, staggerContainer } from "../../utils/animations";
import { FiPackage, FiCreditCard, FiMapPin, FiChevronLeft, FiDownload } from "react-icons/fi";
import { getGuestOrderById } from "../../services/orders.service";
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

function getPaymentStatusDisplay(order) {
  const ps =
    order.paymentStatus ||
    (order.status === "paid" ? "paid" : order.status === "cancelled" ? "cancelled" : "pending");
  return formatStatus(ps);
}

const GuestOrderDetail = () => {
  const { orderId } = useParams();
  const { decided, shoppingAllowed } = useCookieConsent();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!orderId || !decided || !shoppingAllowed) {
      setLoading(false);
      return;
    }
    getGuestOrderById(orderId)
      .then((res) => {
        if (res.success) setOrder(res.order);
        else setError(res.message || "Order not found");
      })
      .catch(() => setError("Failed to load order"))
      .finally(() => setLoading(false));
  }, [orderId, decided, shoppingAllowed]);

  if (!shoppingAllowed && decided) {
    return (
      <div className="min-h-screen py-16">
        <Container>
          <p style={{ color: "var(--text-secondary)" }}>Shopping cookies are required to view this order.</p>
          <Link to="/my-orders" className="inline-block mt-4 text-sm font-semibold" style={{ color: "var(--color-primary)" }}>
            Back to guest orders
          </Link>
        </Container>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen py-16 flex justify-center" style={{ color: "var(--text-secondary)" }}>
        Loading order…
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen py-16">
        <Container>
          <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            {error || "Order not found"}
          </h2>
          <Link
            to="/my-orders"
            className="inline-block px-6 py-3 text-white font-semibold rounded-lg"
            style={{ backgroundColor: "var(--color-primary)" }}
          >
            Back to orders
          </Link>
          </div>
        </Container>
      </div>
    );
  }

  const addr = order.shippingAddress || {};
  const items = order.items || [];

  return (
    <div className="min-h-screen py-16">
      <Container>
        <div className="max-w-5xl mx-auto space-y-6">
          <motion.div variants={fadeInUp} initial="initial" animate="animate" className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link to="/my-orders" className="p-2 rounded-lg" style={{ color: "var(--text-secondary)" }}>
                <FiChevronLeft size={24} />
              </Link>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
                  {order.orderId}
                </h1>
                <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
                  Guest order · {new Date(order.date).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span
                className="px-4 py-2 text-sm font-semibold uppercase rounded-lg"
                style={{
                  backgroundColor: getStatusColor(order.status) + "20",
                  color: getStatusColor(order.status),
                }}
              >
                {formatStatus(order.status)}
              </span>
              <motion.button
                type="button"
                onClick={() =>
                  downloadOrderInvoice({ ...order, total: order.total ?? order.amount }, { guest: true })
                }
                className="flex items-center gap-2 px-4 py-2 border-2 rounded-lg font-semibold text-sm"
                style={{ borderColor: "var(--border-primary)", color: "var(--text-primary)" }}
              >
                <FiDownload size={18} />
                Invoice
              </motion.button>
            </div>
          </motion.div>

          <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <motion.div variants={fadeInUp} className="p-6 rounded-lg" style={{ backgroundColor: "var(--bg-secondary)" }}>
                <div className="flex items-center gap-3 mb-4">
                  <FiPackage size={24} style={{ color: "var(--color-primary)" }} />
                  <h3 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                    Items
                  </h3>
                </div>
                <div className="space-y-3">
                  {items.map((item, index) => (
                    <div key={index} className="flex justify-between gap-4 p-4 rounded-lg" style={{ backgroundColor: "var(--bg-primary)" }}>
                      <div>
                        <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
                          {item.name}
                        </p>
                        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                          Qty {item.quantity}
                        </p>
                      </div>
                      <p className="font-bold" style={{ color: "var(--color-primary)" }}>
                        ৳{((item.price ?? 0) * (item.quantity ?? 0)).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
              {(addr.address || addr.name) && (
                <motion.div variants={fadeInUp} className="p-6 rounded-lg" style={{ backgroundColor: "var(--bg-secondary)" }}>
                  <div className="flex items-center gap-3 mb-4">
                    <FiMapPin size={24} style={{ color: "var(--color-primary)" }} />
                    <h3 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                      Shipping
                    </h3>
                  </div>
                  <div className="text-sm space-y-1" style={{ color: "var(--text-secondary)" }}>
                    {addr.name && <p className="font-semibold" style={{ color: "var(--text-primary)" }}>{addr.name}</p>}
                    {addr.address && <p>{addr.address}</p>}
                    <p>{[addr.city, addr.state, addr.zip].filter(Boolean).join(", ")}</p>
                    {addr.phone && <p>{addr.phone}</p>}
                  </div>
                </motion.div>
              )}
              <motion.div variants={fadeInUp} className="p-6 rounded-lg" style={{ backgroundColor: "var(--bg-secondary)" }}>
                <div className="flex items-center gap-3 mb-2">
                  <FiCreditCard size={24} style={{ color: "var(--color-primary)" }} />
                  <h3 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                    Payment
                  </h3>
                </div>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  {getPaymentStatusDisplay(order)}
                </p>
              </motion.div>
            </div>
            <motion.div variants={fadeInUp} className="p-6 rounded-lg h-fit lg:sticky lg:top-24" style={{ backgroundColor: "var(--bg-secondary)" }}>
              <h3 className="text-xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>
                Order summary
              </h3>
              {order.couponCode && Number(order.couponDiscount) > 0 && (
                <div className="space-y-1 text-sm mb-3 pb-3 border-b" style={{ borderColor: "var(--border-primary)" }}>
                  <div className="flex justify-between">
                    <span style={{ color: "var(--text-secondary)" }}>Coupon</span>
                    <span className="font-mono font-semibold" style={{ color: "var(--color-primary)" }}>
                      {order.couponCode}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: "var(--text-secondary)" }}>Discount</span>
                    <span style={{ color: "var(--color-primary)" }}>−৳{Number(order.couponDiscount).toFixed(2)}</span>
                  </div>
                </div>
              )}
              <p className="text-sm mb-1" style={{ color: "var(--text-secondary)" }}>Total</p>
              <p className="text-2xl font-bold" style={{ color: "var(--color-primary)" }}>
                ৳{Number(order.total).toFixed(2)}
              </p>
            </motion.div>
          </motion.div>
        </div>
      </Container>
    </div>
  );
};

export default GuestOrderDetail;
