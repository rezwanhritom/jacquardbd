# Auth setup guide: Google Sign-In & email verification

Step-by-step instructions for configuring Google Sign-In and email verification in this MERN app. Do these once; then your app will work with real Google login and (optionally) real verification emails.

---

## Part 1: Google Cloud Console (get your Google Client ID)

### Step 1.1 – Open Google Cloud Console

1. Go to **https://console.cloud.google.com/**
2. Sign in with the Google account you want to use for managing the project (can be personal or work).

### Step 1.2 – Create a project (or pick an existing one)

1. At the top of the page, click the **project dropdown** (it shows the current project name or “Select a project”).
2. Click **“New Project”**.
3. **Project name:** e.g. `Jacquard` or `Jacquard Ecommerce`.
4. (Optional) Change **Organization** if you use one.
5. Click **“Create”**.
6. Wait until the project is created, then **select this project** from the dropdown so it’s the active project.

### Step 1.3 – Configure OAuth consent screen (required for “Sign in with Google”)

1. In the left sidebar, go to: **APIs & Services** → **OAuth consent screen** (or search “OAuth consent screen” in the top search bar).
2. Choose **External** (so any Google user can sign in). Click **Create**.
3. Fill only the **required** fields:
   - **App name:** e.g. `Jacquard`
   - **User support email:** your email (dropdown).
   - **Developer contact information:** your email.
4. Click **“Save and Continue”**.
5. **Scopes:** click **“Add or Remove Scopes”**. Add:
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
   - `openid`
   (Or leave default if they already include email and profile.)
6. Click **“Save and Continue”**.
7. **Test users:** you can skip for now (only needed if the app is in “Testing” and you add test users).
8. Click **“Back to Dashboard”**.

### Step 1.4 – Create OAuth 2.0 Client ID (this is what you put in .env)

1. In the left sidebar: **APIs & Services** → **Credentials**.
2. Click **“+ Create Credentials”** → **“OAuth client ID”**.
3. **Application type:** choose **“Web application”**.
4. **Name:** e.g. `Jacquard Web Client`.
5. **Authorized JavaScript origins** – add the URLs where your frontend runs (no trailing slash):
   - Local: `http://localhost:5173`
   - If you use another port for Vite: e.g. `http://localhost:3000`
   - Production: `https://yourdomain.com` (replace with your real domain).
6. **Authorized redirect URIs** – for this app we use the **ID token** flow (no redirect to Google and back), so you can leave this empty. If you later add a redirect-based flow, add the same origins here (e.g. `http://localhost:5173/`, `https://yourdomain.com/`).
7. Click **“Create”**.
8. A popup shows your **Client ID** and **Client secret**.
   - You only need the **Client ID** (looks like: `123456789-xxxx.apps.googleusercontent.com`).
   - Copy the **Client ID** and keep it for the next parts. You will put it in **two** places: backend `.env` and frontend `.env`.

---

## Part 2: Where to put the Google Client ID

You use the **same** Client ID in both backend and frontend.

### Step 2.1 – Backend

1. Open the **backend** `.env` file:  
   `jacquard/backend/.env`
2. Find or add this line:
   ```env
   GOOGLE_CLIENT_ID=
   ```
3. Paste your Client ID **after the `=`** (no quotes, no spaces):
   ```env
   GOOGLE_CLIENT_ID=123456789-xxxxxxxxxx.apps.googleusercontent.com
   ```
4. Save the file.

### Step 2.2 – Frontend

1. In the **frontend** folder, create a file named `.env` if it doesn’t exist:  
   `jacquard/frontend/.env`
2. Add (or update) this line with **the same** Client ID:
   ```env
   VITE_GOOGLE_CLIENT_ID=123456789-xxxxxxxxxx.apps.googleusercontent.com
   ```
   - The name **must** start with `VITE_` so Vite exposes it to the browser.
3. Save the file.
4. **Restart the frontend dev server** (stop and run `npm run dev` again) so it picks up the new env variable.

---

## Part 3: Frontend URL (for email verification links)

The backend sends verification emails that contain a link like:  
`http://localhost:5173/verify-email?token=...`  
It needs to know the base URL of your frontend.

### Step 3.1 – Backend `.env`

1. Open `jacquard/backend/.env`.
2. Set:
   - **Local development:**  
     `FRONTEND_URL=http://localhost:5173`  
     (Use your real Vite port if different, e.g. `http://localhost:3000`.)
   - **Production:**  
     `FRONTEND_URL=https://yourdomain.com`  
     (No trailing slash.)

So in `.env` you should have a line like:
```env
FRONTEND_URL=http://localhost:5173
```

---

## Part 4: Optional – send real verification emails (SMTP)

Without SMTP, the backend still creates users and verification tokens, but it **does not** send an email; it only **logs the verification link** in the terminal (good for local testing). To actually send emails, configure SMTP in the backend.

### Option A – Gmail (simple for testing)

1. Use a Gmail account.
2. Turn on **2-Step Verification** for that account (Google Account → Security).
3. Create an **App password**:  
   Google Account → Security → 2-Step Verification → App passwords → generate one for “Mail”.
4. In `jacquard/backend/.env` add (replace with your Gmail and app password):
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=yourname@gmail.com
   SMTP_PASS=your-16-char-app-password
   MAIL_FROM=yourname@gmail.com
   ```
5. Restart the backend server.

### Option B – Another provider (SendGrid, Mailgun, etc.)

Use the host, port, and credentials they give you, for example:

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
MAIL_FROM=noreply@yourdomain.com
```

Put these in `jacquard/backend/.env`. Restart the backend after changing.

---

## Part 5: Quick checklist

Before testing, confirm:

| What | Where | Value / action |
|------|--------|------------------|
| Google Client ID (backend) | `backend/.env` | `GOOGLE_CLIENT_ID=your-client-id` |
| Google Client ID (frontend) | `frontend/.env` | `VITE_GOOGLE_CLIENT_ID=your-client-id` (same as above) |
| Frontend URL | `backend/.env` | `FRONTEND_URL=http://localhost:5173` (or your URL) |
| API URL (frontend) | `frontend/.env` | `VITE_API_URL=http://localhost:5001` (or your backend URL) |
| SMTP (optional) | `backend/.env` | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM` |
| Authorized origins | Google Cloud Console → Credentials → your OAuth client | Include `http://localhost:5173` and your production URL |

After changing **any** `.env`:
- Restart the **backend** (`npm run dev` in `backend/`).
- Restart the **frontend** (`npm run dev` in `frontend/`) so it picks up `VITE_*` variables.

---

## Part 6: Testing

1. **Email/password sign-up**
   - Register with email and password.
   - You should be redirected to “Check your email”.
   - Without SMTP: copy the verification link from the **backend terminal** and open it in the browser.
   - With SMTP: open the link from your email.
   - Then go to Login and sign in.

2. **Google Sign-In**
   - On Login or Register, click “Continue with Google”.
   - Choose your Google account.
   - You should be logged in and redirected.

If something fails, double-check:
- Same Client ID in both backend and frontend `.env`.
- Authorized JavaScript origins in Google Console include the URL you’re actually using (e.g. `http://localhost:5173`).
- Backend and frontend servers restarted after editing `.env`.
