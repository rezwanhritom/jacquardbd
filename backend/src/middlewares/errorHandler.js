/**
 * Centralized error handling middleware.
 * Use proper HTTP status codes and return validation/error messages.
 */
import { mediaUploadError } from "../utils/mediaUploadError.js";

export function errorHandler(err, req, res, next) {
  const looksLikeImageKit = Boolean(err?.help) || /cannot be authenticated|expired private api key/i.test(String(err?.message || ""));
  const mapped = looksLikeImageKit ? mediaUploadError(err) : null;
  const status = mapped?.status || err.statusCode || err.status || 500;
  const message = mapped?.message || err.message || err.help || "Internal server error";
  if (status >= 500) {
    console.error("[error]", req.method, req.originalUrl, message);
  }
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
  if (err.code === "LIMIT_FILE_SIZE" || err.message?.includes("File too large")) {
    return res.status(400).json({ success: false, message: "File too large." });
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
