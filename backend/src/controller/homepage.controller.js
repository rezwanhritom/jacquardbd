import HomepageMedia from "../models/HomepageMedia.js";
import { getImageKit, isImageKitConfigured } from "../config/imagekit.js";
import { sendMediaUploadError } from "../utils/mediaUploadError.js";

/** ImageKit DAM: homepage/photos = hero, homepage/videos = lookbook. */
const HERO_FOLDER = "homepage/photos";
const VIDEO_FOLDER = "homepage/videos";

const VIDEO_MIMES = new Set([
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "video/x-m4v",
]);

function isVideoFile(file) {
  return VIDEO_MIMES.has(file.mimetype) || file.mimetype?.startsWith("video/");
}

function isImageFile(file) {
  return file.mimetype?.startsWith("image/");
}

function serialize(doc) {
  if (!doc) return null;
  const item = typeof doc.toObject === "function" ? doc.toObject() : doc;
  return {
    _id: item._id,
    slot: item.slot,
    mediaType: item.mediaType,
    url: item.url,
    fileId: item.fileId || "",
    title: item.title || "",
    enabled: !!item.enabled,
    sortOrder: item.sortOrder ?? 0,
    createdAt: item.createdAt,
  };
}

function splitBySlot(items) {
  const hero = [];
  const videos = [];
  for (const item of items) {
    if (item.slot === "hero") hero.push(item);
    else videos.push(item);
  }
  return { hero, videos };
}

function isRemoteUrl(url) {
  return typeof url === "string" && /^https?:\/\//i.test(url);
}

/** Drop leftover local /videos and /home-hero records so the site is ImageKit-only. */
async function removeBundledLocalMedia() {
  await HomepageMedia.deleteMany({
    $or: [{ url: /^\/videos\// }, { url: /^\/home-hero/ }, { url: /^\/images\/home/ }],
  });
}

/**
 * GET /api/homepage
 * Public. Enabled ImageKit hero photos and lookbook videos, sorted for display.
 */
export async function getPublicHomepageMedia(req, res, next) {
  try {
    await removeBundledLocalMedia();
    const items = await HomepageMedia.find({ enabled: true }).sort({ sortOrder: 1, createdAt: 1 }).lean();
    const remote = items.map(serialize).filter((item) => isRemoteUrl(item.url));
    const { hero, videos } = splitBySlot(remote);
    res.json({ success: true, hero, videos });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/homepage/admin
 * Admin. All ImageKit homepage media, including disabled items.
 */
export async function getAdminHomepageMedia(req, res, next) {
  try {
    await removeBundledLocalMedia();
    const items = await HomepageMedia.find({}).sort({ slot: 1, sortOrder: 1, createdAt: 1 }).lean();
    const remote = items.map(serialize).filter((item) => isRemoteUrl(item.url));
    const { hero, videos } = splitBySlot(remote);
    res.json({ success: true, hero, videos });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/homepage/upload
 * Admin. Hero → ImageKit homepage/photos (images only).
 * Lookbook → ImageKit homepage/videos (videos only).
 * Body: slot=hero|video, files[] (multipart)
 */
export async function uploadHomepageMedia(req, res, next) {
  try {
    const slot = req.body?.slot === "hero" ? "hero" : req.body?.slot === "video" ? "video" : null;
    if (!slot) {
      return res.status(400).json({ success: false, message: "slot must be hero or video" });
    }
    const files = req.files?.length ? req.files : req.file ? [req.file] : [];
    if (!files.length) {
      return res.status(400).json({ success: false, message: "No files uploaded" });
    }
    if (!isImageKitConfigured()) {
      return res.status(503).json({ success: false, message: "Image upload service not configured" });
    }

    if (slot === "hero") {
      const invalid = files.filter((file) => !isImageFile(file));
      if (invalid.length) {
        return res.status(400).json({
          success: false,
          message: "Hero only accepts photos (JPG, PNG, WEBP, GIF).",
        });
      }
    } else {
      const invalid = files.filter((file) => !isVideoFile(file));
      if (invalid.length) {
        return res.status(400).json({
          success: false,
          message: "Videos only accepts MP4, MOV, or WebM.",
        });
      }
    }

    const imagekit = getImageKit();
    const folder = slot === "hero" ? HERO_FOLDER : VIDEO_FOLDER;
    const last = await HomepageMedia.findOne({ slot }).sort({ sortOrder: -1 }).lean();
    let sortOrder = last?.sortOrder != null ? last.sortOrder + 1 : 0;
    const created = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const video = isVideoFile(file);
      const ext = String(
        (file.originalname && file.originalname.split(".").pop()) ||
          (file.mimetype && file.mimetype.split("/")[1]) ||
          (video ? "mp4" : "jpg")
      )
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "") || (video ? "mp4" : "jpg");
      const result = await imagekit.upload({
        file: file.buffer,
        fileName: `${slot}_${Date.now()}_${i}.${ext}`,
        folder,
      });
      if (!result?.url) continue;
      const doc = await HomepageMedia.create({
        slot,
        mediaType: video ? "video" : "image",
        url: result.url,
        fileId: result.fileId || "",
        title: "",
        enabled: true,
        sortOrder: sortOrder++,
      });
      created.push(serialize(doc));
    }

    if (!created.length) {
      return res.status(500).json({ success: false, message: "Upload failed" });
    }
    res.status(201).json({ success: true, message: "Media uploaded", items: created });
  } catch (err) {
    return sendMediaUploadError(res, err);
  }
}

/**
 * PATCH /api/homepage/:id
 * Admin. Toggle visibility, title, or sort order. Multiple items may stay enabled.
 */
export async function updateHomepageMedia(req, res, next) {
  try {
    const { id } = req.params;
    const item = await HomepageMedia.findById(id);
    if (!item) return res.status(404).json({ success: false, message: "Media not found" });

    if (typeof req.body.enabled === "boolean") item.enabled = req.body.enabled;
    if (typeof req.body.title === "string") item.title = req.body.title.trim();
    if (req.body.sortOrder != null && Number.isFinite(Number(req.body.sortOrder))) {
      item.sortOrder = Number(req.body.sortOrder);
    }
    await item.save();
    res.json({ success: true, item: serialize(item) });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/homepage/:id
 * Admin. Remove a media item and delete it from ImageKit when a fileId is stored.
 */
export async function deleteHomepageMedia(req, res, next) {
  try {
    const { id } = req.params;
    const item = await HomepageMedia.findById(id);
    if (!item) return res.status(404).json({ success: false, message: "Media not found" });

    if (item.fileId && isImageKitConfigured()) {
      try {
        const imagekit = getImageKit();
        await imagekit.deleteFile(item.fileId);
      } catch (_) {
        /* already-removed ImageKit files should still leave the database */
      }
    }
    await HomepageMedia.deleteOne({ _id: id });
    res.json({ success: true, message: "Media deleted" });
  } catch (err) {
    next(err);
  }
}
