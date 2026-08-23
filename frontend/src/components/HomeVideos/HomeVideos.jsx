import { useEffect, useRef } from "react";

const VideoCard = ({ item }) => {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.play().catch(() => {});
        } else {
          el.pause();
        }
      },
      { threshold: 0.35 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <figure className="relative overflow-hidden bg-neutral-900 aspect-[3/4]">
      <video
        ref={ref}
        src={item.url}
        className="absolute inset-0 w-full h-full object-cover"
        muted
        loop
        playsInline
        preload="metadata"
        aria-label={item.title || "Lookbook video"}
      />
    </figure>
  );
};

/**
 * Homepage lookbook videos from ImageKit (admin → homepage/videos).
 */
const HomeVideos = ({ videos = [] }) => {
  const clips = (videos || []).filter((v) => v?.url);
  if (!clips.length) return null;

  return (
    <section className="py-10 sm:py-14 md:py-16" style={{ backgroundColor: "var(--bg-primary)" }} aria-label="Lookbook">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <h2
          className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight mb-6 sm:mb-8"
          style={{ color: "var(--text-primary)" }}
        >
          Lookbook
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
          {clips.map((item, index) => (
            <VideoCard key={item._id || item.url || index} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomeVideos;
