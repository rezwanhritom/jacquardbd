import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronLeft, FiChevronRight, FiX } from "react-icons/fi";

const MIN_SWIPE = 50;

function distance(touches) {
  if (touches.length < 2) return 0;
  const [a, b] = [touches[0], touches[1]];
  return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
}

/** Full-screen viewer: pinch-zoom + pan; side arrows change image */
function FullscreenImageViewer({
  open,
  onClose,
  images,
  selectedIndex,
  setSelectedIndex,
  productName,
}) {
  const [scale, setScale] = useState(1);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);
  const lastDist = useRef(0);
  const modeRef = useRef(null);
  const panOriginRef = useRef(null);
  const swipeRef = useRef(null);
  const overlayRef = useRef(null);
  const scaleRef = useRef(1);
  const txRef = useRef(0);
  const tyRef = useRef(0);

  const src = images[selectedIndex];
  const hasMultiple = images.length > 1;

  useEffect(() => {
    scaleRef.current = scale;
    txRef.current = tx;
    tyRef.current = ty;
  }, [scale, tx, ty]);

  useEffect(() => {
    if (!open) return;
    setScale(1);
    setTx(0);
    setTy(0);
    scaleRef.current = 1;
    txRef.current = 0;
    tyRef.current = 0;
  }, [open, selectedIndex]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    const el = overlayRef.current;
    if (!open || !el) return;
    const block = (e) => {
      if (e.touches && e.touches.length > 1) e.preventDefault();
    };
    el.addEventListener("touchmove", block, { passive: false });
    return () => el.removeEventListener("touchmove", block);
  }, [open]);

  const handleTouchStart = useCallback((e) => {
    if (e.touches.length === 2) {
      modeRef.current = "pinch";
      swipeRef.current = null;
      lastDist.current = distance(e.touches);
    } else if (e.touches.length === 1) {
      if (scaleRef.current > 1.02) {
        modeRef.current = "pan";
        panOriginRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
          tx: txRef.current,
          ty: tyRef.current,
        };
      } else {
        modeRef.current = "swipe";
        swipeRef.current = { x: e.touches[0].clientX, endX: e.touches[0].clientX };
      }
    }
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (modeRef.current === "pinch" && e.touches.length === 2) {
      e.preventDefault();
      const d = distance(e.touches);
      if (lastDist.current > 0) {
        const f = d / lastDist.current;
        setScale((s) => {
          const ns = Math.min(5, Math.max(1, s * f));
          scaleRef.current = ns;
          return ns;
        });
      }
      lastDist.current = d;
    } else if (modeRef.current === "pan" && e.touches.length === 1 && panOriginRef.current) {
      e.preventDefault();
      const p = panOriginRef.current;
      const ntx = p.tx + e.touches[0].clientX - p.x;
      const nty = p.ty + e.touches[0].clientY - p.y;
      txRef.current = ntx;
      tyRef.current = nty;
      setTx(ntx);
      setTy(nty);
    } else if (modeRef.current === "swipe" && e.touches.length === 1 && swipeRef.current) {
      swipeRef.current.endX = e.touches[0].clientX;
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (modeRef.current === "swipe" && swipeRef.current && images.length > 1) {
      const dx = swipeRef.current.x - swipeRef.current.endX;
      if (dx > MIN_SWIPE) {
        setSelectedIndex((i) => (i + 1) % images.length);
      } else if (dx < -MIN_SWIPE) {
        setSelectedIndex((i) => (i - 1 + images.length) % images.length);
      }
    }
    modeRef.current = null;
    lastDist.current = 0;
    panOriginRef.current = null;
    swipeRef.current = null;
    setScale((s) => {
      if (s < 1.05) {
        scaleRef.current = 1;
        txRef.current = 0;
        tyRef.current = 0;
        setTx(0);
        setTy(0);
        return 1;
      }
      scaleRef.current = s;
      return s;
    });
  }, [images.length, setSelectedIndex]);

  if (!open) return null;

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[300] flex flex-col bg-black touch-manipulation"
      role="dialog"
      aria-modal="true"
      aria-label="Product image zoom"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 z-20 p-2 border-0 outline-none focus:outline-none bg-transparent"
        style={{
          top: "max(1rem, env(safe-area-inset-top))",
          color: "#fff",
          filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.9))",
        }}
        aria-label="Close"
      >
        <FiX size={28} strokeWidth={2} />
      </button>

      {hasMultiple && (
        <>
          <button
            type="button"
            onClick={() => setSelectedIndex((i) => (i - 1 + images.length) % images.length)}
            className="absolute left-1 top-1/2 -translate-y-1/2 z-20 p-2 border-0 outline-none focus:outline-none bg-transparent opacity-90 hover:opacity-100"
            style={{ color: "#fff", filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.9))" }}
            aria-label="Previous image"
          >
            <FiChevronLeft size={32} strokeWidth={2.5} />
          </button>
          <button
            type="button"
            onClick={() => setSelectedIndex((i) => (i + 1) % images.length)}
            className="absolute right-1 top-1/2 -translate-y-1/2 z-20 p-2 border-0 outline-none focus:outline-none bg-transparent opacity-90 hover:opacity-100"
            style={{ color: "#fff", filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.9))" }}
            aria-label="Next image"
          >
            <FiChevronRight size={32} strokeWidth={2.5} />
          </button>
        </>
      )}

      <div
        className="flex-1 flex items-center justify-center overflow-hidden pt-14 pb-8 px-2"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={(e) => {
          if (e.target === e.currentTarget && scale <= 1.02) onClose();
        }}
      >
        <img
          src={src}
          alt={productName}
          className="max-h-full max-w-full object-contain select-none"
          style={{
            transform: `translate(${tx}px, ${ty}px) scale(${scale})`,
          }}
          draggable={false}
        />
      </div>

      {hasMultiple && (
        <div className="flex justify-center gap-1.5 pb-6" style={{ paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))" }}>
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setSelectedIndex(i)}
              className={`h-1.5 rounded-full border-0 p-0 transition-all ${i === selectedIndex ? "w-6" : "w-1.5 opacity-50"}`}
              style={{ backgroundColor: "#fff" }}
              aria-label={`Photo ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>,
    document.body
  );
}

const ImageGallery = ({ images, productName }) => {
  const safeImages = Array.isArray(images) && images.length > 0 ? images : ["/images/product-placeholder.png"];
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const [isNarrow, setIsNarrow] = useState(
    typeof window !== "undefined" ? window.matchMedia("(max-width: 1023px)").matches : false
  );

  const touchStartXRef = useRef(null);
  const touchEndXRef = useRef(null);
  const blockFullscreenTapRef = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const fn = () => setIsNarrow(mq.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);

  const nextImage = () => {
    setSelectedIndex((prev) => (prev + 1) % safeImages.length);
  };

  const prevImage = () => {
    setSelectedIndex((prev) => (prev - 1 + safeImages.length) % safeImages.length);
  };

  const onTouchStart = (e) => {
    touchStartXRef.current = e.targetTouches[0].clientX;
    touchEndXRef.current = e.targetTouches[0].clientX;
  };
  const onTouchMove = (e) => {
    touchEndXRef.current = e.targetTouches[0].clientX;
  };
  const onTouchEnd = () => {
    const start = touchStartXRef.current;
    const end = touchEndXRef.current;
    touchStartXRef.current = null;
    touchEndXRef.current = null;
    if (start == null || end == null) return;
    const delta = start - end;
    if (safeImages.length > 1 && (delta > MIN_SWIPE || delta < -MIN_SWIPE)) {
      blockFullscreenTapRef.current = true;
      window.setTimeout(() => {
        blockFullscreenTapRef.current = false;
      }, 450);
      if (delta > MIN_SWIPE) nextImage();
      else prevImage();
    } else if (Math.abs(delta) > 12) {
      blockFullscreenTapRef.current = true;
      window.setTimeout(() => {
        blockFullscreenTapRef.current = false;
      }, 450);
    }
  };

  const handleMouseMove = (e) => {
    if (!isZoomed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  };

  const openFullscreenMobile = () => {
    if (isNarrow) {
      setIsZoomed(false);
      setFullscreenOpen(true);
    }
  };

  const arrowBtn =
    "p-1 z-10 border-0 outline-none focus:outline-none bg-transparent opacity-75 hover:opacity-100 transition-opacity";
  const arrowIconStyle = { color: "#fff", filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.85))" };

  return (
    <div className="space-y-0 lg:space-y-4">
      <div
        className="relative overflow-hidden max-lg:aspect-[4/5] lg:aspect-square max-lg:rounded-none lg:rounded-lg group touch-none max-lg:w-full"
        style={{ backgroundColor: "var(--bg-tertiary)" }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={selectedIndex}
            src={safeImages[selectedIndex]}
            alt={productName}
            className={`w-full h-full object-cover ${isNarrow ? "cursor-pointer" : "cursor-zoom-in"}`}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: isNarrow ? 1 : isZoomed ? 2 : 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            onClick={() => {
              if (isNarrow) {
                if (!blockFullscreenTapRef.current) openFullscreenMobile();
              } else setIsZoomed(!isZoomed);
            }}
            onMouseMove={!isNarrow && isZoomed ? handleMouseMove : undefined}
            style={{
              transformOrigin: !isNarrow && isZoomed ? `${zoomPosition.x}% ${zoomPosition.y}%` : "center",
              cursor: !isNarrow && isZoomed ? "zoom-out" : isNarrow ? "pointer" : "zoom-in",
            }}
          />
        </AnimatePresence>

        {!isNarrow && isZoomed && (
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => {
              e.stopPropagation();
              setIsZoomed(false);
            }}
            className="absolute top-4 right-4 p-1 z-10 border-0 outline-none focus:outline-none bg-transparent"
            style={{ color: "var(--text-primary)", filter: "drop-shadow(0 0 2px #fff) drop-shadow(0 1px 2px rgba(0,0,0,0.5))" }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Close zoom"
          >
            <FiX size={20} style={{ color: "var(--text-primary)" }} />
          </motion.button>
        )}

        {safeImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
              className={`absolute left-1 top-1/2 -translate-y-1/2 ${arrowBtn}`}
              style={arrowIconStyle}
              aria-label="Previous image"
            >
              <FiChevronLeft size={26} strokeWidth={2.5} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              className={`absolute right-1 top-1/2 -translate-y-1/2 ${arrowBtn}`}
              style={arrowIconStyle}
              aria-label="Next image"
            >
              <FiChevronRight size={26} strokeWidth={2.5} />
            </button>
          </>
        )}
      </div>

      {safeImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto scrollbar-hide max-lg:px-4 max-lg:pt-3 lg:px-0">
          {safeImages.map((image, index) => (
            <motion.button
              key={index}
              type="button"
              onClick={() => setSelectedIndex(index)}
              className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden transition-all"
              style={{
                backgroundColor: "var(--bg-tertiary)",
                outline: index === selectedIndex ? "2px solid var(--color-primary)" : "none",
                outlineOffset: 2,
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label={`Thumbnail ${index + 1}`}
            >
              <img src={image} alt="" className="w-full h-full object-cover" />
            </motion.button>
          ))}
        </div>
      )}

      <FullscreenImageViewer
        open={fullscreenOpen}
        onClose={() => setFullscreenOpen(false)}
        images={safeImages}
        selectedIndex={selectedIndex}
        setSelectedIndex={setSelectedIndex}
        productName={productName}
      />
    </div>
  );
};

export default ImageGallery;
