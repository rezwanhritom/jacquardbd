import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiPlus } from "react-icons/fi";

const TagInput = ({ tags, setTags, placeholder = "Add a tag...", maxTags = 10 }) => {
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  const addTag = () => {
    const tag = inputValue.trim().toLowerCase();
    if (tag && !tags.includes(tag) && tags.length < maxTags) {
      setTags([...tags, tag]);
      setInputValue("");
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div className="space-y-2">
      <div
        className="flex flex-wrap gap-2 p-3 border-2 rounded-lg min-h-[50px] transition-colors focus-within:border-[var(--color-primary)]"
        style={{
          borderColor: "var(--border-primary)",
          backgroundColor: "var(--bg-primary)",
        }}
      >
        <AnimatePresence>
          {tags.map((tag) => (
            <motion.span
              key={tag}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium"
              style={{
                backgroundColor: "var(--color-primary)",
                color: "white",
              }}
            >
              {tag}
              <motion.button
                type="button"
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => removeTag(tag)}
                className="p-0.5 rounded-full hover:bg-white/20"
              >
                <FiX size={12} />
              </motion.button>
            </motion.span>
          ))}
        </AnimatePresence>

        {tags.length < maxTags && (
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={addTag}
            placeholder={tags.length === 0 ? placeholder : ""}
            className="flex-1 min-w-[120px] bg-transparent outline-none text-sm"
            style={{ color: "var(--text-primary)" }}
          />
        )}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
          Press Enter or comma to add • {tags.length}/{maxTags} tags
        </p>
        {inputValue && (
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={addTag}
            className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded"
            style={{ color: "var(--color-primary)" }}
          >
            <FiPlus size={12} />
            Add "{inputValue}"
          </motion.button>
        )}
      </div>
    </div>
  );
};

export default TagInput;
