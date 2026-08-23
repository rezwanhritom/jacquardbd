import { useEffect, useState } from "react";
import { Link } from "react-router";

const FALLBACK_HERO = "/home-hero.png";

function MediaSlide({ item, active }) {
  if (!item) return null;
  const common = "absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-700";
  if (item.mediaType === "video") {
    return (
      <video
        src={item.url}
        className={`${common} ${active ? "opacity-100" : "opacity-0"}`}
        autoPlay={active}
        muted
        loop
        playsInline
        preload="metadata"
      />
    );
  }
  return (
    <img
      src={item.url}
      alt=""
      className={`${common} ${active ? "opacity-100" : "opacity-0"}`}
    />
  );
}

/**
 * Full-bleed hero. Slides come from admin homepage media (images and/or videos).
 * Multiple enabled slides rotate; a single slide stays put. Falls back to the site hero photo.
 */
const Hero = ({ slides = [] }) => {
  const media = (slides || []).filter((s) => s?.url);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [media.length]);

  useEffect(() => {
    if (media.length < 2) return undefined;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % media.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [media.length]);

  const current = media[index];

  return (
    <section className="relative w-full overflow-hidden bg-neutral-800 jacquard-hero-home" aria-label="Featured collection">
      {media.length > 0 ? (
        media.map((item, i) => (
          <MediaSlide key={item._id || item.url || i} item={item} active={i === index} />
        ))
      ) : (
        <img
          src={FALLBACK_HERO}
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
      )}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.22) 42%, rgba(0,0,0,0.12) 100%)",
        }}
      />
      <div className="relative h-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 flex flex-col justify-end pb-8 sm:pb-12 md:pb-16">
        <p className="text-[11px] sm:text-xs uppercase tracking-[0.28em] text-white/85 mb-3">
          Elevating style since 2026
        </p>
        <h1 className="font-display text-[2.6rem] leading-[0.95] sm:text-6xl md:text-7xl lg:text-[5.5rem] font-semibold text-white max-w-3xl">
          Shop the season
        </h1>
        <p className="mt-3 sm:mt-4 text-sm sm:text-base text-white/85 max-w-md leading-relaxed">
          Premium menswear and womenswear. Shop new arrivals, or jump straight to Men and Women.
        </p>
        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-lg">
          <Link
            to="/category/men"
            className="inline-flex items-center justify-center px-6 py-3.5 text-sm font-semibold tracking-wide text-center transition-opacity hover:opacity-90"
            style={{ backgroundColor: "white", color: "#004122" }}
          >
            Shop Men
          </Link>
          <Link
            to="/category/women"
            className="inline-flex items-center justify-center px-6 py-3.5 text-sm font-semibold tracking-wide text-center border border-white text-white transition-colors hover:bg-white hover:text-[#004122]"
          >
            Shop Women
          </Link>
          <Link
            to="/new-arrivals"
            className="inline-flex items-center justify-center px-2 sm:px-0 py-3.5 text-sm font-medium text-white underline underline-offset-4 decoration-white/70 hover:decoration-white"
          >
            New arrivals
          </Link>
        </div>
        {media.length > 1 && (
          <div className="absolute bottom-5 right-4 sm:right-8 lg:right-12 flex gap-2" aria-hidden="true">
            {media.map((item, i) => (
              <button
                key={item._id || i}
                type="button"
                onClick={() => setIndex(i)}
                className={`h-1.5 rounded-full transition-all ${i === index ? "w-8 bg-white" : "w-2 bg-white/50"}`}
                aria-label={`Show slide ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Hero;
