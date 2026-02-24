/**
 * Generate a URL-safe slug from a string.
 * Used for product slugs; can be extended for uniqueness (e.g. append id) later.
 */
export function slugify(text) {
  if (!text || typeof text !== "string") return "";
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
