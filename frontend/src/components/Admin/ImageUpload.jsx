import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiUploadCloud, FiX, FiStar, FiImage, FiChevronLeft, FiChevronRight } from "react-icons/fi";

const ImageUpload = ({ images, setImages, maxImages = 8 }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith("image/")
    );
    handleFiles(files);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const handleFiles = (files) => {
    const remainingSlots = maxImages - images.length;
    const filesToAdd = files.slice(0, remainingSlots);

    const newImages = filesToAdd.map((file, index) => ({
      id: Date.now() + index,
      file,
      url: URL.createObjectURL(file),
      isPrimary: images.length === 0 && index === 0,
    }));

    setImages((prev) => [...prev, ...newImages]);
  };

  const removeImage = (id) => {
    setImages((prev) => {
      const filtered = prev.filter((img) => img.id !== id);
      // If removed image was primary, set first remaining as primary
      if (filtered.length > 0 && !filtered.some((img) => img.isPrimary)) {
        filtered[0].isPrimary = true;
      }
      return filtered;
    });
  };

  const setPrimaryImage = (id) => {
    setImages((prev) =>
      prev.map((img) => ({
        ...img,
        isPrimary: img.id === id,
      }))
    );
  };

  const moveImage = (fromIndex, direction) => {
    const toIndex = fromIndex + direction;
    if (toIndex < 0 || toIndex >= images.length) return;
    setImages((prev) => {
      const next = [...prev];
      [next[fromIndex], next[toIndex]] = [next[toIndex], next[fromIndex]];
      return next;
    });
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <motion.div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        animate={{
          scale: isDragging ? 1.02 : 1,
          borderColor: isDragging ? "var(--color-primary)" : "var(--border-primary)",
        }}
        className="relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors"
        style={{ backgroundColor: "var(--bg-secondary)" }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <motion.div
            animate={{ y: isDragging ? -5 : 0 }}
            className="mx-auto w-16 h-16 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "var(--bg-tertiary)" }}
          >
            <FiUploadCloud
              size={32}
              style={{ color: isDragging ? "var(--color-primary)" : "var(--text-tertiary)" }}
            />
          </motion.div>

          <div>
            <p className="text-lg font-medium" style={{ color: "var(--text-primary)" }}>
              {isDragging ? "Drop images here" : "Drag & drop images here"}
            </p>
            <p className="text-sm mt-1" style={{ color: "var(--text-tertiary)" }}>
              or click to browse • PNG, JPG, WEBP up to 5MB each
            </p>
          </div>

          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-2.5 rounded-lg font-medium text-sm"
            style={{
              backgroundColor: "var(--color-primary)",
              color: "white",
            }}
          >
            Select Files
          </motion.button>

          <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
            {images.length} / {maxImages} images uploaded • Use arrows on each image to reorder
          </p>
        </motion.div>
      </motion.div>

      {/* Image Preview Grid */}
      <AnimatePresence>
        {images.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <p className="text-xs font-medium" style={{ color: "var(--text-tertiary)" }}>
              Order: first image is primary. Use arrows to reorder.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {images.map((image, index) => (
                <motion.div
                  key={image.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: index * 0.02 }}
                  className="relative aspect-square rounded-lg overflow-hidden group"
                  style={{ backgroundColor: "var(--bg-tertiary)" }}
                >
                  <img
                    src={image.url}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-full object-cover"
                  />

                  {/* Position badge (order number) */}
                  <div
                    className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ backgroundColor: "rgba(0,0,0,0.6)", color: "white" }}
                  >
                    {index + 1}
                  </div>

                  {/* Primary badge */}
                  {image.isPrimary && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute top-2 left-2 px-2 py-1 rounded text-xs font-medium flex items-center gap-1"
                      style={{ backgroundColor: "var(--color-primary)", color: "white" }}
                    >
                      <FiStar size={12} />
                      Primary
                    </motion.div>
                  )}

                  {/* Hover overlay: reorder, set primary, remove */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-2"
                  >
                    <div className="flex items-center gap-1">
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => moveImage(index, -1)}
                        disabled={index === 0}
                        className="p-2 rounded-full bg-white/90 text-gray-800 disabled:opacity-40 disabled:cursor-not-allowed"
                        title="Move left (earlier in order)"
                      >
                        <FiChevronLeft size={16} />
                      </motion.button>
                      <span className="text-xs text-white font-medium px-1">{index + 1} of {images.length}</span>
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => moveImage(index, 1)}
                        disabled={index === images.length - 1}
                        className="p-2 rounded-full bg-white/90 text-gray-800 disabled:opacity-40 disabled:cursor-not-allowed"
                        title="Move right (later in order)"
                      >
                        <FiChevronRight size={16} />
                      </motion.button>
                    </div>
                    {!image.isPrimary && (
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setPrimaryImage(image.id)}
                        className="p-2 rounded-full bg-white text-gray-800"
                        title="Set as primary"
                      >
                        <FiStar size={16} />
                      </motion.button>
                    )}
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => removeImage(image.id)}
                      className="p-2 rounded-full bg-red-500 text-white"
                      title="Remove"
                    >
                      <FiX size={16} />
                    </motion.button>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state hint */}
      {images.length === 0 && (
        <div
          className="flex items-center gap-2 text-sm p-3 rounded-lg"
          style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-tertiary)" }}
        >
          <FiImage size={16} />
          <span>The first uploaded image will be set as the primary product image.</span>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
