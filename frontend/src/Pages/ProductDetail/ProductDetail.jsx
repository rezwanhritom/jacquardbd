import { useParams, Link } from "react-router";
import { Container } from "../../components";
import { productsData } from "../../data/products";
import { motion } from "framer-motion";
import { fadeInUp } from "../../utils/animations";
import { FiShoppingBag, FiHeart, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { useState } from "react";

const ProductDetail = () => {
  const { productId } = useParams();
  const product = productsData.find((p) => p.id === parseInt(productId));
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return (
      <div className="min-h-[60vh] py-16">
        <Container>
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold" style={{ color: "var(--color-primary)" }}>
              Product not found
            </h1>
            <Link
              to="/"
              className="inline-block px-6 py-3 text-white"
              style={{ backgroundColor: "var(--color-primary)" }}
            >
              Back to Home
            </Link>
          </div>
        </Container>
      </div>
    );
  }

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  return (
    <div className="min-h-screen py-16">
      <Container>
        <motion.div
          initial="initial"
          animate="animate"
          variants={fadeInUp}
          className="mb-6"
        >
          <Link
            to="/"
            className="inline-flex items-center space-x-2 text-sm"
            style={{ color: "var(--text-secondary)" }}
          >
            <FiChevronLeft />
            <span>Back to Home</span>
          </Link>
        </motion.div>

        <motion.div
          initial="initial"
          animate="animate"
          variants={fadeInUp}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12"
        >
          {/* Image Gallery */}
          <div className="relative">
            <div className="relative aspect-square overflow-hidden rounded-lg" style={{ backgroundColor: "var(--bg-tertiary)" }}>
              <img
                src={product.images[selectedImageIndex]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {product.badge && (
                <span
                  className="absolute top-4 left-4 px-3 py-1 text-xs font-semibold uppercase text-white"
                  style={{ backgroundColor: "var(--color-primary)" }}
                >
                  {product.badge}
                </span>
              )}
              {product.discount && (
                <span
                  className="absolute top-4 right-4 px-3 py-1 text-xs font-semibold uppercase text-white rounded-full"
                  style={{ backgroundColor: "var(--color-tertiary)" }}
                >
                  -{product.discount}%
                </span>
              )}
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white transition-colors"
              >
                <FiChevronLeft size={20} />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white transition-colors"
              >
                <FiChevronRight size={20} />
              </button>
            </div>
            <div className="flex space-x-2 mt-4 overflow-x-auto">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded overflow-hidden border-2 ${
                    index === selectedImageIndex ? "border-opacity-100" : "border-opacity-0"
                  }`}
                  style={{
                    borderColor: index === selectedImageIndex ? "var(--color-primary)" : "transparent",
                  }}
                >
                  <img src={image} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <p className="text-sm uppercase tracking-wider mb-2" style={{ color: "var(--text-tertiary)" }}>
                {product.category}
              </p>
              <h1 className="text-4xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>
                {product.name}
              </h1>
              <div className="flex items-center space-x-4 mb-6">
                <span className="text-3xl font-bold" style={{ color: "var(--color-primary)" }}>
                  ${product.price.toFixed(2)}
                </span>
                {product.originalPrice && (
                  <>
                    <span className="text-xl line-through" style={{ color: "var(--text-tertiary)" }}>
                      ${product.originalPrice.toFixed(2)}
                    </span>
                    <span className="px-3 py-1 text-sm font-semibold text-white rounded" style={{ backgroundColor: "var(--color-tertiary)" }}>
                      Save ${(product.originalPrice - product.price).toFixed(2)}
                    </span>
                  </>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                Quantity
              </label>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center border rounded"
                  style={{ borderColor: "var(--border-primary)" }}
                >
                  -
                </button>
                <span className="text-lg font-semibold w-12 text-center" style={{ color: "var(--text-primary)" }}>
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 flex items-center justify-center border rounded"
                  style={{ borderColor: "var(--border-primary)" }}
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex space-x-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 px-8 py-4 text-white font-semibold uppercase tracking-wider flex items-center justify-center space-x-2"
                style={{ backgroundColor: "var(--color-primary)" }}
              >
                <FiShoppingBag size={20} />
                <span>Add to Cart</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 border rounded flex items-center justify-center"
                style={{ borderColor: "var(--border-primary)" }}
              >
                <FiHeart size={20} style={{ color: "var(--text-primary)" }} />
              </motion.button>
            </div>

            <div className="pt-6 border-t" style={{ borderColor: "var(--border-primary)" }}>
              <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
                Product Details
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                {product.description || `Premium quality ${product.name.toLowerCase()} from our ${product.category} collection. Crafted with attention to detail and designed for comfort and style. Perfect addition to your wardrobe.`}
              </p>
            </div>
          </div>
        </motion.div>
      </Container>
    </div>
  );
};

export default ProductDetail;
