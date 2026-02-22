# MongoDB Atlas & Admin User Setup

## 1. Why you might not see data in Atlas

### Check your connection string

In `.env` you must have:

```env
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database_name>?retryWrites=true&w=majority
```

- **`<database_name>`** is the database where your app writes. If you omit it, MongoDB uses the default database name `test`.
- When the backend starts, it logs: **"MongoDB connected successfully. Database: &lt;name&gt;"** — that name is where your collections live.

### Where to look in Atlas

1. Open [MongoDB Atlas](https://cloud.mongodb.com) → your project → **Database** → **Browse Collections**.
2. Select the **database** that matches the one in the startup log (or `test` if your URI has no database name).
3. **Collections** are created when the app first writes:
   - **users** – from the User model (registration, login).
   - **products** – when you create products (admin).
   - **notes** – if the notes feature is used.

If the database or collection is missing, either:

- The app has not written to that database yet (e.g. wrong URI or no successful request), or
- The connection is failing (check backend console for "MongoDB connection error").

### Checklist

- [ ] `.env` has `MONGO_URI` with the correct cluster, username, password, and optional database name.
- [ ] In Atlas: **Network Access** → your current IP (or `0.0.0.0/0` for testing) is allowed.
- [ ] In Atlas: **Database Access** → the user has read/write on the database.
- [ ] Backend starts without "MongoDB connection error" and logs "MongoDB connected successfully. Database: ...".
- [ ] You registered at least once; then check the database name from the log and the **users** collection there.

---

## 2. How to set up an admin user

New accounts get **role: "user"** by default. Only **role: "admin"** can use admin-only APIs (e.g. create product, upload images).

You can make a user admin in either of these ways.

### Option A: Using the script (recommended)

From the **backend** folder:

```bash
npm run make-admin -- <email>
```

Example:

```bash
npm run make-admin -- your@email.com
```

Or run the script directly:

```bash
node scripts/make-admin.js your@email.com
```

- The user must already exist (you must have registered that email).
- The script sets **role** to **"admin"** for that user.
- Then log in on the website with that email; you’ll have admin access.

### Option B: Using MongoDB Atlas UI

1. In Atlas, open **Database** → **Browse Collections**.
2. Select the same **database** your app uses (see startup log).
3. Open the **users** collection.
4. Find the document for your account (match **email**).
5. Click **Edit** (pencil icon).
6. Find the **role** field and change it from **"user"** to **"admin"**.
7. Save.

Then log in again on the website; that account will be admin.

---

## 3. Quick reference

| Item              | Where / What |
|-------------------|--------------|
| Database name     | Shown in backend log: "MongoDB connected successfully. Database: &lt;name&gt;" (or from `MONGO_URI`). |
| Users collection  | `users` (in that database). |
| Role field        | `role`: `"user"` or `"admin"`. |
| Make admin (CLI) | `node scripts/make-admin.js <email>` from backend folder. |
| Make admin (UI)   | Atlas → Database → &lt;your db&gt; → **users** → edit document → set **role** to **"admin"**. |
