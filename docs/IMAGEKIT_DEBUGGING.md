# ImageKit Upload – Step-by-Step Debugging Guide

This guide explains why product images were not uploading to ImageKit and how to verify the full flow.

---

## 1. What Was Wrong

### Root cause: **Upload was never triggered from the frontend**

- **Product creation** (POST `/api/products`) was working and only sends JSON. It does not send files.
- **Image upload** (POST `/api/images/upload/product/:productId`) was implemented correctly on the backend but **never called** after creating a product.
- The admin form stored selected image files in React state (`images` with `{ id, file, url, isPrimary }`) but on submit it only called `createProductApi(payload)` and then navigated away. The `file` objects were never sent to the server.

So:

- The image did not appear in ImageKit because no upload request was made.
- The image URL was not saved because the upload API (which updates the product’s `images` array) was never run.
- You saw no frontend errors because the frontend was not attempting the upload.

### Secondary fix: **Middleware signature**

- `ensureImageKit` was defined as `(res, next)` but Express passes `(req, res, next)`. The first parameter is actually `req`, so the middleware could behave incorrectly when ImageKit was not configured. It was fixed to `(req, res, next)`.

---

## 2. Correct Flow (After Fix)

1. User fills the product form and selects one or more images in the Media section.
2. User clicks **Save** or **Save as draft**.
3. **Frontend** sends JSON to `POST /api/products` (create product).
4. Backend creates the product with a default placeholder image and returns `{ product: { _id, ... } }`.
5. **Frontend** checks:
   - If `result.product._id` exists **and** there are selected image files in `images` (each with a `file` that is a `File` instance).
6. If yes, **frontend** builds `FormData`, appends each file under the field name **`images`**, and calls:
   - `POST /api/images/upload/product/:productId`
   - With `credentials: "include"` (so admin cookie is sent).
7. **Backend** (multer) parses the multipart body and puts files in `req.files`.
8. **Backend** (image controller) uploads each file to ImageKit, then updates the product’s `images` array in MongoDB (replace if only default placeholder, otherwise append).
9. Frontend shows success (or “product created but image upload failed” if the upload request fails) and navigates to the product list.

So the upload **only runs when the frontend explicitly calls the upload API** after a successful product create, with the new product’s `_id` and the selected files.

---

## 3. Backend Checks

### 3.1 ImageKit configuration

- In backend `.env` you must have:
  - `IMAGEKIT_PUBLIC_KEY`
  - `IMAGEKIT_PRIVATE_KEY`
  - `IMAGEKIT_URL_ENDPOINT`
- At startup, or on first upload, the backend uses these in `config/imagekit.js` and `getImageKit()` / `isImageKitConfigured()`.
- If any of these are missing, `GET /api/images/upload-params` and `POST /api/images/upload/product/:productId` return **503** with “Image upload service not configured”.

**Log to add (optional):** In `config/imagekit.js`, log (only in dev) whether all three env vars are set, e.g.:

```js
if (process.env.NODE_ENV !== "production") {
  console.log("[ImageKit] configured:", !!publicKey && !!privateKey && !!urlEndpoint);
}
```

### 3.2 Upload API route and multer

- Route: `POST /api/images/upload/product/:productId`
- Middleware order: `protect` → `imageKitReady` → `requireRole(["admin"])` → multer (`.array("images", 10)`) → `uploadProductImages` controller.
- Multer expects the field name **`images`** and stores files in **`req.files`** (array).
- If the client sends files under a different field name, `req.files` will be empty and the controller returns **400** “No files uploaded”.

**Logs already added:** In `image.controller.js`, in non-production you should see:

- `[ImageKit] uploadProductImages called { filesCount, productId }`
- For each file: `[ImageKit] uploaded file N <url>`
- On error: `[ImageKit] upload error <message>`

If you never see `uploadProductImages called`, the request is not reaching the controller (auth, route, or multer rejecting).

### 3.3 Auth (cookies)

- `/api/images/*` is protected with `protect` and (for upload) `requireRole(["admin"])`.
- The frontend must send cookies: `fetch(..., { credentials: "include" })`.
- If the user is not logged in as admin, the backend returns **401** or **403** and the upload never runs.

**Check:** In browser DevTools → Network, select the `upload/product/...` request and confirm:

- Request has `Cookie` header.
- Response is not 401/403.

---

## 4. Frontend Checks

### 4.1 Upload is triggered

- After `createProductApi` succeeds, the code gets `productId = result.product._id` and `filesToUpload = images.filter(...).map(img => img.file)`.
- Only if **both** `productId` and `filesToUpload.length > 0` does it call `uploadProductImagesApi(productId, filesToUpload)`.
- So: if the user did not add any image in the Media section, or the state only has preview URLs and no `File` objects, the upload API is intentionally not called.

**Log to add (optional):** Before calling the upload API:

```js
console.log("Uploading images", { productId, fileCount: filesToUpload.length });
```

### 4.2 FormData and field name

- The upload API builds `FormData` and appends each file as **`images`** (same name for all; multer’s `.array("images")` expects this).
- Do **not** set `Content-Type` header; the browser will set `multipart/form-data` with the correct boundary.

### 4.3 Credentials

- The upload `fetch` uses `credentials: "include"` so the session cookie is sent. Without this, the backend will reject the request (401/403).

---

## 5. Logs to Add for Debugging (Summary)

| Where | Log | When |
|-------|-----|------|
| Backend `config/imagekit.js` | Log whether all three env vars are set | Once at startup (dev only). |
| Backend `image.controller.js` | Already added: `uploadProductImages called` with `filesCount`, `productId` | Every time the controller runs. |
| Backend `image.controller.js` | Already added: `uploaded file N` and `upload error` | Per file and on catch. |
| Frontend `ProductCreate` | Optional: `productId`, `filesToUpload.length` before calling upload | When submit runs after product create. |
| Network tab | Inspect `POST /api/images/upload/product/:productId`: body (Form Data with `images`), headers (Cookie), status | When creating a product with images. |

---

## 6. Corrected Implementation Summary

- **Backend**
  - `ensureImageKit(req, res, next)` – fixed signature.
  - `uploadProductImages` – debug logs in non-production; replace default single image when uploading for the first time; clearer error when no URLs returned.
- **Frontend**
  - `productApi.js`: new `uploadProductImages(productId, files)` that sends `FormData` with field name `images` and `credentials: "include"`.
  - `ProductCreate.jsx`: after successful `createProductApi`, if there are selected files, call `uploadProductImagesApi(productId, filesToUpload)`, then show success or “product created but image upload failed” and navigate.

With these in place, creating a product with images will:

1. Create the product.
2. Upload the selected files to ImageKit.
3. Save the returned ImageKit URLs on the product and show them on the site.

Use the logs and Network tab as above to confirm each step.
