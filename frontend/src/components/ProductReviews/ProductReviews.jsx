import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiStar, FiCheck } from "react-icons/fi";
import { fadeInUp, staggerContainer } from "../../utils/animations";

const ProductReviews = ({ productId, reviews, averageRating }) => {
  const [showAll, setShowAll] = useState(false);
  const displayedReviews = showAll ? reviews : reviews.slice(0, 3);

  const renderStars = (rating) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <FiStar
        key={index}
        size={16}
        className={index < rating ? "fill-current" : ""}
        style={{
          color: index < rating ? "var(--color-tertiary)" : "var(--text-tertiary)",
        }}
      />
    ));
  };

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((review) => {
      distribution[review.rating]++;
    });
    return distribution;
  };

  const distribution = getRatingDistribution();
  const totalReviews = reviews.length;

  return (
    <section className="py-12 border-t" style={{ borderColor: "var(--border-primary)" }}>
      <motion.div
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
        className="space-y-8"
      >
        {/* Reviews Header */}
        <motion.div variants={fadeInUp} className="space-y-4">
          <div className="flex items-center gap-4">
            <h2 className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
              Customer Reviews
            </h2>
            {averageRating > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {renderStars(Math.round(averageRating))}
                </div>
                <span className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                  {averageRating}
                </span>
                <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  ({totalReviews} review{totalReviews !== 1 ? "s" : ""})
                </span>
              </div>
            )}
          </div>

          {/* Rating Distribution */}
          {totalReviews > 0 && (
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = distribution[rating];
                const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                return (
                  <div key={rating} className="flex items-center gap-3">
                    <span className="text-sm w-8" style={{ color: "var(--text-secondary)" }}>
                      {rating}
                    </span>
                    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: "var(--bg-tertiary)" }}>
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${percentage}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: rating * 0.1 }}
                        className="h-full"
                        style={{ backgroundColor: "var(--color-tertiary)" }}
                      />
                    </div>
                    <span className="text-sm w-8 text-right" style={{ color: "var(--text-secondary)" }}>
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Reviews List */}
        {totalReviews > 0 ? (
          <>
            <motion.div variants={staggerContainer} className="space-y-6">
              <AnimatePresence>
                {displayedReviews.map((review, index) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-6 rounded-lg"
                    style={{ backgroundColor: "var(--bg-secondary)" }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold" style={{ color: "var(--text-primary)" }}>
                            {review.userName}
                          </h4>
                          {review.verified && (
                            <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded" style={{ backgroundColor: "var(--color-primary)", color: "white" }}>
                              <FiCheck size={12} />
                              Verified Purchase
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            {renderStars(review.rating)}
                          </div>
                          <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                            {new Date(review.date).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                      {review.comment}
                    </p>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {reviews.length > 3 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAll(!showAll)}
                className="px-6 py-3 border rounded-lg font-semibold transition-colors"
                style={{
                  borderColor: "var(--border-primary)",
                  color: "var(--text-primary)",
                }}
              >
                {showAll ? "Show Less" : `Show All ${reviews.length} Reviews`}
              </motion.button>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p style={{ color: "var(--text-secondary)" }}>
              No reviews yet. Be the first to review this product!
            </p>
          </div>
        )}
      </motion.div>
    </section>
  );
};

export default ProductReviews;
