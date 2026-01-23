import { Container } from "../../components";
import { productsData } from "../../data/products";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "../../utils/animations";
import { FiEdit, FiTrash2, FiPlus } from "react-icons/fi";

const Products = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
          Products
        </h2>
        <button
          className="px-6 py-3 text-white font-semibold uppercase tracking-wider rounded-lg flex items-center space-x-2"
          style={{ backgroundColor: "var(--color-primary)" }}
        >
          <FiPlus size={20} />
          <span>Add Product</span>
        </button>
      </div>

      <motion.div
        initial="initial"
        animate="animate"
        variants={staggerContainer}
        className="space-y-4"
      >
        {productsData.map((product) => (
          <motion.div
            key={product.id}
            variants={fadeInUp}
            className="flex items-center justify-between p-6 rounded-lg"
            style={{ backgroundColor: "var(--bg-secondary)" }}
          >
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 overflow-hidden rounded" style={{ backgroundColor: "var(--bg-tertiary)" }}>
                <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>
                  {product.name}
                </h3>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  {product.category} • ${product.price.toFixed(2)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                className="p-2 rounded-lg transition-colors"
                style={{ backgroundColor: "var(--bg-primary)", color: "var(--color-primary)" }}
              >
                <FiEdit size={20} />
              </button>
              <button
                className="p-2 rounded-lg transition-colors"
                style={{ backgroundColor: "var(--bg-primary)", color: "var(--color-tertiary)" }}
              >
                <FiTrash2 size={20} />
              </button>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default Products;
