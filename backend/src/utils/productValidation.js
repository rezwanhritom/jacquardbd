/**
 * Validate product creation payload (JSON body).
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
  if (body.price === undefined || body.price === null || body.price === "") {
    errors.push("Price is required");
  } else {
    const num = Number(body.price);
    if (Number.isNaN(num) || num < 0) {
      errors.push("Price must be a non-negative number");
    }
  }
  return {
    valid: errors.length === 0,
    errors,
  };
}
