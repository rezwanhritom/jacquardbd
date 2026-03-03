import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { Container, ImageGallery, ProductVariants, ProductReviews, ProductCarousel, Loading } from "../../components";
import { productsData } from "../../data/products";
import { getReviewsForProduct, getAverageRating } from "../../data/reviews";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "../../utils/animations";
import { FiShoppingBag, FiHeart, FiChevronLeft, FiShare2, FiCheck, FiStar, FiChevronDown } from "react-icons/fi";
import toast from "react-hot-toast";
import { getProduct, getProductsByGender } from "../../services/productApi";
import { getDisplayCategory, hasDiscount } from "../../utils/productUtils";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";

const mapApiProductForDetail = (p) => ({
  ...p,
  id: p._id || p.id,
  images: Array.isArray(p.images) && p.images.length > 0 ? p.images : ["/images/product-placeholder.png"],
  name: p.name || "",
  category: p.category || "",
  price: p.finalPrice ?? p.price ?? 0,
  originalPrice: p.originalPrice ?? null,
  discount: p.discount ?? 0,
  finalPrice: p.finalPrice ?? p.price ?? 0,
  description: p.description || "",
  slug: p.slug || "",
  tags: p.tags || [],
  attributes: p.attributes || {},
  variantMatrix: p.variantMatrix || [],
  variants: p.variants || { size: [], color: [] },
  stockQuantity: p.stockQuantity ?? 0,
});

const mapApiProductForCard = (p) => ({
  ...p,
  id: p._id || p.id,
  images: Array.isArray(p.images) && p.images.length > 0 ? p.images : ["/images/product-placeholder.png"],
  name: p.name || "",
  price: p.finalPrice ?? p.price ?? 0,
  originalPrice: p.originalPrice ?? null,
  discount: p.discount ?? 0,
  badge: p.badge || (Array.isArray(p.tags) && p.tags[0]) || undefined,
  slug: p.slug || "",
});

