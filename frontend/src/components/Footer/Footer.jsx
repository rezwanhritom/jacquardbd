import { useState } from "react";
import { Link } from "react-router";
import { motion } from "framer-motion";
import { footerData } from "../../data/footer";
import {
  FiFacebook,
  FiInstagram,
  FiTwitter,
  FiMail,
  FiArrowRight,
} from "react-icons/fi";
import { FaPinterest } from "react-icons/fa";
import { fadeInUp, staggerContainer } from "../../utils/animations";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const getSocialIcon = (name) => {
    const icons = {
      facebook: FiFacebook,
      instagram: FiInstagram,
      twitter: FiTwitter,
      pinterest: FaPinterest,
    };
    return icons[name] || null;
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setIsSubmitting(true);
      setTimeout(() => {
        setIsSubmitting(false);
        setSubmitted(true);
        setEmail("");
        setTimeout(() => setSubmitted(false), 3000);
      }, 500);
    }
  };

  return (
    <footer
      className="relative overflow-hidden"
      style={{
        backgroundColor: "var(--color-primary)",
        color: "white",
      }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.1 }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12"
        >
          {/* Brand Column */}
          <motion.div variants={fadeInUp} className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-block">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-3 mb-4"
              >
                <img
                  src="/images/logo.png"
                  alt={footerData.brand.name}
                  className="h-10 w-auto object-contain"
                  style={{ filter: "brightness(0) invert(1)" }}
                />
                <span className="text-2xl font-bold tracking-wider text-white">
                  {footerData.brand.name}
                </span>
              </motion.div>
            </Link>
            <p className="text-sm uppercase tracking-wider text-white/80 mb-2">
              {footerData.brand.tagline}
            </p>
            <p className="text-sm max-w-sm text-white/70 leading-relaxed">
              {footerData.brand.description}
            </p>

            {/* Newsletter Signup */}
            <div className="mt-6 space-y-3">
              <h4 className="text-sm font-semibold uppercase tracking-wider text-white">
                Newsletter
              </h4>
              <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                <motion.input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email"
                  required
                  className="flex-1 px-4 py-2.5 rounded-lg outline-none text-sm text-gray-900 placeholder-gray-500"
                  whileFocus={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                />
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-lg font-semibold text-sm uppercase tracking-wider flex items-center gap-2 transition-all"
                  style={{
                    backgroundColor: submitted ? "var(--color-secondary)" : "white",
                    color: submitted ? "white" : "var(--color-primary)",
                  }}
                  whileHover={{ scale: 1.05, x: 2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {submitted ? (
                    <>
                      <FiMail size={16} />
                      <span>Subscribed!</span>
                    </>
                  ) : (
                    <>
                      <span>Subscribe</span>
                      <FiArrowRight size={16} />
                    </>
                  )}
                </motion.button>
              </form>
              {submitted && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-white/80"
                >
                  Thank you for subscribing!
                </motion.p>
              )}
            </div>

            {/* Social Icons */}
            <div className="flex space-x-3 mt-6">
              {footerData.social.map((social, index) => {
                const Icon = getSocialIcon(social.name);
                if (!Icon) return null;
                return (
                  <motion.a
                    key={social.id}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.15, y: -3, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-11 h-11 flex items-center justify-center rounded-lg border-2 transition-all"
                    style={{
                      borderColor: "rgba(255, 255, 255, 0.3)",
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      color: "white",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "white";
                      e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.3)";
                      e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
                    }}
                    aria-label={social.label}
                  >
                    <Icon size={18} />
                  </motion.a>
                );
              })}
            </div>
          </motion.div>

          {/* Footer Columns */}
          {footerData.columns.map((column, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              className="space-y-4"
            >
              <h4 className="font-semibold mb-4 uppercase tracking-wider text-sm text-white">
                {column.title}
              </h4>
              <ul className="space-y-3">
                {column.links.map((link, linkIndex) => (
                  <motion.li
                    key={link.id}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: linkIndex * 0.05 }}
                  >
                    <Link to={link.path}>
                      <motion.span
                        className="text-sm block text-white/70 transition-colors"
                        whileHover={{
                          color: "white",
                          x: 5,
                        }}
                      >
                        {link.label}
                      </motion.span>
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="pt-8 border-t"
          style={{ borderColor: "rgba(255, 255, 255, 0.2)" }}
        >
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <motion.p
              className="text-sm text-white/70"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              {footerData.copyright}
            </motion.p>
            <div className="flex flex-wrap gap-6 justify-center md:justify-end">
              {footerData.legal.map((link, index) => (
                <motion.div
                  key={link.id}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link to={link.path}>
                    <motion.span
                      className="text-sm text-white/70 transition-colors block"
                      whileHover={{
                        color: "white",
                        y: -2,
                      }}
                    >
                      {link.label}
                    </motion.span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
