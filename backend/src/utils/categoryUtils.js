/**
 * Category path parsing for products.
 * Category is stored as full string (e.g. "Male > Winter Wear > Jackets") and as array for filtering.
 */

const PATH_SEPARATOR = " > ";

/**
 * Parse category string into path array for filtering (categoryPath).
 * @param {string} categoryStr - Full path e.g. "Male > Winter Wear > Jackets"
 * @returns {string[]} Trimmed segments, empty array if no string.
 */
export function parseCategoryPath(categoryStr) {
  if (!categoryStr || typeof categoryStr !== "string") return [];
  return categoryStr.split(PATH_SEPARATOR).map((s) => s.trim()).filter(Boolean);
}