const ProductDetail = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const { isInWishlist: isInWishlistContext, addToWishlist, removeFromWishlist } = useWishlist();
  const { addToCart, isInCart } = useCart();
  const isInWishlist = product ? isInWishlistContext(product) : false;
  const addedToCart = product ? isInCart(product) : false;
  const [specsOpen, setSpecsOpen] = useState(false);
  const [specCompositionOpen, setSpecCompositionOpen] = useState(false);
  const [specSizeFitOpen, setSpecSizeFitOpen] = useState(false);
  const [specCareOpen, setSpecCareOpen] = useState(false);
  const [specTraceabilityOpen, setSpecTraceabilityOpen] = useState(false);

  const isNumericId = /^\d+$/.test(productId);
  const fromApi = !isNumericId;

  useEffect(() => {
    if (!productId) {
      setLoading(false);
      setProduct(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    if (fromApi) {
      getProduct(productId)
        .then((res) => {
          if (cancelled) return;
          setLoading(false);
          if (res.success && res.product) {
            setProduct(mapApiProductForDetail(res.product));
            const gender = res.product.categoryPath?.[0];
            if (gender === "Male" || gender === "Female") {
              getProductsByGender(gender === "Male" ? "men" : "women").then((r) => {
                if (cancelled || !r.success) return;
                const others = (r.products || [])
                  .filter((p) => (p.slug || p._id) !== res.product.slug)
                  .slice(0, 8)
                  .map(mapApiProductForCard);
                setRelatedProducts(others);
              });
            }
          } else {
            setProduct(null);
            setError(res.message);
          }
        })
        .catch((err) => {
          if (cancelled) return;
          setLoading(false);
          setProduct(null);
          setError(err?.message || "Failed to load product");
        });
    } else {
      const found = productsData.find((p) => p.id === parseInt(productId, 10));
      setProduct(found || null);
      setLoading(false);
      if (found) {
        const related = productsData
          .filter((p) => p.category === found.category && p.id !== found.id)
          .slice(0, 8);
        setRelatedProducts(related);
      }
    }
    return () => { cancelled = true; };
  }, [productId, fromApi]);

  const reviews = isNumericId ? getReviewsForProduct(parseInt(productId, 10)) : [];
  const averageRating = isNumericId ? parseFloat(getAverageRating(parseInt(productId, 10))) : 0;

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center py-16">
        <Loading />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] py-16">
        <Container>
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold" style={{ color: "var(--color-primary)" }}>
              Product not found
            </h1>
            {error && (
              <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
                {error}
              </p>
            )}
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

  const handleAddToCart = async () => {
    if (!product) return;
    const hasSizes = product.variants?.size?.length > 0 || product.variantMatrix?.some((v) => v.size);
    if (hasSizes && !selectedSize) {
      toast.error("Please select a size");
      return;
    }
    const result = await addToCart(product, quantity);
    if (result.success) toast.success(result.message || `${product.name} added to cart!`);
    else if (result.message) toast.error(result.message);
  };

  const handleAddToWishlist = async () => {
    if (!product) return;
    if (isInWishlist) {
      const { success } = await removeFromWishlist(product);
      if (success) toast.success("Removed from wishlist");
    } else {
      const { success, message } = await addToWishlist(product);
      if (success) toast.success(message === "Already in wishlist" ? message : "Added to wishlist!");
      else if (message) toast.error(message);
    }
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
                <p className="text-sm font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-tertiary)" }}>
                  {getDisplayCategory(product)}
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
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-4xl font-bold" style={{ color: "var(--color-primary)" }}>
                    ৳{(product.price ?? 0).toFixed(2)}
                  </span>
                  {hasDiscount(product) && product.discount != null && product.discount > 0 && (
                    <span className="px-4 py-2 text-sm font-bold text-white rounded-lg" style={{ backgroundColor: "var(--color-tertiary)" }}>
                      -{product.discount}% off
                    </span>
                  )}
                </div>
                {hasDiscount(product) && product.originalPrice != null && (
                  <>
                    <span className="text-2xl line-through" style={{ color: "var(--text-tertiary)" }}>
                      ৳{product.originalPrice.toFixed(2)}
                    </span>
                    <span className="px-4 py-2 text-sm font-semibold text-white rounded-lg w-fit" style={{ backgroundColor: "var(--color-tertiary)" }}>
                      Save ৳{(product.originalPrice - (product.price ?? 0)).toFixed(2)}
                    </span>
                  </>
                )}
                {product.campaignName && (
                  <p className="text-sm font-medium mt-1" style={{ color: "var(--color-primary)" }}>
                    Campaign: {product.campaignName}
                  </p>
                )}
              </div>

              {/* Variants: only sizes and colors available for this product */}
              <ProductVariants
                product={product}
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
              <div className="flex gap-3 pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddToCart}
                  disabled={addedToCart}
                  className={`flex-1 px-6 py-3 text-white font-semibold tracking-wide rounded-lg flex items-center justify-center gap-2 transition-all ${
                    addedToCart ? "opacity-90" : ""
                  }`}
                  style={{
                    backgroundColor: addedToCart ? "var(--color-secondary)" : "var(--color-primary)",
                    boxShadow: "none",
                  }}
                  onMouseEnter={(e) => {
                    if (!addedToCart) e.currentTarget.style.backgroundColor = "var(--active-color)";
                  }}
                  onMouseLeave={(e) => {
                    if (!addedToCart) e.currentTarget.style.backgroundColor = "var(--color-primary)";
                  }}
                >
                  {addedToCart ? (
                    <>
                      <FiCheck size={18} strokeWidth={2} />
                      <span>Added to Cart</span>
                    </>
                  ) : (
                    <>
                      <FiShoppingBag size={18} strokeWidth={1.8} />
                      <span>Add to Cart</span>
                    </>
                  )}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddToWishlist}
                  className="p-3 border-2 rounded-lg flex items-center justify-center transition-colors"
                  style={{
                    borderColor: isInWishlist ? "var(--color-primary)" : "var(--border-primary)",
                    color: isInWishlist ? "var(--color-primary)" : "var(--text-primary)",
                  }}
                >
                  <FiHeart size={18} strokeWidth={1.5} className={isInWishlist ? "fill-current" : ""} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleShare}
                  className="p-3 border-2 rounded-lg flex items-center justify-center transition-colors"
                  style={{
                    borderColor: "var(--border-primary)",
                    color: "var(--text-primary)",
                  }}
                >
                  <FiShare2 size={18} strokeWidth={1.5} />
                </motion.button>
              </div>

              {/* Product Details */}
              <div className="pt-8 border-t space-y-5" style={{ borderColor: "var(--border-primary)" }}>
                <h3 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
                  Product Details
                </h3>
                <div className="space-y-4 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {product.description ? (
                    product.description.includes("\n") ? (
                      product.description
                        .split("\n")
                        .filter((line) => line.trim())
                        .map((para, i) => <p key={i}>{para.trim()}</p>)
                    ) : (
                      <p>{product.description}</p>
                    )
                  ) : (
                    <>
                      <p>Crafted from premium materials for lasting comfort and style.</p>
                      <ul className="list-disc list-inside space-y-2 pl-1">
                        <li>Premium heavyweight cotton</li>
                        <li>Relaxed silhouette</li>
                        <li>Structured high-neck hood</li>
                        <li>Designed for modern refinement</li>
                      </ul>
                    </>
                  )}
                </div>
              </div>

              {/* Specifications: main dropdown, then Composition / Size & Fit / Care / Traceability as nested dropdowns */}
              {(() => {
                const attrs = product.attributes || {};
                const toList = (v) => (Array.isArray(v) ? v : v ? [String(v)] : []).filter(Boolean);
                const comp = toList(attrs.composition);
                const fit = toList(attrs.sizeAndFit);
                const care = toList(attrs.care);
                const trace = toList(attrs.traceability);
                const hasAny = comp.length > 0 || fit.length > 0 || care.length > 0 || trace.length > 0;
                if (!hasAny) return null;
                return (
                  <div className="pt-6 border-t" style={{ borderColor: "var(--border-primary)" }}>
                    <button
                      type="button"
                      onClick={() => setSpecsOpen((o) => !o)}
                      className="w-full flex items-center justify-between py-3 text-left"
                      style={{ color: "var(--text-primary)" }}
                      aria-expanded={specsOpen}
                    >
                      <h3 className="text-xl font-semibold">Specifications</h3>
                      <FiChevronDown
                        size={22}
                        className="shrink-0 transition-transform duration-200"
                        style={{ transform: specsOpen ? "rotate(180deg)" : "rotate(0deg)", color: "var(--text-secondary)" }}
                      />
                    </button>
                    {specsOpen && (
                      <div className="space-y-1 pb-2">
                        {comp.length > 0 && (
                          <div className="rounded-lg border" style={{ borderColor: "var(--border-primary)", backgroundColor: "var(--bg-secondary)" }}>
                            <button
                              type="button"
                              onClick={() => setSpecCompositionOpen((o) => !o)}
                              className="w-full flex items-center justify-between px-4 py-3 text-left"
                              style={{ color: "var(--text-primary)" }}
                              aria-expanded={specCompositionOpen}
                            >
                              <span className="text-sm font-bold uppercase tracking-wider">Composition</span>
                              <FiChevronDown
                                size={18}
                                className="shrink-0 transition-transform duration-200"
                                style={{ transform: specCompositionOpen ? "rotate(180deg)" : "rotate(0deg)", color: "var(--text-tertiary)" }}
                              />
                            </button>
                            {specCompositionOpen && (
                              <ul className="list-disc list-inside px-4 pb-3 pt-0 space-y-1 text-sm" style={{ color: "var(--text-secondary)" }}>
                                {comp.map((line, i) => (
                                  <li key={i}>{line}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        )}
                        {fit.length > 0 && (
                          <div className="rounded-lg border" style={{ borderColor: "var(--border-primary)", backgroundColor: "var(--bg-secondary)" }}>
                            <button
                              type="button"
                              onClick={() => setSpecSizeFitOpen((o) => !o)}
                              className="w-full flex items-center justify-between px-4 py-3 text-left"
                              style={{ color: "var(--text-primary)" }}
                              aria-expanded={specSizeFitOpen}
                            >
                              <span className="text-sm font-bold uppercase tracking-wider">Size &amp; Fit</span>
                              <FiChevronDown
                                size={18}
                                className="shrink-0 transition-transform duration-200"
                                style={{ transform: specSizeFitOpen ? "rotate(180deg)" : "rotate(0deg)", color: "var(--text-tertiary)" }}
                              />
                            </button>
                            {specSizeFitOpen && (
                              <ul className="list-disc list-inside px-4 pb-3 pt-0 space-y-1 text-sm" style={{ color: "var(--text-secondary)" }}>
                                {fit.map((line, i) => (
                                  <li key={i}>{line}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        )}
                        {care.length > 0 && (
                          <div className="rounded-lg border" style={{ borderColor: "var(--border-primary)", backgroundColor: "var(--bg-secondary)" }}>
                            <button
                              type="button"
                              onClick={() => setSpecCareOpen((o) => !o)}
                              className="w-full flex items-center justify-between px-4 py-3 text-left"
                              style={{ color: "var(--text-primary)" }}
                              aria-expanded={specCareOpen}
                            >
                              <span className="text-sm font-bold uppercase tracking-wider">Care</span>
                              <FiChevronDown
                                size={18}
                                className="shrink-0 transition-transform duration-200"
                                style={{ transform: specCareOpen ? "rotate(180deg)" : "rotate(0deg)", color: "var(--text-tertiary)" }}
                              />
                            </button>
                            {specCareOpen && (
                              <ul className="list-disc list-inside px-4 pb-3 pt-0 space-y-1 text-sm" style={{ color: "var(--text-secondary)" }}>
                                {care.map((line, i) => (
                                  <li key={i}>{line}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        )}
                        {trace.length > 0 && (
                          <div className="rounded-lg border" style={{ borderColor: "var(--border-primary)", backgroundColor: "var(--bg-secondary)" }}>
                            <button
                              type="button"
                              onClick={() => setSpecTraceabilityOpen((o) => !o)}
                              className="w-full flex items-center justify-between px-4 py-3 text-left"
                              style={{ color: "var(--text-primary)" }}
                              aria-expanded={specTraceabilityOpen}
                            >
                              <span className="text-sm font-bold uppercase tracking-wider">Traceability</span>
                              <FiChevronDown
                                size={18}
                                className="shrink-0 transition-transform duration-200"
                                style={{ transform: specTraceabilityOpen ? "rotate(180deg)" : "rotate(0deg)", color: "var(--text-tertiary)" }}
                              />
                            </button>
                            {specTraceabilityOpen && (
                              <ul className="list-disc list-inside px-4 pb-3 pt-0 space-y-1 text-sm" style={{ color: "var(--text-secondary)" }}>
                                {trace.map((line, i) => (
                                  <li key={i}>{line}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </motion.div>

          {/* Reviews Section */}
          {reviews.length > 0 && (
            <ProductReviews
              productId={product.id}
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
