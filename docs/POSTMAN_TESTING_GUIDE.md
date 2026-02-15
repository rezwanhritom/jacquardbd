# Postman Testing Guide

This guide covers testing all backend APIs in Postman, including auth (cookie-based JWT), ImageKit uploads, RBAC, and SSLCOMMERZ payment (sandbox).

---

## 1. Environment variable setup

### 1.1 Postman environment

Create an environment (e.g. "Jacquard Local") with:

| Variable   | Initial Value        | Current Value |
|-----------|----------------------|----------------|
| baseUrl   | http://localhost:5001 | (same)        |
| frontendUrl | http://localhost:5173 | (same)      |

Use `{{baseUrl}}` in request URLs.

### 1.2 Backend .env

Ensure the backend has at least:

- `PORT`, `MONGO_URI`
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` (min 32 chars each)
- `CORS_ORIGIN` including your Postman origin or `*` for testing (cookie still works with same domain; for Postman use same host as API)
- For ImageKit: `IMAGEKIT_PUBLIC_KEY`, `IMAGEKIT_PRIVATE_KEY`, `IMAGEKIT_URL_ENDPOINT`
- For payments: `SSLCOMMERZ_STORE_ID`, `SSLCOMMERZ_STORE_PASSWD`, `SSLCOMMERZ_IS_LIVE=false` (sandbox)
- `API_BASE_URL` / `BASE_URL` = same as baseUrl (for payment redirects and IPN)
- `FRONTEND_URL` for payment redirect URLs

**Cookie note:** Postman sends cookies to the same domain. Use `baseUrl` host = backend (e.g. localhost:5001). After **Login**, Postman stores `access_token` and `refresh_token` for that host; subsequent requests in the same collection will send them automatically if **Cookies** are enabled.

---

## 2. Auth token testing

### 2.1 Register

- **Method:** POST  
- **URL:** `{{baseUrl}}/api/auth/register`  
- **Headers:** `Content-Type: application/json`  
- **Body (raw JSON):**

```json
{
  "name": "Test User",
  "email": "testuser@example.com",
  "password": "password123"
}
```

- **Expected:** 201, body has `success: true`, `user` with `email`, `role: "normal"`.

**Edge cases:**

- Omit `name` → 400 "Name is required".
- Invalid email → 400 "Invalid email format".
- Password shorter than 8 chars → 400 "Password must be at least 8 characters".
- Same email again → 409 "Email already registered".

### 2.2 Login (stores cookies)

- **Method:** POST  
- **URL:** `{{baseUrl}}/api/auth/login`  
- **Headers:** `Content-Type: application/json`  
- **Body (raw JSON):**

```json
{
  "email": "testuser@example.com",
  "password": "password123"
}
```

- **Expected:** 200, body has `success: true`, `user`.  
- **Check:** Cookies tab for `localhost` (or your baseUrl host): `access_token` and `refresh_token` should be present.

**Edge cases:**

- Wrong password → 401 "Invalid email or password".
- Unknown email → 401 "Invalid email or password".
- Empty body → 400 "Email and password are required".

### 2.3 Get current user (Me)

- **Method:** GET  
- **URL:** `{{baseUrl}}/api/auth/me`  
- **Headers:** None (rely on stored cookie).  
- **Expected:** 200, `user` object matching logged-in user.

**Edge case:** Clear cookies or use a new environment without logging in → 401 "Not authorized".

### 2.4 Refresh token

- **Method:** POST  
- **URL:** `{{baseUrl}}/api/auth/refresh`  
- **Headers:** None (send `refresh_token` cookie).  
- **Expected:** 200, new cookies set, body has `user`.

**Edge case:** Call **Logout** first, then **Refresh** → 401 (refresh revoked).

### 2.5 Logout

- **Method:** POST  
- **URL:** `{{baseUrl}}/api/auth/logout`  
- **Expected:** 200, cookies cleared.  
- **Verify:** Call **Me** again → 401.

---

## 3. Upload testing (ImageKit)

**Prerequisites:** ImageKit env vars set; backend returns 200 for **Me**.

### 3.1 Upload profile image

- **Method:** POST  
- **URL:** `{{baseUrl}}/api/images/upload/profile`  
- **Headers:** None (cookie sent automatically).  
- **Body:** form-data  
  - Key: `image`, type: File, value: choose a JPEG/PNG/WebP image (&lt; 5MB).  
- **Expected:** 201, body has `url` (ImageKit URL).

**Edge cases:**

- No file → 400 "No file uploaded".
- File &gt; 5MB → 400 "File too large...".
- Disallowed type (e.g. PDF) → 400 "Invalid file type...".
- Without login → 401.

### 3.2 Upload product images (admin only)

- **Method:** POST  
- **URL:** `{{baseUrl}}/api/images/upload/product/&lt;productId&gt;`  
- **Body:** form-data, key `images` (File), select one or more images (max 10, each &lt; 5MB).  
- **Expected:** 201, `images` array and `productImages` in body.

**Edge cases:**

- As **normal** user → 403 Forbidden.
- Invalid or non-existent `productId` → 400 or 404.
- Too many files / file too large → 400.

### 3.3 Get upload params (signed auth)

- **Method:** GET  
- **URL:** `{{baseUrl}}/api/images/upload-params`  
- **Expected:** 200, body has `token`, `expire`, `signature` (for client-side ImageKit upload).

### 3.4 Update product images (admin)

- **Method:** PUT  
- **URL:** `{{baseUrl}}/api/images/product/&lt;productId&gt;`  
- **Headers:** `Content-Type: application/json`  
- **Body:**

```json
{
  "imageUrls": [
    "https://ik.imagekit.io/your_id/products/xxx/img1.jpg",
    "https://ik.imagekit.io/your_id/products/xxx/img2.jpg"
  ]
}
```

- **Expected:** 200, `productImages` updated.

### 3.5 Delete image

- **Method:** DELETE  
- **URL:** `{{baseUrl}}/api/images/&lt;fileId&gt;`  
- **Note:** `fileId` is the ImageKit file ID (from upload response or ImageKit dashboard).  
- **Expected:** 200 "Image deleted".  
- **Edge case:** Invalid or already deleted fileId → 404.

---

## 4. Role-based access testing

### 4.1 Create product (admin only)

- **Method:** POST  
- **URL:** `{{baseUrl}}/api/products`  
- **Headers:** `Content-Type: application/json`  
- **Body (example):**

```json
{
  "name": "Test Product",
  "originalPrice": 100,
  "discount": 10
}
```

- **As admin:** 201, product created.  
- **As normal user:** 403 Forbidden.  
- **Without cookie:** 401.

**How to get admin:** Manually set in DB or add a one-time seed: update user document `role: "admin"` for your test user.

### 4.2 Product list and get (public)

- **GET** `{{baseUrl}}/api/products` → 200 (no auth).  
- **GET** `{{baseUrl}}/api/products/&lt;slug-or-id&gt;` → 200 (no auth).

### 4.3 PATCH /api/users/me (any authenticated user)

- **Method:** PATCH  
- **URL:** `{{baseUrl}}/api/users/me`  
- **Body:** `{ "name": "New Name" }` or `{ "profileImage": "https://..." }`  
- **Expected:** 200, updated user.  
- **Without auth:** 401.

---

## 5. Payment sandbox testing (SSLCOMMERZ)

**Prerequisites:** SSLCOMMERZ sandbox credentials in .env; `SSLCOMMERZ_IS_LIVE=false`; `API_BASE_URL` and `FRONTEND_URL` set.

### 5.1 Initiate payment

- **Method:** POST  
- **URL:** `{{baseUrl}}/api/payments/init`  
- **Headers:** Cookie (logged-in user).  
- **Body (raw JSON):**

```json
{
  "amount": 100,
  "currency": "BDT",
  "productName": "Test Order",
  "productCategory": "general",
  "shippingAddress": {
    "name": "Test User",
    "phone": "01700000000",
    "address": "Dhaka",
    "city": "Dhaka",
    "zip": "1000",
    "country": "Bangladesh"
  }
}
```

- **Expected:** 200, body has `GatewayPageURL`, `orderId`, `tranId`.

**Manual flow:**

1. Copy `GatewayPageURL` and open in browser.
2. Complete payment on sandbox (use SSLCOMMERZ sandbox test cards).
3. You will be redirected to success/fail/cancel URLs; backend updates order status and redirects to `FRONTEND_URL`.

### 5.2 Success redirect (browser)

- **GET** `{{baseUrl}}/api/payments/success?tran_id=&lt;tranId&gt;&val_id=&lt;val_id&gt;`  
- Normally called by the gateway redirect; val_id is provided by SSLCOMMERZ on success page.  
- **Expected:** Redirect to frontend success URL; order status in DB = `paid`.

### 5.3 Fail / Cancel (browser or Postman)

- **GET** `{{baseUrl}}/api/payments/fail?tran_id=&lt;tranId&gt;` → Redirect to frontend fail URL; order → `failed`.  
- **GET** `{{baseUrl}}/api/payments/cancel?tran_id=&lt;tranId&gt;` → Redirect to frontend cancel URL; order → `cancelled`.

### 5.4 IPN (server-to-server)

- **Method:** POST  
- **URL:** `{{baseUrl}}/api/payments/ipn`  
- **Body:** Simulate gateway POST (JSON or form) with at least `tran_id`, and optionally `val_id`, `status`.  
- **Expected:** 200, body `{ "success": true, "message": "..." }`.  
- **Idempotency:** Send same payload again → still 200, order not double-confirmed.

**Edge cases:**

- Missing `tran_id` → 400.  
- Unknown `tran_id` → 404.  
- Order already `paid` → 200 "Already confirmed".

---

## 6. Edge-case testing

| Scenario                    | Request                    | Expected        |
|----------------------------|----------------------------|----------------|
| Me without cookie          | GET /api/auth/me           | 401            |
| Refresh after logout      | POST /api/auth/refresh     | 401            |
| Create product as normal   | POST /api/products        | 403            |
| Upload product image as normal | POST /api/images/upload/product/:id | 403 |
| Invalid product ID (images)| POST /api/images/upload/product/invalid | 400/404 |
| Payment init no auth       | POST /api/payments/init    | 401            |
| Payment init invalid amount| POST /api/payments/init body `amount: -1` | 400 |
| ImageKit not configured    | POST /api/images/upload/profile | 503 (if keys missing) |
| SSLCOMMERZ not configured | POST /api/payments/init    | 503            |

---

## 7. Security testing cases

- **No token in response body:** Login/refresh responses must not include raw JWT in JSON; only Set-Cookie.
- **Protected routes without cookie:** All protected endpoints return 401 when cookie is missing or invalid.
- **Admin routes as normal user:** Return 403, not 500.
- **Payment confirmation:** Only success/IPN with valid `val_id` (or gateway-validated data) should set order to `paid`; never trust client-only input for final status.
- **File type/size:** Only allowed image types and max size (5MB) accepted; others get 400.
- **CORS:** From a different origin (e.g. another frontend URL), ensure only allowed origins get 200; others can get CORS error or 403 depending on server config.

---

## 8. Quick checklist

1. Environment: `baseUrl`, `frontendUrl` set.  
2. Auth: Register → Login → Me → Refresh → Logout; test 401/403 where expected.  
3. Image: Upload profile image; upload product images (as admin); update product images; delete image; test 400/403/503.  
4. RBAC: Create product as admin (201), as normal (403); GET products without auth (200).  
5. Payment: Init (200, get GatewayPageURL); complete flow in sandbox; check success/fail/cancel redirects and IPN; verify order status in DB.  
6. Edge and security cases as in sections 6 and 7.

Use **Cookies** in Postman (enabled by default) and same **baseUrl** host as backend so cookies are sent automatically after login.
