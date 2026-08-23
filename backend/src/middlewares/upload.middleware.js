import multer from "multer";

const ALLOWED_MIMES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_FILES_PRODUCT = 10;
const MAX_FILES_PROFILE = 1;

const memoryStorage = multer.memoryStorage();

function fileFilter(req, file, cb) {
  if (!ALLOWED_MIMES.includes(file.mimetype)) {
    return cb(new Error(`Invalid file type. Allowed: ${ALLOWED_MIMES.join(", ")}`), false);
  }
  cb(null, true);
}

export const uploadProductImages = multer({
  storage: memoryStorage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE, files: MAX_FILES_PRODUCT },
}).array("images", MAX_FILES_PRODUCT);

export const uploadProfileImage = multer({
  storage: memoryStorage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE, files: MAX_FILES_PROFILE },
}).single("image");

export const uploadCampaignBanner = multer({
  storage: memoryStorage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE, files: 1 },
}).single("banner");

const HOMEPAGE_MIMES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "video/x-m4v",
];
const HOMEPAGE_MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB — lookbook videos
const HOMEPAGE_MAX_FILES = 8;

function homepageFileFilter(req, file, cb) {
  const slot = req.body?.slot;
  const isVideo = file.mimetype?.startsWith("video/");
  const isImage = file.mimetype?.startsWith("image/");
  if (slot === "hero") {
    if (!isImage) return cb(new Error("Hero only accepts photos (JPG, PNG, WEBP, GIF)."), false);
    return cb(null, true);
  }
  if (slot === "video") {
    if (!isVideo) return cb(new Error("Videos only accepts MP4, MOV, or WebM."), false);
    return cb(null, true);
  }
  if (!HOMEPAGE_MIMES.includes(file.mimetype) && !isVideo && !isImage) {
    return cb(new Error("Invalid file type."), false);
  }
  cb(null, true);
}

export const uploadHomepageMedia = multer({
  storage: memoryStorage,
  fileFilter: homepageFileFilter,
  limits: { fileSize: HOMEPAGE_MAX_FILE_SIZE, files: HOMEPAGE_MAX_FILES },
}).array("files", HOMEPAGE_MAX_FILES);

export const ALLOWED_MIMES_LIST = ALLOWED_MIMES;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE;
