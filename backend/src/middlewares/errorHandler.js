/**
 * Centralized error handling middleware.
 * Use proper HTTP status codes and return validation/error messages.
 */
export function errorHandler(err, req, res, next) {
  const status = err.statusCode || err.status || 500;
  const message = err.message || "Internal server error";
  const isProduction = process.env.NODE_ENV === "production";

  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: Object.values(err.errors).map((e) => e.message),
    });
  }
  if (err.code === 11000) {
    const field = err.keyPattern?.email ? "email" : "slug";
    return res.status(409).json({
      success: false,
      message: "Duplicate value",
      errors: [field === "email" ? "Email already registered" : "A product with this slug already exists"],
    });
  }

  res.status(status).json({
    success: false,
    message: isProduction && status === 500 ? "Internal server error" : message,
    ...(Array.isArray(err.errors) && err.errors.length > 0 && { errors: err.errors }),
  });
}
