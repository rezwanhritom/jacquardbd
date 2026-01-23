import { useParams } from "react-router";
import { Container } from "../../components";
import { productsData } from "../../data/products";
import { categoriesData } from "../../data/categories";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "../../utils/animations";
import { FiShoppingBag } from "react-icons/fi";

const Category = () => {
  const { categoryName } = useParams();
  const normalizedCategoryName = categoryName?.toLowerCase();
  const category = categoriesData.find(
    (cat) => {
      const normalized = cat.name.toLowerCase().replace(/\s+/g, "-").replace("'s", "").replace("'", "");
      return normalized === normalizedCategoryName || 
             normalized.includes(normalizedCategoryName) ||
             normalizedCategoryName?.includes(normalized.replace(/-/g, ""));
    }
  );
  const categoryProducts = productsData.filter(
    (product) => {
      const productCategory = product.category.toLowerCase();
      const normalizedCat = category?.name.toLowerCase().replace("'s collection", "").replace("'s", "").trim();
      return productCategory === normalizedCat || 
             productCategory.includes(normalizedCategoryName) ||
             (normalizedCategoryName === "men" && productCategory === "men") ||
             (normalizedCategoryName === "women" && productCategory === "women") ||
             (normalizedCategoryName === "accessories" && productCategory === "accessories") ||
             (normalizedCategoryName === "footwear" && productCategory === "footwear");
    }
  );

  if (!category) {
    return (
      <div className="min-h-[60vh] py-16">
        <Container>
          <h1 className="text-4xl font-bold" style={{ color: "var(--color-primary)" }}>
            Category not found
          </h1>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16">
      <Container>
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerContainer}
          className="space-y-8"
        >
          <motion.div variants={fadeInUp} className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold" style={{ color: "var(--color-primary)" }}>
              {category.name}
            </h1>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: "var(--text-secondary)" }}>
              {category.description}
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {categoryProducts.length > 0 ? (
              categoryProducts.map((product) => (
                <motion.div
                  key={product.id}
                  variants={fadeInUp}
                  className="group cursor-pointer"
                  style={{ backgroundColor: "var(--bg-primary)" }}
                >
                  <div className="relative overflow-hidden aspect-[3/4] mb-4" style={{ backgroundColor: "var(--bg-tertiary)" }}>
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {product.badge && (
                      <span
                        className="absolute top-4 left-4 px-3 py-1 text-xs font-semibold uppercase text-white"
                        style={{ backgroundColor: "var(--color-primary)" }}
                      >
                        {product.badge}
                      </span>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-3 rounded-full text-white"
                        style={{ backgroundColor: "var(--color-primary)" }}
                      >
                        <FiShoppingBag size={20} />
                      </motion.button>
                    </div>
                  </div>
                  <div className="p-4 space-y-2">
                    <p className="text-xs uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
                      {product.category}
                    </p>
                    <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>
                      {product.name}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold" style={{ color: "var(--color-primary)" }}>
                        ${product.price.toFixed(2)}
                      </span>
                      {product.originalPrice && (
                        <span className="text-sm line-through" style={{ color: "var(--text-tertiary)" }}>
                          ${product.originalPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p style={{ color: "var(--text-secondary)" }}>No products found in this category.</p>
              </div>
            )}
          </motion.div>
        </motion.div>
      </Container>
    </div>
  );
};

export default Category;
