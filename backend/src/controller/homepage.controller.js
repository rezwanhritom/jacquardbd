import HomepageMedia from "../models/HomepageMedia.js";
import { getImageKit, isImageKitConfigured } from "../config/imagekit.js";

const LOCAL_VIDEOS = [
  "IMG_5672.MP4",
  "IMG_6616.MP4",
  "IMG_6618.MP4",
  "IMG_7094.MP4",
  "IMG_7137.MP4",
  "IMG_7173.MP4",
];

const VIDEO_MIMES = new Set([
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "video/x-m4v",
]);

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

/** Seed bundled lookbook clips once so the homepage has real store video. */
async function ensureDefaultVideos() {
  const existing = await HomepageMedia.countDocuments({ slot: "video" });
  if (existing > 0) return;
  await HomepageMedia.insertMany(
    LOCAL_VIDEOS.map((fileName, index) => ({
      slot: "video",
      mediaType: "video",
      url: `/videos/${fileName}`,
      fileId: "",
      title: "",
      enabled: true,
      sortOrder: index,
    }))
  );
}

/**
 * GET /api/homepage
 * Public. Enabled hero slides and videos, sorted for display.
 */
export async function getPublicHomepageMedia(req, res, next) {
  try {
    await ensureDefaultVideos();
    const items = await HomepageMedia.find({ enabled: true }).sort({ sortOrder: 1, createdAt: 1 }).lean();
    const { hero, videos } = splitBySlot(items.map(serialize));
    res.json({ success: true, hero, videos });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/homepage/admin
 * Admin. All homepage media, including disabled items.
 */
export async function getAdminHomepageMedia(req, res, next) {
  try {
    await ensureDefaultVideos();
    const items = await HomepageMedia.find({}).sort({ slot: 1, sortOrder: 1, createdAt: 1 }).lean();
    const { hero, videos } = splitBySlot(items.map(serialize));
    res.json({ success: true, hero, videos });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/homepage/upload
 * Admin. Upload one or more images/videos for hero or video slots.
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

    const imagekit = getImageKit();
    const last = await HomepageMedia.findOne({ slot }).sort({ sortOrder: -1 }).lean();
    let sortOrder = last?.sortOrder != null ? last.sortOrder + 1 : 0;
    const created = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const isVideo = VIDEO_MIMES.has(file.mimetype) || file.mimetype?.startsWith("video/");
      const ext = (file.originalname && file.originalname.split(".").pop()) || (file.mimetype && file.mimetype.split("/")[1]) || (isVideo ? "mp4" : "jpg");
      const result = await imagekit.upload({
        file: file.buffer,
        fileName: `home_${slot}_${Date.now()}_${i}.${ext}`,
        folder: "homepage",
        useUniqueFileName: true,
      });
      if (!result?.url) continue;
      const doc = await HomepageMedia.create({
        slot,
        mediaType: isVideo ? "video" : "image",
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
    next(err);
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
    if (req.body.slot === "hero" || req.body.slot === "video") item.slot = req.body.slot;
    await item.save();
    res.json({ success: true, item: serialize(item) });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/homepage/:id
 * Admin. Remove a media item. ImageKit files are deleted when a fileId is stored.
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
        /* local or already-removed files should still leave the database */
      }
    }
    await HomepageMedia.deleteOne({ _id: id });
    res.json({ success: true, message: "Media deleted" });
  } catch (err) {
    next(err);
  }
}
