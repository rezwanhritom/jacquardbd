import { useParams, Link } from "react-router";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "../../utils/animations";
import { FiPackage, FiTruck, FiCreditCard, FiMapPin, FiChevronLeft, FiDownload } from "react-icons/fi";
import { mockOrders } from "../../data/accountData";
import { productsData } from "../../data/products";

const OrderDetail = () => {
  const { orderId } = useParams();
  const order = mockOrders.find((o) => o.id === orderId);

  if (!order) {
    return (
      <div className="text-center py-16 space-y-4">
        <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
          Order not found
        </h2>
        <Link
          to="/account/orders"
          className="inline-block px-6 py-3 text-white font-semibold rounded-lg"
          style={{ backgroundColor: "var(--color-primary)" }}
        >
          Back to Orders
        </Link>
      </div>
    );
  }

  const getProduct = (productId) => {
    return productsData.find((p) => p.id === productId);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered":
        return "var(--color-primary)";
      case "Shipped":
        return "var(--color-secondary)";
      case "Processing":
        return "var(--color-tertiary)";
      default:
        return "var(--text-tertiary)";
    }
  };

  const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = order.shippingMethod === "Express Shipping" ? 25 : order.shippingMethod === "Overnight Shipping" ? 50 : 10;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeInUp}
        className="flex items-center justify-between flex-wrap gap-4"
      >
        <div className="flex items-center gap-4">
          <Link
            to="/account/orders"
            className="p-2 rounded-lg transition-colors"
            style={{ color: "var(--text-secondary)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "var(--bg-secondary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <FiChevronLeft size={24} />
          </Link>
          <div>
            <h2 className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
              Order #{order.id}
            </h2>
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
              Placed on {new Date(order.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
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
            {order.status}
          </span>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2 border-2 rounded-lg font-semibold text-sm"
            style={{
              borderColor: "var(--border-primary)",
              color: "var(--text-primary)",
            }}
          >
            <FiDownload size={18} />
            Invoice
          </motion.button>
        </div>
      </motion.div>

      <motion.div
        initial="initial"
        animate="animate"
        variants={staggerContainer}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <motion.div
            variants={fadeInUp}
            className="p-6 rounded-lg space-y-4"
            style={{ backgroundColor: "var(--bg-secondary)" }}
          >
            <div className="flex items-center gap-3 mb-4">
              <FiPackage size={24} style={{ color: "var(--color-primary)" }} />
              <h3 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                Order Items
              </h3>
            </div>
            <div className="space-y-4">
              {order.items.map((item, index) => {
                const product = getProduct(item.productId);
                if (!product) return null;

                return (
                  <motion.div
                    key={item.productId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex gap-4 p-4 rounded-lg"
                    style={{ backgroundColor: "var(--bg-primary)" }}
                  >
                    <Link
                      to={`/product/${product.id}`}
                      className="w-24 h-24 flex-shrink-0 overflow-hidden rounded-lg"
                      style={{ backgroundColor: "var(--bg-tertiary)" }}
                    >
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </Link>
                    <div className="flex-1">
                      <Link
                        to={`/product/${product.id}`}
                        className="font-semibold text-lg mb-1 block hover:underline transition-colors"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {product.name}
                      </Link>
                      <div className="text-sm space-y-1" style={{ color: "var(--text-secondary)" }}>
                        <p>Size: {item.size} | Color: {item.color}</p>
                        <p>Quantity: {item.quantity}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold" style={{ color: "var(--color-primary)" }}>
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                      <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                        ${item.price.toFixed(2)} each
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Shipping Information */}
          <motion.div
            variants={fadeInUp}
            className="p-6 rounded-lg space-y-4"
            style={{ backgroundColor: "var(--bg-secondary)" }}
          >
            <div className="flex items-center gap-3 mb-4">
              <FiTruck size={24} style={{ color: "var(--color-primary)" }} />
              <h3 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                Shipping Information
              </h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
                  Shipping Method
                </p>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  {order.shippingMethod}
                </p>
              </div>
              {order.trackingNumber && (
                <div>
                  <p className="text-sm font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
                    Tracking Number
                  </p>
                  <p className="text-sm font-mono" style={{ color: "var(--color-primary)" }}>
                    {order.trackingNumber}
                  </p>
                </div>
              )}
              {order.estimatedDelivery && (
                <div>
                  <p className="text-sm font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
                    {order.status === "Delivered" ? "Delivered On" : "Estimated Delivery"}
                  </p>
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                    {new Date(order.deliveredDate || order.estimatedDelivery).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Shipping Address */}
          <motion.div
            variants={fadeInUp}
            className="p-6 rounded-lg space-y-4"
            style={{ backgroundColor: "var(--bg-secondary)" }}
          >
            <div className="flex items-center gap-3 mb-4">
              <FiMapPin size={24} style={{ color: "var(--color-primary)" }} />
              <h3 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                Shipping Address
              </h3>
            </div>
            <div className="space-y-1 text-sm" style={{ color: "var(--text-secondary)" }}>
              <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
                {order.shippingAddress.firstName} {order.shippingAddress.lastName}
              </p>
              <p>{order.shippingAddress.address}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
              <p>{order.shippingAddress.country}</p>
              <p className="pt-2">{order.shippingAddress.phone}</p>
            </div>
          </motion.div>

          {/* Payment Information */}
          <motion.div
            variants={fadeInUp}
            className="p-6 rounded-lg space-y-4"
            style={{ backgroundColor: "var(--bg-secondary)" }}
          >
            <div className="flex items-center gap-3 mb-4">
              <FiCreditCard size={24} style={{ color: "var(--color-primary)" }} />
              <h3 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                Payment Information
              </h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  Payment Method
                </span>
                <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                  {order.paymentMethod}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  Payment Status
                </span>
                <span className="text-sm font-semibold" style={{ color: "var(--color-primary)" }}>
                  Paid
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <motion.div
            variants={fadeInUp}
            className="sticky top-24 p-6 rounded-lg space-y-4"
            style={{ backgroundColor: "var(--bg-secondary)" }}
          >
            <h3 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
              Order Summary
            </h3>
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
            {order.status !== "Delivered" && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full mt-6 px-6 py-3 border-2 rounded-lg font-semibold"
                style={{
                  borderColor: "var(--border-primary)",
                  color: "var(--text-primary)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--color-primary)";
                  e.currentTarget.style.backgroundColor = "var(--color-primary)";
                  e.currentTarget.style.color = "white";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border-primary)";
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "var(--text-primary)";
                }}
              >
                Track Order
              </motion.button>
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default OrderDetail;
