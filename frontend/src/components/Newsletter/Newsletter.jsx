import { useState } from "react";

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
    <section
      className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16"
      style={{ backgroundColor: "var(--bg-secondary)" }}
    >
      <div className="max-w-2xl mx-auto text-center">
        <p
          className="text-[10px] sm:text-xs uppercase tracking-[0.25em] mb-3"
          style={{ color: "var(--color-tertiary)" }}
        >
          Newsletter
        </p>
        <h2
          className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold mb-3"
          style={{ color: "var(--text-primary)" }}
        >
          Stay in the loop
        </h2>
        <p className="text-sm sm:text-base mb-8" style={{ color: "var(--text-secondary)" }}>
          New collections, exclusive offers, and drops — first to your inbox.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            className="flex-1 px-5 py-3.5 outline-none text-sm border"
            style={{
              borderColor: focused ? "var(--color-primary)" : "var(--border-primary)",
              backgroundColor: "var(--bg-primary)",
              color: "var(--text-primary)",
            }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            required
          />
          <button
            type="submit"
            className="px-7 py-3.5 text-sm font-semibold text-white whitespace-nowrap"
            style={{
              backgroundColor: submitted ? "var(--color-secondary)" : "var(--color-primary)",
            }}
          >
            {submitted ? "Subscribed" : "Subscribe"}
          </button>
        </form>
        {submitted && (
          <p className="text-sm mt-4" style={{ color: "var(--color-primary)" }}>
            Thank you for subscribing.
          </p>
        )}
      </div>
    </section>
  );
};

export default Newsletter;
