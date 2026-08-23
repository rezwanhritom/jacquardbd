import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { fadeInUp } from "../../utils/animations";
import { FiUpload, FiTrash2, FiImage, FiFilm } from "react-icons/fi";
import toast from "react-hot-toast";
import {
  getAdminHomepage,
  uploadHomepageMedia,
  updateHomepageMedia,
  deleteHomepageMedia,
} from "../../services/homepage.service";

const MediaCard = ({ item, onToggle, onDelete, busyId }) => {
  const isVideo = item.mediaType === "video";
  const busy = busyId === item._id;
  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ borderColor: "var(--border-primary)", backgroundColor: "var(--bg-primary)" }}
    >
      <div className="relative h-40 bg-neutral-200">
        {isVideo ? (
          <video src={item.url} className="w-full h-full object-cover" muted playsInline preload="metadata" />
        ) : (
          <img src={item.url} alt={item.title || ""} className="w-full h-full object-cover" />
        )}
        <span
          className="absolute top-2 left-2 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded text-white"
          style={{ backgroundColor: "var(--color-primary)" }}
        >
          {isVideo ? "Video" : "Photo"}
        </span>
      </div>
      <div className="p-3 flex items-center justify-between gap-2">
        <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: "var(--text-primary)" }}>
          <input
            type="checkbox"
            checked={!!item.enabled}
            disabled={busy}
            onChange={() => onToggle(item)}
          />
          Show on site
        </label>
        <button
          type="button"
          disabled={busy}
          onClick={() => onDelete(item)}
          className="p-2 rounded-lg text-red-600 hover:bg-red-50"
          aria-label="Delete"
        >
          <FiTrash2 size={16} />
        </button>
      </div>
    </div>
  );
};

const UploadRow = ({ slot, label, uploading, onUpload }) => {
  const inputRef = useRef(null);
  return (
    <div className="flex flex-wrap items-center gap-3 mb-4">
      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white"
        style={{ backgroundColor: "var(--color-primary)", opacity: uploading ? 0.7 : 1 }}
      >
        <FiUpload size={16} />
        {uploading ? "Uploading…" : label}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={slot === "hero" ? "image/*,video/mp4,video/quicktime,video/webm" : "video/*,image/*"}
        multiple
        className="hidden"
        onChange={(e) => {
          const files = e.target.files;
          if (files?.length) onUpload(slot, files);
          e.target.value = "";
        }}
      />
    </div>
  );
};

const AdminHomepage = () => {
  const [hero, setHero] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadingSlot, setUploadingSlot] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    setLoading(true);
    const result = await getAdminHomepage();
    if (result.success) {
      setHero(result.hero || []);
      setVideos(result.videos || []);
    } else {
      toast.error(result.message || "Failed to load homepage media");
      setHero([]);
      setVideos([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleUpload = async (slot, files) => {
    setUploadingSlot(slot);
    const result = await uploadHomepageMedia(slot, files);
    setUploadingSlot(null);
    if (result.success) {
      toast.success(slot === "hero" ? "Hero media uploaded." : "Videos uploaded.");
      load();
    } else {
      toast.error(result.message || "Upload failed");
    }
  };

  const handleToggle = async (item) => {
    setBusyId(item._id);
    const result = await updateHomepageMedia(item._id, { enabled: !item.enabled });
    setBusyId(null);
    if (result.success) {
      const apply = (list) => list.map((m) => (m._id === item._id ? { ...m, enabled: !item.enabled } : m));
      if (item.slot === "hero") setHero(apply);
      else setVideos(apply);
    } else {
      toast.error(result.message || "Could not update");
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm("Remove this from the homepage?")) return;
    setBusyId(item._id);
    const result = await deleteHomepageMedia(item._id);
    setBusyId(null);
    if (result.success) {
      toast.success("Removed.");
      if (item.slot === "hero") setHero((list) => list.filter((m) => m._id !== item._id));
      else setVideos((list) => list.filter((m) => m._id !== item._id));
    } else {
      toast.error(result.message || "Could not delete");
    }
  };

  if (loading) {
    return (
      <motion.div variants={fadeInUp} className="py-16 text-center" style={{ color: "var(--text-secondary)" }}>
        Loading homepage media...
      </motion.div>
    );
  }

  return (
    <motion.div variants={fadeInUp} className="space-y-10">
      <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
        Upload photos or videos for the hero and lookbook. Check <strong>Show on site</strong> on one or many items — all checked items appear. Unchecked items stay in this list but are hidden on the storefront.
      </p>

      <section>
        <div className="flex items-center gap-2 mb-3">
          <FiImage size={20} style={{ color: "var(--color-primary)" }} />
          <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
            Hero
          </h2>
        </div>
        <p className="text-sm mb-3" style={{ color: "var(--text-secondary)" }}>
          Photos or videos at the top of the homepage. Several can show at once as a rotating slideshow.
        </p>
        <UploadRow slot="hero" label="Upload hero media" uploading={uploadingSlot === "hero"} onUpload={handleUpload} />
        {hero.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
            No hero uploads yet. The storefront will use the default hero photo until you add one.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {hero.map((item) => (
              <MediaCard key={item._id} item={item} onToggle={handleToggle} onDelete={handleDelete} busyId={busyId} />
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center gap-2 mb-3">
          <FiFilm size={20} style={{ color: "var(--color-primary)" }} />
          <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
            Videos
          </h2>
        </div>
        <p className="text-sm mb-3" style={{ color: "var(--text-secondary)" }}>
          Lookbook clips on the homepage. Bundled store videos are listed here so you can show or hide each one. Upload more anytime.
        </p>
        <UploadRow slot="video" label="Upload videos" uploading={uploadingSlot === "video"} onUpload={handleUpload} />
        {videos.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
            No videos yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {videos.map((item) => (
              <MediaCard key={item._id} item={item} onToggle={handleToggle} onDelete={handleDelete} busyId={busyId} />
            ))}
          </div>
        )}
      </section>
    </motion.div>
  );
};

export default AdminHomepage;
