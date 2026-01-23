import { useState } from "react";
import { useParams, Link } from "react-router";
import { Container, ImageGallery, ProductVariants, ProductReviews, ProductCarousel } from "../../components";
import { productsData } from "../../data/products";
import { getReviewsForProduct, getAverageRating } from "../../data/reviews";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "../../utils/animations";
import { FiShoppingBag, FiHeart, FiChevronLeft, FiShare2, FiCheck, FiStar } from "react-icons/fi";
import toast from "react-hot-toast";

const ProductDetail = () => {
  const { productId } = useParams();
  const product = productsData.find((p) => p.id === parseInt(productId));
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const reviews = getReviewsForProduct(parseInt(productId));
  const averageRating = parseFloat(getAverageRating(parseInt(productId)));

  // Get related products (same category, exclude current product)
  const relatedProducts = productsData
    .filter((p) => p.category === product?.category && p.id !== product?.id)
    .slice(0, 8);

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
              className="inline-block px-6 py-3 text-white rounded-lg"
              style={{ backgroundColor: "var(--color-primary)" }}
            >
              Back to Home
            </Link>
          </div>
        </Container>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error("Please select a size");
      return;
    }
    setAddedToCart(true);
    toast.success(`${quantity} ${product.name} added to cart!`);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleAddToWishlist = () => {
    setIsInWishlist(!isInWishlist);
    toast.success(isInWishlist ? "Removed from wishlist" : "Added to wishlist!");
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href,
      }).catch(() => {
        // Fallback if share fails
        navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard!");
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen py-16">
      <Container>
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerContainer}
          className="space-y-12"
        >
          {/* Breadcrumb */}
          <motion.div variants={fadeInUp}>
            <Link
              to="/"
              className="inline-flex items-center space-x-2 text-sm transition-colors"
              style={{ color: "var(--text-secondary)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--color-primary)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--text-secondary)";
              }}
            >
              <FiChevronLeft />
              <span>Back to Home</span>
            </Link>
          </motion.div>

          {/* Main Product Section */}
          <motion.div
            variants={fadeInUp}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12"
          >
            {/* Image Gallery */}
            <div>
              <ImageGallery images={product.images} productName={product.name} />
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {/* Category & Rating */}
              <div>
                <p className="text-sm uppercase tracking-wider mb-2" style={{ color: "var(--text-tertiary)" }}>
                  {product.category}
                </p>
                <div className="flex items-center gap-4 mb-3">
                  <h1 className="text-4xl md:text-5xl font-bold" style={{ color: "var(--text-primary)" }}>
                    {product.name}
                  </h1>
                  {averageRating > 0 && (
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <FiStar
                          key={i}
                          size={18}
                          className={i < Math.round(averageRating) ? "fill-current" : ""}
                          style={{
                            color: i < Math.round(averageRating) ? "var(--color-tertiary)" : "var(--text-tertiary)",
                          }}
                        />
                      ))}
                      <span className="text-sm ml-1" style={{ color: "var(--text-secondary)" }}>
                        ({reviews.length})
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Price */}
              <div className="flex items-center gap-4">
                <span className="text-4xl font-bold" style={{ color: "var(--color-primary)" }}>
                  ${product.price.toFixed(2)}
                </span>
                {product.originalPrice && (
                  <>
                    <span className="text-2xl line-through" style={{ color: "var(--text-tertiary)" }}>
                      ${product.originalPrice.toFixed(2)}
                    </span>
                    <span className="px-4 py-2 text-sm font-semibold text-white rounded-lg" style={{ backgroundColor: "var(--color-tertiary)" }}>
                      Save ${(product.originalPrice - product.price).toFixed(2)}
                    </span>
                  </>
                )}
              </div>

              {/* Variants */}
              <ProductVariants
                selectedSize={selectedSize}
                selectedColor={selectedColor}
                onSizeChange={setSelectedSize}
                onColorChange={setSelectedColor}
              />

              {/* Quantity */}
              <div>
                <label className="block text-sm font-semibold mb-3 uppercase tracking-wider" style={{ color: "var(--text-primary)" }}>
                  Quantity
                </label>
                <div className="flex items-center gap-4">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 flex items-center justify-center border-2 rounded-lg transition-colors"
                    style={{ borderColor: "var(--border-primary)" }}
                  >
                    <span style={{ color: "var(--text-primary)" }}>-</span>
                  </motion.button>
                  <span className="text-xl font-semibold w-16 text-center" style={{ color: "var(--text-primary)" }}>
                    {quantity}
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-12 h-12 flex items-center justify-center border-2 rounded-lg transition-colors"
                    style={{ borderColor: "var(--border-primary)" }}
                  >
                    <span style={{ color: "var(--text-primary)" }}>+</span>
                  </motion.button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddToCart}
                  className={`flex-1 px-8 py-4 text-white font-semibold uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 transition-all ${
                    addedToCart ? "bg-green-600" : ""
                  }`}
                  style={{
                    backgroundColor: addedToCart ? undefined : "var(--color-primary)",
                  }}
                  onMouseEnter={(e) => {
                    if (!addedToCart) {
                      e.currentTarget.style.backgroundColor = "var(--active-color)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!addedToCart) {
                      e.currentTarget.style.backgroundColor = "var(--color-primary)";
                    }
                  }}
                >
                  {addedToCart ? (
                    <>
                      <FiCheck size={20} />
                      <span>Added to Cart</span>
                    </>
                  ) : (
                    <>
                      <FiShoppingBag size={20} />
                      <span>Add to Cart</span>
                    </>
                  )}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleAddToWishlist}
                  className={`px-8 py-4 border-2 rounded-lg flex items-center justify-center transition-colors ${
                    isInWishlist ? "border-red-500" : ""
                  }`}
                  style={{
                    borderColor: isInWishlist ? undefined : "var(--border-primary)",
                    color: isInWishlist ? "red" : "var(--text-primary)",
                  }}
                >
                  <FiHeart size={20} className={isInWishlist ? "fill-current" : ""} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleShare}
                  className="px-8 py-4 border-2 rounded-lg flex items-center justify-center"
                  style={{
                    borderColor: "var(--border-primary)",
                    color: "var(--text-primary)",
                  }}
                >
                  <FiShare2 size={20} />
                </motion.button>
              </div>

              {/* Product Details */}
              <div className="pt-6 border-t space-y-4" style={{ borderColor: "var(--border-primary)" }}>
                <h3 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
                  Product Details
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {product.description || `Premium quality ${product.name.toLowerCase()} from our ${product.category} collection. Crafted with attention to detail and designed for comfort and style. Perfect addition to your wardrobe.`}
                </p>
                <div className="space-y-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                  <p>• Premium quality materials</p>
                  <p>• Free shipping on orders over $100</p>
                  <p>• 30-day return policy</p>
                  <p>• Care instructions included</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Reviews Section */}
          {reviews.length > 0 && (
            <ProductReviews
              productId={parseInt(productId)}
              reviews={reviews}
              averageRating={averageRating}
            />
          )}

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="pt-12 border-t" style={{ borderColor: "var(--border-primary)" }}>
              <ProductCarousel
                title="You May Also Like"
                subtitle="Related products from the same collection"
                products={relatedProducts}
                showViewAll={false}
              />
            </div>
          )}
        </motion.div>
      </Container>
    </div>
  );
};

export default ProductDetail;
