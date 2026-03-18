import { useEffect, useState } from "react";
import { useParams, Link, useLocation } from "react-router";
import { Container } from "../../components";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";
import { fadeInUp } from "../../utils/animations";
import { FiCheckCircle, FiPackage, FiHome, FiDownload } from "react-icons/fi";
import { getMyOrderById, getGuestOrderById } from "../../services/orders.service";
import { downloadOrderInvoice } from "../../utils/orderInvoicePdf";

function normalizeOrderForInvoice(o) {
  if (!o) return null;
  return {
    ...o,
    total: o.amount ?? o.total,
    date: o.createdAt ?? o.date,
  };
}

const OrderSuccess = () => {
  const { orderId } = useParams();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const ordersPath = isAuthenticated ? "/account/orders" : "/my-orders";
  const [order, setOrder] = useState(() => normalizeOrderForInvoice(location.state?.order) || null);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    const passed = location.state?.order;
    if (passed) {
      setOrder(normalizeOrderForInvoice(passed));
      return;
    }
    if (!orderId) return;
    setLoadError(null);
    const req = isAuthenticated ? getMyOrderById(orderId) : getGuestOrderById(orderId);
    req
      .then((res) => {
        if (res.success && res.order) setOrder(normalizeOrderForInvoice(res.order));
        else setLoadError(res.message || "Could not load order");
      })
      .catch(() => setLoadError("Could not load order"));
  }, [orderId, isAuthenticated, location.state]);

  const displayOrderNumber = order?.orderId || orderId || "—";
  const canDownload = order && Array.isArray(order.items) && order.items.length > 0;

  const handleDownloadInvoice = () => {
    if (!order) return;
    downloadOrderInvoice(order, { guest: !isAuthenticated });
  };

  return (
    <div className="min-h-screen py-16 flex items-center">
      <Container>
        <motion.div
          initial="initial"
          animate="animate"
          variants={fadeInUp}
          className="max-w-2xl mx-auto w-full space-y-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="flex justify-center"
          >
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "var(--color-primary)" }}
            >
              <FiCheckCircle size={48} className="text-white" />
            </div>
          </motion.div>

          <div className="space-y-4 text-center w-full">
            <h1 className="text-4xl md:text-5xl font-bold" style={{ color: "var(--color-primary)" }}>
              Order Confirmed!
            </h1>
            <p className="text-xl" style={{ color: "var(--text-secondary)" }}>
              Thank you for your purchase
            </p>
          </div>

          {/* Order number — centered on page */}
          <div className="w-full flex flex-col items-center justify-center py-8 px-4">
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: "var(--text-tertiary)" }}>
              Order number
            </p>
            <p
              className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-center break-all max-w-full"
              style={{ color: "var(--text-primary)" }}
            >
              {displayOrderNumber}
            </p>
          </div>

          {loadError && !order && (
            <p className="text-center text-sm" style={{ color: "var(--text-tertiary)" }}>
              {loadError} — you can still find this order from{" "}
              <Link to={ordersPath} style={{ color: "var(--color-primary)" }} className="font-semibold underline">
                your orders
              </Link>
              .
            </p>
          )}

          {canDownload && (
            <div className="flex justify-center">
              <motion.button
                type="button"
                onClick={handleDownloadInvoice}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg font-semibold uppercase tracking-wider border-2 transition-colors"
                style={{
                  borderColor: "var(--color-primary)",
                  color: "var(--color-primary)",
                  backgroundColor: "var(--bg-primary)",
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FiDownload size={22} />
                Download invoice (PDF)
              </motion.button>
            </div>
          )}

          <div className="space-y-4 pt-4">
            <div
              className="flex items-start space-x-4 p-4 rounded-lg text-left max-w-xl mx-auto"
              style={{ backgroundColor: "var(--bg-secondary)" }}
            >
              <FiPackage size={24} style={{ color: "var(--color-primary)" }} className="flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
                  What&apos;s next?
                </h3>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  You will receive an email confirmation shortly. Your order will be processed and shipped according to
                  the shipping method you chose.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link
                to={ordersPath}
                className="px-8 py-4 border rounded-lg font-semibold uppercase tracking-wider transition-colors text-center"
                style={{
                  borderColor: "var(--border-primary)",
                  color: "var(--text-primary)",
                }}
              >
                {isAuthenticated ? "View orders" : "View my orders (this device)"}
              </Link>
              <Link
                to="/"
                className="px-8 py-4 text-white font-semibold uppercase tracking-wider rounded-lg flex items-center justify-center gap-2"
                style={{ backgroundColor: "var(--color-primary)" }}
              >
                <FiHome size={20} />
                <span>Continue Shopping</span>
              </Link>
            </div>
          </div>
        </motion.div>
      </Container>
    </div>
  );
};

export default OrderSuccess;
