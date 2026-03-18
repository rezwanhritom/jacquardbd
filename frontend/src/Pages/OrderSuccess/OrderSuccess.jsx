import { useParams, Link } from "react-router";
import { Container } from "../../components";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";
import { fadeInUp } from "../../utils/animations";
import { FiCheckCircle, FiPackage, FiHome } from "react-icons/fi";

const OrderSuccess = () => {
  const { orderId } = useParams();
  const { isAuthenticated } = useAuth();
  const ordersPath = isAuthenticated ? "/account/orders" : "/my-orders";

  return (
    <div className="min-h-screen py-16 flex items-center">
      <Container>
        <motion.div
          initial="initial"
          animate="animate"
          variants={fadeInUp}
          className="max-w-2xl mx-auto text-center space-y-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="flex justify-center"
          >
            <div className="w-24 h-24 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--color-primary)" }}>
              <FiCheckCircle size={48} className="text-white" />
            </div>
          </motion.div>

          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold" style={{ color: "var(--color-primary)" }}>
              Order Confirmed!
            </h1>
            <p className="text-xl" style={{ color: "var(--text-secondary)" }}>
              Thank you for your purchase
            </p>
            <div className="p-6 rounded-lg" style={{ backgroundColor: "var(--bg-secondary)" }}>
              <p className="text-sm mb-2" style={{ color: "var(--text-tertiary)" }}>
                Order Number
              </p>
              <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                {orderId}
              </p>
            </div>
          </div>

          <div className="space-y-4 pt-8">
            <div className="flex items-start space-x-4 p-4 rounded-lg text-left" style={{ backgroundColor: "var(--bg-secondary)" }}>
              <FiPackage size={24} style={{ color: "var(--color-primary)" }} className="flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
                  What's Next?
                </h3>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  You will receive an email confirmation shortly. Your order will be processed and shipped within 2-3 business days.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to={ordersPath}
                className="px-8 py-4 border rounded-lg font-semibold uppercase tracking-wider transition-colors"
                style={{
                  borderColor: "var(--border-primary)",
                  color: "var(--text-primary)",
                }}
              >
                {isAuthenticated ? "View orders" : "View my orders (this device)"}
              </Link>
              <Link
                to="/"
                className="px-8 py-4 text-white font-semibold uppercase tracking-wider rounded-lg flex items-center justify-center space-x-2"
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
