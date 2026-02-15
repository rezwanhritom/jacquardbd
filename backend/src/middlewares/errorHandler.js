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
    return res.status(409).json({
      success: false,
      message: "Duplicate value",
      errors: ["A product with this slug already exists"],
    });
  }
  if (err.code === "LIMIT_FILE_SIZE" || err.message?.includes("File too large")) {
    return res.status(400).json({ success: false, message: "File too large. Max 5MB allowed." });
  }
  if (err.message?.includes("Invalid file type")) {
    return res.status(400).json({ success: false, message: err.message });
  }

  res.status(status).json({
    success: false,
    message: isProduction && status === 500 ? "Internal server error" : message,
    ...(Array.isArray(err.errors) && err.errors.length > 0 && { errors: err.errors }),
  });
}
