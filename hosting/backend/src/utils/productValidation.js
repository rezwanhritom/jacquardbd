/**
 * Validate product creation payload (JSON body).
 * Accepts originalPrice + discount; price is optional (computed as finalPrice).
 * Returns { valid: boolean, errors: string[] }.
 */
export function validateProductBody(body) {
  const errors = [];
  if (!body || typeof body !== "object") {
    return { valid: false, errors: ["Invalid request body"] };
  }
  if (!body.name || typeof body.name !== "string" || !body.name.trim()) {
    errors.push("Product name is required");
  }
  const originalPriceRaw = body.originalPrice;
  const originalPrice = originalPriceRaw !== undefined && originalPriceRaw !== null && originalPriceRaw !== "" ? Number(originalPriceRaw) : NaN;
  if (Number.isNaN(originalPrice) || originalPrice < 0) {
    errors.push("Original price is required and must be a non-negative number");
  }
  const discount = body.discount !== undefined && body.discount !== "" ? Number(body.discount) : 0;
  if (!Number.isNaN(discount) && (discount < 0 || discount > 100)) {
    errors.push("Discount must be between 0 and 100");
  }
  return {
    valid: errors.length === 0,
    errors,
  };
}
