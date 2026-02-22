import ImageKit from "imagekit";

const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;

if (process.env.NODE_ENV !== "production") {
  const ok = !!(publicKey && privateKey && urlEndpoint);
  console.log("[ImageKit] configured:", ok, "| publicKey length:", publicKey?.length ?? 0, "| urlEndpoint:", urlEndpoint ? "set" : "missing");
}

let instance = null;

export function getImageKit() {
  if (!instance) {
    if (!publicKey || !privateKey || !urlEndpoint) {
      throw new Error("IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, and IMAGEKIT_URL_ENDPOINT must be set");
    }
    instance = new ImageKit({ publicKey, privateKey, urlEndpoint });
  }
  return instance;
}

export function isImageKitConfigured() {
  return Boolean(publicKey && privateKey && urlEndpoint);
}
