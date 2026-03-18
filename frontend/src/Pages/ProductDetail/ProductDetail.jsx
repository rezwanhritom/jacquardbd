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
  const [specCompositionOpen, setSpecCompositionOpen] = useState(false);
  const [specSizeFitOpen, setSpecSizeFitOpen] = useState(false);
  const [specCareOpen, setSpecCareOpen] = useState(false);
  const [specTraceabilityOpen, setSpecTraceabilityOpen] = useState(false);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);

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

  const attrs = product.attributes || {};
  const toList = (v) => (Array.isArray(v) ? v : v ? [String(v)] : []).filter(Boolean);
  const comp = toList(attrs.composition);
  const fit = toList(attrs.sizeAndFit);
  const care = toList(attrs.care);
  const trace = toList(attrs.traceability);

  const rawDescription =
    product.description && String(product.description).trim()
      ? String(product.description).trim()
      : "";
  const descNeedsMore =
    rawDescription.length > 140 || rawDescription.split(/\n/).filter(Boolean).length > 2;

  return (
    <div className="min-h-screen max-lg:pt-0 lg:py-16 pb-12 lg:pb-16 overflow-x-hidden">
      <Container>
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerContainer}
          className="space-y-8 lg:space-y-12"
        >
          {/* Breadcrumb — desktop only at top */}
          <motion.div variants={fadeInUp} className="hidden lg:block">
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
          <motion.div variants={fadeInUp} className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-12">
            {/* Image Gallery — edge-to-edge on mobile */}
            <div className="max-lg:w-screen max-lg:max-w-[100vw] max-lg:relative max-lg:left-1/2 max-lg:-translate-x-1/2 lg:w-full lg:translate-x-0 lg:left-0">
              <ImageGallery images={product.images} productName={product.name} />
            </div>

            {/* Product Info */}
            <div className="space-y-4 lg:space-y-6 px-0 sm:px-0 pt-4 lg:pt-0 max-lg:px-1">
              <motion.div variants={fadeInUp} className="lg:hidden mb-1">
                <Link
                  to="/"
                  className="inline-flex items-center gap-1.5 text-xs transition-colors"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <FiChevronLeft size={14} />
                  <span>Back</span>
                </Link>
              </motion.div>

              {/* Category & Rating */}
              <div>
                <p
                  className="text-[11px] lg:text-sm font-bold uppercase tracking-wider mb-1.5 lg:mb-2"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  {getDisplayCategory(product)}
                </p>
                <div className="flex flex-wrap items-center gap-2 lg:gap-4 mb-2 lg:mb-3">
                  <h1
                    className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight max-w-full"
                    style={{ color: "var(--text-primary)" }}
                  >
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
                      <span className="text-xs lg:text-sm ml-1" style={{ color: "var(--text-secondary)" }}>
                        ({reviews.length})
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Price */}
              <div className="flex flex-col gap-0.5 lg:gap-1">
                <div className="flex items-center gap-2 lg:gap-3 flex-wrap">
                  <span className="text-2xl sm:text-3xl lg:text-4xl font-bold tabular-nums" style={{ color: "var(--color-primary)" }}>
                    ৳{(product.price ?? 0).toFixed(2)}
                  </span>
                  {hasDiscount(product) && product.discount != null && product.discount > 0 && (
                    <span className="px-2.5 py-1 lg:px-4 lg:py-2 text-xs lg:text-sm font-bold text-white rounded-lg" style={{ backgroundColor: "var(--color-tertiary)" }}>
                      -{product.discount}% off
                    </span>
                  )}
                </div>
                {hasDiscount(product) && product.originalPrice != null && (
                  <>
                    <span className="text-base lg:text-2xl line-through tabular-nums" style={{ color: "var(--text-tertiary)" }}>
                      ৳{product.originalPrice.toFixed(2)}
                    </span>
                    <span className="px-2.5 py-1 lg:px-4 lg:py-2 text-xs lg:text-sm font-semibold text-white rounded-lg w-fit" style={{ backgroundColor: "var(--color-tertiary)" }}>
                      Save ৳{(product.originalPrice - (product.price ?? 0)).toFixed(2)}
                    </span>
                  </>
                )}
                {product.campaignName && (
                  <p className="text-xs lg:text-sm font-medium mt-0.5 lg:mt-1" style={{ color: "var(--color-primary)" }}>
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
                <label className="block text-xs lg:text-sm font-semibold mb-2 lg:mb-3 uppercase tracking-wider" style={{ color: "var(--text-primary)" }}>
                  Quantity
                </label>
                <div className="flex items-center gap-3 lg:gap-4">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center border-2 rounded-lg transition-colors"
                    style={{ borderColor: "var(--border-primary)" }}
                  >
                    <span className="text-lg" style={{ color: "var(--text-primary)" }}>-</span>
                  </motion.button>
                  <span className="text-lg lg:text-xl font-semibold w-12 lg:w-16 text-center" style={{ color: "var(--text-primary)" }}>
                    {quantity}
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center border-2 rounded-lg transition-colors"
                    style={{ borderColor: "var(--border-primary)" }}
                  >
                    <span className="text-lg" style={{ color: "var(--text-primary)" }}>+</span>
                  </motion.button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 lg:gap-3 pt-2 lg:pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddToCart}
                  disabled={addedToCart}
                  className={`flex-1 px-4 py-2.5 lg:px-6 lg:py-3 text-sm lg:text-base text-white font-semibold tracking-wide rounded-lg flex items-center justify-center gap-2 transition-all ${
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
                  className="p-2.5 lg:p-3 border-2 rounded-lg flex items-center justify-center transition-colors shrink-0"
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
                  className="p-2.5 lg:p-3 border-2 rounded-lg flex items-center justify-center transition-colors shrink-0"
                  style={{
                    borderColor: "var(--border-primary)",
                    color: "var(--text-primary)",
                  }}
                >
                  <FiShare2 size={18} strokeWidth={1.5} />
                </motion.button>
              </div>

              {/* Product Details + description */}
              <div className="pt-6 lg:pt-8 border-t space-y-3 lg:space-y-4" style={{ borderColor: "var(--border-primary)" }}>
                <h3 className="text-base lg:text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
                  Product details
                </h3>
                <div className="text-xs lg:text-sm leading-relaxed space-y-2" style={{ color: "var(--text-secondary)" }}>
                  {rawDescription ? (
                    <>
                      <div
                        className={!descriptionExpanded && descNeedsMore ? "line-clamp-3" : ""}
                        style={{ wordBreak: "break-word" }}
                      >
                        {rawDescription.includes("\n") ? (
                          rawDescription
                            .split("\n")
                            .filter((line) => line.trim())
                            .map((para, i) => (
                              <p key={i} className={i > 0 ? "mt-2" : ""}>
                                {para.trim()}
                              </p>
                            ))
                        ) : (
                          <p>{rawDescription}</p>
                        )}
                      </div>
                      {descNeedsMore && (
                        <button
                          type="button"
                          onClick={() => setDescriptionExpanded((e) => !e)}
                          className="text-xs lg:text-sm font-semibold uppercase tracking-wider pt-1 border-0 bg-transparent cursor-pointer"
                          style={{ color: "var(--color-primary)" }}
                        >
                          {descriptionExpanded ? "See less" : "See more"}
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      <p>Crafted from premium materials for lasting comfort and style.</p>
                      <ul className="list-disc list-inside space-y-1.5 pl-0.5 text-xs lg:text-sm">
                        <li>Premium heavyweight cotton</li>
                        <li>Relaxed silhouette</li>
                        <li>Structured high-neck hood</li>
                        <li>Designed for modern refinement</li>
                      </ul>
                    </>
                  )}
                </div>
              </div>

              {/* Four information sections — headers always visible; expand per section */}
              <div className="pt-5 lg:pt-6 border-t" style={{ borderColor: "var(--border-primary)" }}>
                <h3 className="text-base lg:text-xl font-semibold mb-3 lg:mb-4" style={{ color: "var(--text-primary)" }}>
                  Product information
                </h3>
                <div className="space-y-0">
                  {[
                    {
                      id: "comp",
                      title: "Composition",
                      open: specCompositionOpen,
                      set: setSpecCompositionOpen,
                      lines: comp,
                    },
                    {
                      id: "fit",
                      title: "Size & Fit",
                      open: specSizeFitOpen,
                      set: setSpecSizeFitOpen,
                      lines: fit,
                    },
                    {
                      id: "care",
                      title: "Care",
                      open: specCareOpen,
                      set: setSpecCareOpen,
                      lines: care,
                    },
                    {
                      id: "trace",
                      title: "Traceability",
                      open: specTraceabilityOpen,
                      set: setSpecTraceabilityOpen,
                      lines: trace,
                    },
                  ].map((section) => (
                    <div
                      key={section.id}
                      className="border-b last:border-b-0"
                      style={{ borderColor: "var(--border-primary)" }}
                    >
                      <button
                        type="button"
                        onClick={() => section.set((o) => !o)}
                        className="w-full flex items-center justify-between py-3 lg:py-3.5 text-left gap-3 border-0 bg-transparent cursor-pointer"
                        style={{ color: "var(--text-primary)" }}
                        aria-expanded={section.open}
                      >
                        <span className="text-[11px] lg:text-sm font-bold uppercase tracking-wider">
                          {section.title}
                        </span>
                        <FiChevronDown
                          size={20}
                          className="shrink-0 transition-transform duration-200 border-0"
                          style={{
                            transform: section.open ? "rotate(180deg)" : "rotate(0deg)",
                            color: "var(--text-secondary)",
                          }}
                        />
                      </button>
                      {section.open && (
                        <div className="pb-3 pl-0 pr-1 -mt-1">
                          {section.lines.length > 0 ? (
                            <ul className="list-disc list-inside space-y-1 text-xs lg:text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                              {section.lines.map((line, i) => (
                                <li key={i}>{line}</li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-xs lg:text-sm pb-1" style={{ color: "var(--text-tertiary)" }}>
                              No details available for this section.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
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
