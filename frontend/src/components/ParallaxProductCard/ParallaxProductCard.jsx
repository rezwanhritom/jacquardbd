import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";

const IMAGE_SCALE_RANGE = 0.02; // 1.00 -> 1.02
const LUMINANCE_THRESHOLD = 0.5; // above = light bg → black text; below = dark bg → white text
const SAMPLE_SIZE = 32; // sample image at 32x32 for performance

/**
 * Returns relative luminance (0–1). Above 0.5 = light background (black text clearer).
 * Can throw if canvas is tainted (cross-origin image without CORS).
 */
function getAverageLuminance(imageEl) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return 0.5;
  const w = Math.min(SAMPLE_SIZE, imageEl.naturalWidth || SAMPLE_SIZE);
  const h = Math.min(SAMPLE_SIZE, imageEl.naturalHeight || SAMPLE_SIZE);
  if (!w || !h) return 0.5;
  canvas.width = w;
  canvas.height = h;
  ctx.drawImage(imageEl, 0, 0, w, h);
  const data = ctx.getImageData(0, 0, w, h).data;
  let sum = 0;
  const len = data.length;
  for (let i = 0; i < len; i += 4) {
    const r = data[i] / 255;
    const g = data[i + 1] / 255;
    const b = data[i + 2] / 255;
    sum += 0.299 * r + 0.587 * g + 0.114 * b;
  }
  const pixelCount = len / 4;
  return pixelCount ? sum / pixelCount : 0.5;
}

/** True if url is same-origin (so canvas won't be tainted). */
function isSameOrigin(url) {
  try {
    const a = document.createElement("a");
    a.href = url;
    return a.origin === window.location.origin;
  } catch {
    return false;
  }
}

/**
 * Full-height parallax: text travels from top to bottom of the image container.
 * Text color is chosen by image luminance: light bg → black text, dark bg → white text.
 */
const ParallaxProductCard = ({ image, title, description, to }) => {
  const containerRef = useRef(null);
  const textLayerRef = useRef(null);
  const textBlockRef = useRef(null); // title + description block, for measuring height
  const imageLayerRef = useRef(null);
  const rafRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [useLightText, setUseLightText] = useState(true); // true = white text (default for dark bg)

  // Analyze image luminance: use proxy in dev so backend images are same-origin (canvas not tainted)
  useEffect(() => {
    if (!image) return;
    const apiBase = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
    const useProxy =
      import.meta.env.DEV && apiBase && typeof image === "string" && image.startsWith(apiBase);
    const urlForAnalysis = useProxy ? "/backend-media" + image.slice(apiBase.length) : image;

    let cancelled = false;
    const img = new Image();
    if (!isSameOrigin(urlForAnalysis)) img.crossOrigin = "anonymous";
    img.onload = () => {
      if (cancelled) return;
      try {
        const luminance = getAverageLuminance(img);
        setUseLightText(luminance <= LUMINANCE_THRESHOLD);
      } catch {
        setUseLightText(true);
      }
    };
    img.onerror = () => {
      if (!cancelled) setUseLightText(true);
    };
    img.src = urlForAnalysis;
    return () => {
      cancelled = true;
      img.src = "";
    };
  }, [image]);

  useEffect(() => {
    const container = containerRef.current;
    const textLayer = textLayerRef.current;
    const textBlock = textBlockRef.current;
    const imageLayer = imageLayerRef.current;
    if (!container || !textLayer) return;

    const updateParallax = () => {
      const rect = container.getBoundingClientRect();
      const containerHeight = rect.height;
      const windowHeight = window.innerHeight;
      // Progress 0 = card just entered from bottom; 1 = card leaving from top
      const progress = Math.max(
        0,
        Math.min(1, (windowHeight - rect.top) / (windowHeight + rect.height))
      );
      // Desired offset in px (positive = text moves down). Full range would be -containerHeight/2 to +containerHeight/2
      let offsetPx = (progress - 0.5) * containerHeight;

      // Clamp so the whole text block stays within 15%–85% of the container (inset from top and bottom)
      if (textBlock) {
        const textHeight = textBlock.getBoundingClientRect().height;
        const minOffset = textHeight / 2 - 0.35 * containerHeight; // text top >= 15%
        const maxOffset = 0.35 * containerHeight - textHeight / 2; // text bottom <= 85%
        offsetPx = Math.max(minOffset, Math.min(maxOffset, offsetPx));
      }

      textLayer.style.transform = `translate3d(0, ${offsetPx}px, 0)`;

      if (imageLayer) {
        const scale = 1 + IMAGE_SCALE_RANGE * (1 - 2 * progress);
        imageLayer.style.transform = `scale(${scale})`;
      }

      rafRef.current = null;
    };

    const onScroll = () => {
      if (rafRef.current !== null) return;
      rafRef.current = requestAnimationFrame(updateParallax);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    updateParallax();

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { rootMargin: "0px 0px -40px 0px", threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Link
      to={to}
      className="block relative overflow-hidden bg-neutral-100 group isolate"
    >
      <div
        ref={containerRef}
        className={`aspect-[3/4] md:aspect-[4/5] relative flex flex-col overflow-hidden transition-opacity duration-700 ${isVisible ? "opacity-100" : "opacity-0"}`}
      >
        {/* Clipping wrapper: fixed bounds so text never paints under adjacent cards */}
        <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none">
          {/* Parallax layer: only this inner div moves; wrapper clips it to container */}
          <div
            ref={textLayerRef}
            className="absolute inset-0 flex items-center justify-center px-4 text-center will-change-transform"
            style={{ transform: "translate3d(0, 0, 0)" }}
          >
            <div ref={textBlockRef} className="max-w-md">
              <h3
                className={`text-xl md:text-2xl lg:text-3xl font-bold leading-tight drop-shadow-lg mb-2 ${useLightText ? "text-white" : "text-black"}`}
              >
                {title}
              </h3>
              <p
                className={`text-sm md:text-base leading-relaxed drop-shadow-md line-clamp-3 ${useLightText ? "text-white/95" : "text-black/90"}`}
              >
                {description}
              </p>
            </div>
          </div>
        </div>
        {/* Image — fixed in container, optional subtle scale */}
        <div
          ref={imageLayerRef}
          className="absolute inset-0 select-none will-change-transform"
          style={{ transform: "scale(1)" }}
        >
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </Link>
  );
};

export default ParallaxProductCard;
