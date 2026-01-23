import { Link } from "react-router";
import { motion } from "framer-motion";
import { fadeInUp } from "../../utils/animations";
import { FiArrowRight } from "react-icons/fi";

const FeaturedBanner = () => {
  const bannerData = {
    title: "Spring Collection 2024",
    subtitle: "Limited Edition",
    description: "Discover our exclusive spring collection featuring premium fabrics and timeless designs",
    ctaText: "Explore Collection",
    ctaLink: "/collection/new-arrivals",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&q=80",
  };

  return (
    <motion.section
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, amount: 0.3 }}
      variants={fadeInUp}
      className="relative h-[500px] md:h-[600px] overflow-hidden rounded-2xl my-20 mx-4 sm:mx-6 lg:mx-8"
      style={{ backgroundColor: "var(--bg-secondary)" }}
    >
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${bannerData.image})`,
          opacity: 0.4,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
      
      <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-2xl space-y-6 text-white"
        >
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-sm uppercase tracking-widest font-medium text-white/90"
          >
            {bannerData.subtitle}
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight"
          >
            {bannerData.title}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="text-lg md:text-xl text-white/80 max-w-lg"
          >
            {bannerData.description}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
          >
            <Link to={bannerData.ctaLink}>
              <motion.button
                whileHover={{ scale: 1.05, x: 5 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-3 px-8 py-4 uppercase tracking-wider text-sm font-semibold text-white transition-all"
                style={{ backgroundColor: "var(--color-primary)" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--active-color)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--color-primary)";
                }}
              >
                {bannerData.ctaText}
                <FiArrowRight size={18} />
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default FeaturedBanner;
