import { motion } from "framer-motion";
import { footerData } from "../../data/footer";
import {
  FiFacebook,
  FiInstagram,
  FiTwitter,
} from "react-icons/fi";
import { FaPinterest } from "react-icons/fa";
import { fadeInUp, staggerContainer } from "../../utils/animations";

const Footer = () => {
  const getSocialIcon = (name) => {
    const icons = {
      facebook: FiFacebook,
      instagram: FiInstagram,
      twitter: FiTwitter,
      pinterest: FaPinterest,
    };
    return icons[name] || null;
  };

  return (
    <footer style={{ backgroundColor: "var(--color-primary)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12"
        >
          {/* Brand Column */}
          <motion.div variants={fadeInUp} className="lg:col-span-2">
            <img
              src="/images/logo.png"
              alt={footerData.brand.name}
              className="h-10 w-auto object-contain mb-4 filter brightness-0 invert"
            />
            <p className="text-sm mb-2 uppercase tracking-wider text-white/80">
              {footerData.brand.tagline}
            </p>
            <p className="text-sm mb-6 max-w-sm text-white/70">
              {footerData.brand.description}
            </p>
            <div className="flex space-x-4">
              {footerData.social.map((social) => {
                const Icon = getSocialIcon(social.name);
                if (!Icon) return null;
                return (
                  <motion.a
                    key={social.id}
                    href={social.url}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-10 h-10 flex items-center justify-center border transition-colors text-white/70"
                    style={{ borderColor: "rgba(255, 255, 255, 0.3)" }}
                    onMouseEnter={(e) => {
                      e.target.style.borderColor = "var(--color-tertiary)";
                      e.target.style.color = "var(--color-tertiary)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.borderColor = "rgba(255, 255, 255, 0.3)";
                      e.target.style.color = "rgba(255, 255, 255, 0.7)";
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
            <motion.div key={index} variants={fadeInUp}>
              <h4 className="font-semibold mb-4 uppercase tracking-wider text-sm text-white">
                {column.title}
              </h4>
              <ul className="space-y-3">
                {column.links.map((link) => (
                  <li key={link.id}>
                    <motion.a
                      href={link.path}
                      className="text-sm transition-colors block text-white/70"
                      onMouseEnter={(e) => {
                        e.target.style.color = "var(--color-tertiary)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.color = "rgba(255, 255, 255, 0.7)";
                      }}
                      whileHover={{ x: 5 }}
                    >
                      {link.label}
                    </motion.a>
                  </li>
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
            <p className="text-sm text-white/70">{footerData.copyright}</p>
            <div className="flex space-x-6">
              {footerData.legal.map((link) => (
                <motion.a
                  key={link.id}
                  href={link.path}
                  className="text-sm transition-colors text-white/70"
                  onMouseEnter={(e) => {
                    e.target.style.color = "var(--color-tertiary)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = "rgba(255, 255, 255, 0.7)";
                  }}
                  whileHover={{ y: -2 }}
                >
                  {link.label}
                </motion.a>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
