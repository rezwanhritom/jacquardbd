import { motion } from "framer-motion";
import { FiCheck } from "react-icons/fi";

const availableColors = [
  { name: "Black", value: "#000000" },
  { name: "White", value: "#FFFFFF" },
  { name: "Navy", value: "#1e3a5f" },
  { name: "Gray", value: "#6b7280" },
  { name: "Red", value: "#dc2626" },
  { name: "Blue", value: "#2563eb" },
  { name: "Green", value: "#16a34a" },
  { name: "Yellow", value: "#eab308" },
  { name: "Pink", value: "#ec4899" },
  { name: "Purple", value: "#9333ea" },
  { name: "Orange", value: "#f97316" },
  { name: "Brown", value: "#78350f" },
  { name: "Beige", value: "#d4c4a8" },
  { name: "Olive", value: "#4d5c2e" },
];

const ColorSwatch = ({ selectedColors, setSelectedColors }) => {
  const toggleColor = (colorName) => {
    if (selectedColors.includes(colorName)) {
      setSelectedColors(selectedColors.filter((c) => c !== colorName));
    } else {
      setSelectedColors([...selectedColors, colorName]);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {availableColors.map((color) => {
          const isSelected = selectedColors.includes(color.name);
          const isLight = color.value === "#FFFFFF" || color.value === "#d4c4a8";

          return (
            <motion.button
              key={color.name}
              type="button"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => toggleColor(color.name)}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                isSelected ? "ring-2 ring-offset-2" : ""
              }`}
              style={{
                backgroundColor: color.value,
                ringColor: "var(--color-primary)",
                border: isLight ? "1px solid var(--border-primary)" : "none",
              }}
              title={color.name}
              aria-label={`${isSelected ? "Deselect" : "Select"} ${color.name}`}
            >
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <FiCheck
                    size={18}
                    strokeWidth={3}
                    color={isLight ? "#000" : "#fff"}
                  />
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>

      {selectedColors.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-2"
        >
          {selectedColors.map((colorName) => (
            <span
              key={colorName}
              className="text-xs px-2 py-1 rounded-full"
              style={{
                backgroundColor: "var(--bg-secondary)",
                color: "var(--text-secondary)",
              }}
            >
              {colorName}
            </span>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default ColorSwatch;
