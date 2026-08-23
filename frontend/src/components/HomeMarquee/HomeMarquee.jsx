const PHRASE = "JACQUARD  ·  Elevating Style Since 2026  ·  ";

const HomeMarquee = () => {
  const loop = Array.from({ length: 8 }, () => PHRASE).join("");

  return (
    <div
      className="overflow-hidden border-y py-2.5 sm:py-3"
      style={{
        backgroundColor: "var(--bg-secondary)",
        borderColor: "var(--border-primary)",
        color: "var(--text-primary)",
      }}
      aria-hidden="true"
    >
      <div className="jacquard-marquee-track font-display text-sm sm:text-base tracking-[0.18em] uppercase whitespace-nowrap">
        <span>{loop}</span>
        <span>{loop}</span>
      </div>
    </div>
  );
};

export default HomeMarquee;
