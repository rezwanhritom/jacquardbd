# Deployment verification checklist

Use this **after** each deployment step to confirm everything works before moving on.

---

## 1. Backend environment (cPanel Node.js app)

- [ ] In cPanel → **Setup Node.js App** → **Environment variables**, you have at least:
  - `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`
  - `CORS_ORIGIN=https://jacquardbd.com,https://www.jacquardbd.com`
  - `FRONTEND_URL=https://jacquardbd.com`
  - ImageKit: `IMAGEKIT_*`
  - Google: `GOOGLE_CLIENT_ID`
  - SMTP: `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`
- [ ] **Do not** set `PORT` unless your host requires it (cPanel usually injects it).
- [ ] Application root = folder that contains `package.json` and `src/server.js` (e.g. `jacquardwebsite`).
- [ ] Startup file = `src/server.js`.

---

## 2. Backend running (Node + MongoDB)

- [ ] In cPanel → **Setup Node.js App**, status is **Started**.
- [ ] Run **NPM Install** (or ensure `node_modules` is present on the server).
- [ ] If the app keeps stopping: check **application / error logs** for `MONGO_URI` or MongoDB connection errors. If MongoDB fails, the process exits and the proxy will return **503**.

**Quick check (once proxy is correct):**  
Open in browser: `https://api.jacquardbd.com/api/products`  
- **200** and JSON (product list or `[]`) → Node app is responding.  
- **503** → Proxy can’t reach Node (app not listening or wrong port).  
- **404** → Request not reaching Node (proxy not forwarding, or wrong path).

---

## 3. Proxy / subdomain (api.jacquardbd.com)

- [ ] **api.jacquardbd.com** is pointed to the Node.js application (reverse proxy), **not** to a static document root that serves your backend folder (no directory listing, no `src/` or `stderr.log` publicly visible).
- [ ] Requests to `https://api.jacquardbd.com/api/*` are proxied to the port where Node is listening (the port cPanel shows for the app).
- [ ] You have asked support to confirm: “api.jacquardbd.com should only reverse-proxy to the Node app; do not serve the app directory as static files.”

---

## 4. Frontend environment (before build)

- [ ] Production `.env` (or build-time env) has:
  - `VITE_API_URL=https://api.jacquardbd.com` (no trailing slash)
  - `VITE_GOOGLE_CLIENT_ID=` (same as backend / Google Console)
- [ ] You run the build **after** setting these so they are baked into the build.

---

## 5. Frontend build and upload

- [ ] In project: `cd frontend` → `npm run build`.
- [ ] Upload contents of `frontend/dist` to the **document root** of `jacquardbd.com` (e.g. `public_html`), not into a subdirectory (unless you want the site at `jacquardbd.com/subdir`).
- [ ] Main domain (`jacquardbd.com` / `www.jacquardbd.com`) serves the React app (e.g. `index.html` for all routes if using client-side routing).

---

## 6. Live checks (browser / DevTools)

Do these in order. All URLs over **HTTPS** in production.

| Step | What to do | Expected |
|------|-------------|----------|
| 6.1 | Open `https://api.jacquardbd.com/api/products` (or `?gender=men`) | 200, JSON product list (or empty array) |
| 6.2 | Open `https://jacquardbd.com` | Your React app loads (home page). |
| 6.3 | On the site: open a page that loads products (e.g. Men / Winter wear). | Products load; no CORS or network errors in Console. |
| 6.4 | Try **Login** (email or Google if configured). | Login works and session persists as expected. |

If 6.1 fails with **503**: Node not reachable (see section 2 and 3).  
If 6.1 is **404**: Proxy not forwarding to Node (see section 3).  
If 6.4 shows **CORS** errors: backend `CORS_ORIGIN` must include the exact origin (e.g. `https://www.jacquardbd.com`).

---

## 7. Optional: Google Sign-In and email

- [ ] In **Google Cloud Console**, **Authorized JavaScript origins** include `https://jacquardbd.com` and `https://www.jacquardbd.com` (and API URL if needed).
- [ ] Test “Sign in with Google” on the live site.
- [ ] If you use email verification or contact forms, send a test and confirm SMTP works (check backend logs if it fails).

---

## Summary

1. Backend env and startup file correct → app can start.  
2. MongoDB connects → app stays up; if it fails, you get 503.  
3. Proxy forwards api.jacquardbd.com to Node → `/api/health` and `/api/products` return 200.  
4. Frontend built with `VITE_API_URL=https://api.jacquardbd.com` → site calls the right API.  
5. Run the live checks above after each change to confirm everything works.
