# Jacquard BD – Deployment overview

Your stack (no MySQL on cPanel):

| Component    | What you use | Where it runs |
|------------|--------------|---------------|
| **Database** | **MongoDB Atlas** (cloud) | Already in cloud – keep using `MONGO_URI` in backend `.env`. No database to create in cPanel. |
| **Images**   | **ImageKit** | Cloud – keep `IMAGEKIT_PUBLIC_KEY`, `IMAGEKIT_PRIVATE_KEY`, `IMAGEKIT_URL_ENDPOINT` in backend `.env`. |
| **Auth**     | **JWT** (cookies) + **Google Sign-In** | Backend needs `JWT_SECRET`, `GOOGLE_CLIENT_ID`. Frontend needs `VITE_GOOGLE_CLIENT_ID`. For production, add `https://jacquardbd.com` (and API URL if different) to **Authorized JavaScript origins** in Google Cloud Console. |
| **Email**    | **Nodemailer** (Gmail SMTP) | Keep `SMTP_*` and `MAIL_FROM` in backend `.env`. |
| **Frontend** | Vite + React | Build with `npm run build` → upload `frontend/dist` contents to hosting (e.g. `public_html`). |
| **Backend**  | Node.js + Express | Must run on a **Node.js** server. cPanel: use “Setup Node.js App” / “Node.js Selector” if available; otherwise use a separate Node host (e.g. Railway, Render). |

Production env (summary):

- **Backend:** `MONGO_URI`, `PORT`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CORS_ORIGIN=https://jacquardbd.com` (and `https://www.jacquardbd.com` if you use www), `FRONTEND_URL=https://jacquardbd.com`, ImageKit vars, `GOOGLE_CLIENT_ID`, SMTP vars. Do **not** commit `.env`; set these in the host’s env/config.
- **Frontend:** `VITE_API_URL=https://your-api-url` (e.g. `https://api.jacquardbd.com` or your Node app URL), `VITE_GOOGLE_CLIENT_ID` (same as backend). Rebuild after changing.

Step-by-step deployment will follow in chat (one step at a time).
