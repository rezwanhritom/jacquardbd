/**
 * Price and discount utilities for product creation/update.
 * Keeps pricing logic in one place for consistency and reuse.
 */

const PERCENT_MAX = 100;
const PERCENT_MIN = 0;

/**
 * Parse original price from request body (number or string).
 * @returns {number|null} Non-negative number or null if missing/invalid.
 */
export function parseOriginalPrice(value) {
  if (value === undefined || value === null || value === "") return null;
  const num = Number(value);
  if (Number.isNaN(num) || num < 0) return null;
  return num;
}

/**
 * Parse discount percentage (0–100) from request body.
 * @returns {number} Clamped 0–100.
 */
export function parseDiscount(value) {
  if (value === undefined || value === "") return 0;
  const num = Number(value);
  if (Number.isNaN(num)) return 0;
  return Math.min(PERCENT_MAX, Math.max(PERCENT_MIN, num));
}

/**
 * Compute final price from original price and discount percentage.
 * @param {number|null} originalPrice
 * @param {number} discountPercent 0–100
 * @returns {number|null} Rounded to 2 decimals, or null if originalPrice is null.
 */
export function computeFinalPrice(originalPrice, discountPercent) {
  if (originalPrice == null || Number.isNaN(originalPrice)) return originalPrice;
  if (!discountPercent) return originalPrice;
  const final = originalPrice * (1 - discountPercent / 100);
  return Math.round(final * 100) / 100;
}

/**
 * Resolve selling price: finalPrice if set, else originalPrice.
 * Used when persisting product (price field).
 */
export function resolveSellingPrice(originalPrice, discountPercent) {
  const final = computeFinalPrice(originalPrice, discountPercent);
  return final != null ? final : originalPrice;
}
