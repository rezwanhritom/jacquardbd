/**
 * ImageKit's Node SDK rejects with a plain object { message, help }, not Error.
 * Map those into a client-safe JSON response (never a generic 500).
 */
export function mediaUploadError(err) {
  const raw = String(err?.message || "");
  const lower = raw.toLowerCase();

  if (lower.includes("cannot be authenticated") || lower.includes("expired private api key")) {
    return {
      status: 502,
      message: "Upload failed. ImageKit API keys on the server are invalid or expired.",
    };
  }
  if (lower.includes("file size") || lower.includes("too large")) {
    return { status: 400, message: "That file is too large to upload." };
  }
  if (raw) {
    const cleaned = raw.split(/for support/i)[0].trim().replace(/[.\s]+$/, "");
    return { status: 502, message: cleaned ? `${cleaned}.` : "Upload failed. Please try again." };
  }
  return { status: 502, message: "Upload failed. Please try again." };
}

export function sendMediaUploadError(res, err) {
  const { status, message } = mediaUploadError(err);
  console.error("[upload]", message);
  return res.status(status).json({ success: false, message });
}
