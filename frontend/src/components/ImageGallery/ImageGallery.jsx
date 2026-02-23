import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronUp, FiChevronDown, FiZoomIn, FiX } from "react-icons/fi";

const MIN_SWIPE = 50;

const ImageGallery = ({ images, productName }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [touchStartY, setTouchStartY] = useState(null);
  const [touchEndY, setTouchEndY] = useState(null);

  const nextImage = () => {
    setSelectedIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setSelectedIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const onTouchStart = (e) => setTouchStartY(e.targetTouches[0].clientY);
  const onTouchMove = (e) => setTouchEndY(e.targetTouches[0].clientY);
  const onTouchEnd = () => {
    if (touchStartY == null || touchEndY == null || images.length <= 1) {
      setTouchStartY(null);
      setTouchEndY(null);
      return;
    }
    const delta = touchStartY - touchEndY;
    if (delta > MIN_SWIPE) nextImage();
    else if (delta < -MIN_SWIPE) prevImage();
    setTouchStartY(null);
    setTouchEndY(null);
  };

  const handleMouseMove = (e) => {
    if (!isZoomed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  };

  return (
    <div className="space-y-4">
      {/* Main Image: vertical swipe up/down to change image */}
      <div
        className="relative aspect-square overflow-hidden rounded-lg group touch-none"
        style={{ backgroundColor: "var(--bg-tertiary)" }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={selectedIndex}
            src={images[selectedIndex]}
            alt={`${productName} - Image ${selectedIndex + 1}`}
            className="w-full h-full object-cover cursor-zoom-in"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: isZoomed ? 2 : 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            onClick={() => setIsZoomed(!isZoomed)}
            onMouseMove={isZoomed ? handleMouseMove : undefined}
            style={{
              transformOrigin: isZoomed ? `${zoomPosition.x}% ${zoomPosition.y}%` : "center",
              cursor: isZoomed ? "zoom-out" : "zoom-in",
            }}
          />
        </AnimatePresence>

        {/* Zoom Indicator */}
        {!isZoomed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute top-4 right-4 p-2 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ backgroundColor: "rgba(255, 255, 255, 0.9)" }}
          >
            <FiZoomIn size={20} style={{ color: "var(--text-primary)" }} />
          </motion.div>
        )}

        {/* Zoom Close Button */}
        {isZoomed && (
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => setIsZoomed(false)}
            className="absolute top-4 right-4 p-2 rounded-full backdrop-blur-sm z-10"
            style={{ backgroundColor: "rgba(255, 255, 255, 0.9)" }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <FiX size={20} style={{ color: "var(--text-primary)" }} />
          </motion.button>
        )}

        {/* Navigation Arrows: up/down for vertical swipe */}
        {images.length > 1 && (
          <>
            <motion.button
              onClick={prevImage}
              className="absolute left-1/2 top-4 -translate-x-1/2 p-3 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity z-10"
              style={{ backgroundColor: "rgba(255, 255, 255, 0.9)" }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onFocus={(e) => {
                e.currentTarget.style.opacity = "1";
                e.currentTarget.style.outline = "2px solid var(--color-primary)";
                e.currentTarget.style.outlineOffset = "2px";
              }}
              onBlur={(e) => {
                e.currentTarget.style.opacity = "0";
                e.currentTarget.style.outline = "none";
              }}
              aria-label="Previous image"
            >
              <FiChevronUp size={24} style={{ color: "var(--text-primary)" }} />
            </motion.button>
            <motion.button
              onClick={nextImage}
              className="absolute left-1/2 bottom-4 -translate-x-1/2 p-3 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity z-10"
              style={{ backgroundColor: "rgba(255, 255, 255, 0.9)" }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onFocus={(e) => {
                e.currentTarget.style.opacity = "1";
                e.currentTarget.style.outline = "2px solid var(--color-primary)";
                e.currentTarget.style.outlineOffset = "2px";
              }}
              onBlur={(e) => {
                e.currentTarget.style.opacity = "0";
                e.currentTarget.style.outline = "none";
              }}
              aria-label="Next image"
            >
              <FiChevronDown size={24} style={{ color: "var(--text-primary)" }} />
            </motion.button>
          </>
        )}

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
            <span className="text-sm text-white">
              {selectedIndex + 1} / {images.length}
            </span>
          </div>
        )}
      </div>

      {/* Thumbnail Gallery */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {images.map((image, index) => (
            <motion.button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                index === selectedIndex ? "border-opacity-100" : "border-opacity-0"
              }`}
              style={{
                borderColor: index === selectedIndex ? "var(--color-primary)" : "transparent",
                backgroundColor: "var(--bg-tertiary)",
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <img
                src={image}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
