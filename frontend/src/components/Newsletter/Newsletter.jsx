import { useState } from "react";
import { motion } from "framer-motion";
import { fadeInUp } from "../../utils/animations";

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [focused, setFocused] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
      setEmail("");
      setTimeout(() => setSubmitted(false), 3000);
    }
  };

  return (
    <section className="pt-10 pb-20 px-4 sm:px-6 lg:px-8 transition-colors duration-300" style={{ backgroundColor: "var(--bg-secondary)" }}>
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeInUp}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: "var(--color-primary)" }}>
            Stay in the Loop
          </h2>
          <p className="mb-8 max-w-2xl mx-auto" style={{ color: "var(--text-secondary)" }}>
            Subscribe to our newsletter and be the first to know about new
            collections, exclusive offers, and style inspiration.
          </p>

          <motion.form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <motion.div
              className="flex-1 relative"
              animate={{
                scale: focused ? 1.02 : 1,
              }}
              transition={{ duration: 0.2 }}
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full px-6 py-4 border-2 outline-none transition-colors placeholder:opacity-60 rounded-lg"
                style={{
                  borderColor: focused ? "var(--color-primary)" : "var(--border-primary)",
                  backgroundColor: "var(--bg-primary)",
                  color: "var(--text-primary)",
                }}
                onFocus={(e) => {
                  setFocused(true);
                  e.target.style.borderColor = "var(--color-primary)";
                }}
                onBlur={(e) => {
                  setFocused(false);
                  e.target.style.borderColor = "var(--border-primary)";
                }}
                required
              />
            </motion.div>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.05, x: 2 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 uppercase tracking-wider text-sm font-semibold transition-colors whitespace-nowrap text-white rounded-lg"
              style={{
                backgroundColor: submitted ? "var(--color-secondary)" : "var(--color-primary)",
              }}
              onMouseEnter={(e) => {
                if (!submitted) {
                  e.target.style.backgroundColor = "var(--active-color)";
                }
              }}
              onMouseLeave={(e) => {
                if (!submitted) {
                  e.target.style.backgroundColor = "var(--color-primary)";
                }
              }}
            >
              {submitted ? "Subscribed!" : "Subscribe"}
            </motion.button>
          </motion.form>
          {submitted && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm mt-4"
              style={{ color: "var(--color-primary)" }}
            >
              Thank you for subscribing to our newsletter!
            </motion.p>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default Newsletter;
