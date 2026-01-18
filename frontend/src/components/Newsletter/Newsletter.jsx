import { useState } from "react";
import { motion } from "framer-motion";
import { fadeInUp } from "../../utils/animations";

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [focused, setFocused] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // UI-only submission
    console.log("Newsletter signup:", email);
    setEmail("");
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeInUp}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Stay in the Loop
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
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
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="Enter your email address"
                className="w-full px-6 py-4 border-2 border-gray-300 dark:border-gray-600 focus:border-gray-900 dark:focus:border-white outline-none transition-colors bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                required
              />
            </motion.div>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gray-900 text-white px-8 py-4 uppercase tracking-wider text-sm font-semibold hover:bg-gray-800 transition-colors whitespace-nowrap"
            >
              Subscribe
            </motion.button>
          </motion.form>
        </motion.div>
      </div>
    </section>
  );
};

export default Newsletter;
