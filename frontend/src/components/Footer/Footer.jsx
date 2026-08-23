import { Link } from "react-router";
import { motion } from "framer-motion";
import { FiPhone } from "react-icons/fi";
import { footerData } from "../../data/footer";
import { fadeInUp, staggerContainer } from "../../utils/animations";
import { useChat } from "../../context/ChatContext";
import { useCookieConsent } from "../../context/CookieConsentContext";

const Footer = () => {
  const { openChat } = useChat();
  const { openCookieSettings } = useCookieConsent();

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

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-3">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.1 }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 md:gap-8 mb-6"
        >
          {/* Brand Column */}
          <motion.div variants={fadeInUp} className="lg:col-span-2 space-y-2">
            <Link to="/" className="inline-block">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-3 mb-2"
              >
                <img
                  src="/images/logo.png"
                  alt={footerData.brand.name}
                  className="h-10 w-auto object-contain"
                  style={{ filter: "brightness(0) invert(1)" }}
                />
                <span className="font-display text-2xl font-semibold tracking-[0.18em] text-white">
                  {footerData.brand.name}
                </span>
              </motion.div>
            </Link>
            <p className="text-sm uppercase tracking-wider text-white/80">
              {footerData.brand.tagline}
            </p>
            <p className="text-sm max-w-sm text-white/70 leading-relaxed">
              {footerData.brand.description}
            </p>
          </motion.div>

          {/* Footer Columns */}
          {footerData.columns.map((column, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              className="space-y-2"
            >
              <h4 className="font-semibold mb-2 uppercase tracking-wider text-sm text-white">
                {column.title}
              </h4>
              {column.phone && (
                <motion.a
                  href={`tel:${column.phone.replace(/\s/g, "")}`}
                  className="text-sm flex items-center gap-2 text-white/70 hover:text-white transition-colors"
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                >
                  <FiPhone size={14} />
                  {column.phone}
                </motion.a>
              )}
              <ul className="space-y-1.5">
                {column.links.map((link, linkIndex) => (
                  <motion.li
                    key={link.id}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: linkIndex * 0.05 }}
                  >
                    {link.isLiveChat ? (
                      <button
                        type="button"
                        onClick={() => openChat()}
                        className="text-left w-full"
                      >
                        <motion.span
                          className="text-sm block text-white/70 transition-colors"
                          whileHover={{
                            color: "white",
                            x: 5,
                          }}
                        >
                          {link.label}
                        </motion.span>
                      </button>
                    ) : (
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
                    )}
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
          className="pt-4 border-t"
          style={{ borderColor: "rgba(255, 255, 255, 0.2)" }}
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-3 md:gap-0">
            <motion.p
              className="text-sm text-white/70"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              {footerData.copyright}
            </motion.p>
            <div className="flex flex-wrap gap-6 justify-center md:justify-end items-center">
              <button
                type="button"
                onClick={openCookieSettings}
                className="text-sm text-white/70 hover:text-white transition-colors"
              >
                Cookie settings
              </button>
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

          <div
            className="mt-4 pt-4 border-t flex justify-center"
            style={{ borderColor: "rgba(255, 255, 255, 0.2)" }}
          >
            <motion.p
              className="text-sm text-white/70"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              Made by{" "}
              <a
                href="https://gridlooptech.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-white/90 underline underline-offset-2 transition-colors hover:text-white"
              >
                gridlooptech
              </a>
            </motion.p>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
