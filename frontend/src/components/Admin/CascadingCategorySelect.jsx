import { useState, useEffect } from "react";
import { motion } from "framer-motion";

/**
 * Get node at path in tree (path = array of keys).
 */
function getNode(tree, path) {
  let node = tree;
  for (const key of path) {
    node = node?.[key];
  }
  return node;
}

/**
 * Get options for a node: object -> keys (branch), array -> items (leaf).
 * Handles empty arrays/objects.
 */
function getOptionsForNode(node) {
  if (node === undefined || node === null) return { options: [], isLeaf: false };
  if (Array.isArray(node)) return { options: node, isLeaf: true };
  if (typeof node === "object") return { options: Object.keys(node), isLeaf: false };
  return { options: [], isLeaf: false };
}

/**
 * Cascading category dropdowns driven by categoryTree JSON.
 * value = full path string e.g. "Male > Winter Wear > Jackets > Leather Jacket"
 * onChange(fullPath) when a final (leaf) item is selected.
 */
export default function CascadingCategorySelect({ categoryTree, value, onChange, error }) {
  const [path, setPath] = useState(() => (value ? value.split(" > ").filter(Boolean) : []));

  useEffect(() => {
    setPath(value ? value.split(" > ").filter(Boolean) : []);
  }, [value]);

  const handleSelect = (levelIndex, selected, isLeafAtLevel) => {
    const newPath = path.slice(0, levelIndex).concat(selected);
    const nextNode = getNode(categoryTree, newPath);
    const isCompletePath = isLeafAtLevel || (Array.isArray(nextNode) && nextNode.length === 0);

    setPath(newPath);

    if (isCompletePath) {
      const fullPath = newPath.join(" > ");
      onChange(fullPath);
      if (typeof console !== "undefined" && console.log) {
        console.log("Category selection path:", fullPath);
      }
    } else {
      onChange("");
    }
  };

  const baseInputStyle = {
    borderColor: error ? "var(--color-tertiary)" : "var(--border-primary)",
    backgroundColor: "var(--bg-primary)",
    color: "var(--text-primary)",
  };
  const placeholderColor = "var(--text-tertiary)";

  const levels = [];
  let currentPath = [];

  for (let i = 0; i <= path.length; i++) {
    const node = i === 0 ? categoryTree : getNode(categoryTree, path.slice(0, i));
    const { options, isLeaf } = getOptionsForNode(node);

    if (options.length === 0 && i > 0) break;

    const levelValue = path[i] ?? "";
    const levelKey = `level-${i}`;

    levels.push(
      <div key={levelKey} className="space-y-1">
        <label className="block text-xs font-medium" style={{ color: "var(--text-tertiary)" }}>
          {i === 0 ? "Gender" : isLeaf ? "Item" : `Level ${i + 1}`}
        </label>
        <select
          value={levelValue}
          onChange={(e) => handleSelect(i, e.target.value, isLeaf)}
          className="w-full px-4 py-2.5 border-2 rounded-lg outline-none transition-colors text-sm appearance-none cursor-pointer"
          style={{
            ...baseInputStyle,
            color: levelValue ? baseInputStyle.color : placeholderColor,
          }}
          onFocus={(e) => (e.target.style.borderColor = "var(--color-primary)")}
          onBlur={(e) => (e.target.style.borderColor = error ? "var(--color-tertiary)" : "var(--border-primary)")}
        >
          <option value="">
            {options.length === 0 ? "No options" : i === 0 ? "Select gender" : isLeaf ? "Select item" : "Select..."}
          </option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>
    );

    if (levelValue) currentPath.push(levelValue);
    if (isLeaf && levelValue) break;
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3">{levels}</div>
      {path.length > 0 && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm font-medium pt-1"
          style={{ color: "var(--color-primary)" }}
        >
          {path.join(" > ")}
        </motion.p>
      )}
      {error && (
        <p className="text-xs mt-1 flex items-center gap-1" style={{ color: "var(--color-tertiary)" }}>
          {error}
        </p>
      )}
    </div>
  );
}
