# API Documentation

Base URL: `http://localhost:5001` (or your `API_BASE_URL`).  
All authenticated requests use **cookie-based JWT** (access token in `access_token` cookie).  
CORS is configured for allowed origins; use `credentials: true` in frontend.

---

## Table of contents

1. [Authentication APIs](#1-authentication-apis)
2. [Image Upload APIs (ImageKit)](#2-image-upload-apis-imagekit)
3. [Role-based APIs (RBAC)](#3-role-based-apis-rbac)
4. [Payment APIs (SSLCOMMERZ)](#4-payment-apis-sslcommerz)
5. [Other APIs](#5-other-apis)
6. [Error responses](#6-error-responses)

---

## 1. Authentication APIs

### 1.1 Register

**POST** `/api/auth/register`

**Request (JSON):**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

| Field    | Type   | Required | Notes                    |
|----------|--------|----------|--------------------------|
| name     | string | Yes      | Non-empty                |
| email    | string | Yes      | Valid email format       |
| password | string | Yes      | Minimum 8 characters     |

**Success (201):**

```json
{
  "success": true,
  "message": "Registration successful",
  "user": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "avatar": "",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

**Error responses:**

- `400` – Missing/invalid name, email, or password (e.g. "Password must be at least 8 characters").
- `409` – "Email already registered".

---

### 1.2 Login

**POST** `/api/auth/login`

**Request (JSON):**

```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Success (200):**

- Sets HTTP-only cookie: `access_token` (for browser clients).
- Body includes `accessToken` and `expiresIn` for API clients (e.g. Postman, mobile):

```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "avatar": "",
    "createdAt": "...",
    "updatedAt": "..."
  },
  "accessToken": "<JWT string>",
  "expiresIn": "15m"
}
```

**Error responses:**

- `400` – "Email and password are required".
- `401` – "Invalid email or password".

**Token usage:** You can authenticate in two ways: (1) **Cookie:** send requests with credentials (e.g. `credentials: 'include'`) so the browser sends the `access_token` cookie. (2) **Bearer:** send header `Authorization: Bearer <accessToken>` (use the `accessToken` from the login response). Use Bearer for Postman or non-browser clients.

---

### 1.3 Get current user (Me)

**GET** `/api/auth/me`

**Headers:** None (cookie `access_token` sent automatically with credentials).

**Success (200):**

```json
{
  "success": true,
  "user": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "avatar": "",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

**Error responses:**

- `401` – "Not authorized", "Invalid or expired token", or "User not found".

---

### 1.4 Logout

**POST** `/api/auth/logout`

**Headers:** Cookie (optional; if present, refresh token is revoked).

**Success (200):**

- Clears `access_token` and `refresh_token` cookies; revokes refresh token if sent.

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### 1.5 Refresh token

**POST** `/api/auth/refresh`

**Headers:** Cookie `refresh_token` must be sent.

**Success (200):**

- Issues new access and refresh tokens (rotation); sets new cookies.
- Previous refresh token is blacklisted.

```json
{
  "success": true,
  "message": "Token refreshed",
  "user": { ... }
}
```

**Error responses:**

- `401` – "Refresh token required", "Refresh token revoked or invalid", or "Invalid or expired refresh token".

---

## 2. Image Upload APIs (ImageKit)

Requires `IMAGEKIT_PUBLIC_KEY`, `IMAGEKIT_PRIVATE_KEY`, `IMAGEKIT_URL_ENDPOINT` in env.  
All image routes require authentication (cookie).  
**Validation:** Allowed types: `image/jpeg`, `image/png`, `image/webp`. Max file size: **5MB**.  
**Folder structure:** Product images → `/products/{productId}`; Profile image → `/users/{userId}`.

### 2.1 Get upload parameters (signed auth for client upload)

**GET** `/api/images/upload-params`

**Query (optional):** `folder`, `fileName` – for signed parameters.

**Success (200):**

```json
{
  "success": true,
  "token": "...",
  "expire": "...",
  "signature": "..."
}
```

Use these on the client with ImageKit client SDK; **do not expose private key** on frontend.

**Error responses:**

- `401` – Not authenticated.
- `503` – "Image upload service not configured".

---

### 2.2 Upload product images (admin only)

**POST** `/api/images/upload/product/:productId`

**Content-Type:** `multipart/form-data`  
**Field name:** `images` (multiple files).

**Success (201):**

```json
{
  "success": true,
  "message": "Images uploaded",
  "images": ["https://ik.imagekit.io/.../img_xxx.jpg", ...],
  "productImages": ["...", ...]
}
```

**Error responses:**

- `400` – "No files uploaded", invalid file type/size, or "Valid product ID required".
- `401` – Not authenticated.
- `403` – Forbidden (not admin).
- `404` – "Product not found".
- `503` – ImageKit not configured.

---

### 2.3 Upload profile image

**POST** `/api/images/upload/profile`

**Content-Type:** `multipart/form-data`  
**Field name:** `image` (single file).

**Success (201):**

```json
{
  "success": true,
  "message": "Profile image uploaded",
  "url": "https://ik.imagekit.io/.../profile_xxx.jpg"
}
```

Replaces previous profile image (old file removed from ImageKit when possible).

**Error responses:**

- `400` – "No file uploaded" or validation error.
- `401` – Not authenticated.
- `503` – ImageKit not configured.

---

### 2.4 Delete image

**DELETE** `/api/images/:fileId`

**Path:** `fileId` = ImageKit file ID (from upload response or URL).

**Success (200):**

```json
{
  "success": true,
  "message": "Image deleted"
}
```

**Error responses:**

- `400` – "File ID required".
- `401` – Not authenticated.
- `404` – "Image not found".
- `503` – ImageKit not configured.

---

### 2.5 Update (replace) product images

**PUT** `/api/images/product/:productId`

**Body (JSON):**

```json
{
  "imageUrls": [
    "https://ik.imagekit.io/.../img1.jpg",
    "https://ik.imagekit.io/.../img2.jpg"
  ]
}
```

**Success (200):**

```json
{
  "success": true,
  "message": "Product images updated",
  "productImages": ["...", ...]
}
```

**Error responses:**

- `400` – "Valid product ID required" or "imageUrls array required".
- `401` – Not authenticated.
- `403` – Not admin.
- `404` – "Product not found".

---

## 3. Role-based APIs (RBAC)

**Session roles:** `user`, `premium`, `admin`. Stored in the JWT payload via `req.user.role` after authentication.

| Role    | Permissions                                                       |
|---------|--------------------------------------------------------------------|
| user    | Default. Browse, buy, manage own profile, upload profile image.   |
| premium | user + premium-only content (use `requireRole(['premium','admin'])`). |
| admin   | Full access: create products, product images, all data.          |

### 3.1 Admin-only routes

- **POST** `/api/products` – Create product.
- **POST** `/api/images/upload/product/:productId` – Upload product images.
- **PUT** `/api/images/product/:productId` – Update product images.
- **DELETE** `/api/images/:fileId` – Delete image (any authenticated user in current impl; can be restricted to admin if needed).

### 3.2 Premium routes

- Reserved for future premium-only content (e.g. special endpoints). Use middleware `requireRole(['premium','admin'])`.

### 3.3 Authenticated user routes (any role)

- **GET** `/api/auth/me`, **POST** `/api/auth/logout`, **POST** `/api/auth/refresh`.
- **PATCH** `/api/users/me` – Update own profile (name, profileImage URL).
- **POST** `/api/images/upload/profile` – Upload profile image.
- **POST** `/api/payments/init` – Initiate payment.

### 3.4 Public routes (no auth)

- **POST** `/api/auth/register`, **POST** `/api/auth/login`.
- **GET** `/api/products`, **GET** `/api/products/:identifier`.
- **GET** `/api/notes`.

**Error responses for RBAC:**

- `401` – Not authenticated.
- `403` – "Forbidden" (insufficient role).

---

## 4. Payment APIs (SSLCOMMERZ)

Requires `SSLCOMMERZ_STORE_ID`, `SSLCOMMERZ_STORE_PASSWD`.  
Set `SSLCOMMERZ_IS_LIVE=true` for production.  
**Order statuses:** `pending`, `paid`, `failed`, `cancelled`.

### 4.1 Payment initiation

**POST** `/api/payments/init`

**Headers:** Cookie (authenticated user).

**Body (JSON):**

```json
{
  "amount": 1000,
  "currency": "BDT",
  "items": [
    { "productId": "...", "name": "Product A", "quantity": 2, "price": 500 }
  ],
  "shippingAddress": {
    "name": "John",
    "phone": "01700000000",
    "address": "Address line",
    "city": "Dhaka",
    "state": "Dhaka",
    "zip": "1000",
    "country": "Bangladesh"
  },
  "productName": "Order",
  "productCategory": "general",
  "productProfile": "general"
}
```

| Field    | Type   | Required | Notes                    |
|----------|--------|----------|--------------------------|
| amount   | number | Yes      | > 0                      |
| currency | string | No       | Default `BDT`            |
| items    | array  | No       | Line items               |
| shippingAddress | object | No | Used for SSLCOMMERZ customer/shipping |

**Success (200):**

```json
{
  "success": true,
  "GatewayPageURL": "https://sandbox.sslcommerz.com/...",
  "orderId": "mongodb_order_id",
  "tranId": "TXN_..."
}
```

**Flow:** Client redirects user to `GatewayPageURL`. User pays on SSLCOMMERZ; gateway redirects to success/fail/cancel URLs and may send IPN to your server.

**Error responses:**

- `400` – "Valid amount required".
- `401` – Not authenticated.
- `502` – "Payment gateway error".
- `503` – "Payment gateway not configured".

---

### 4.2 Success callback (redirect)

**GET** `/api/payments/success?tran_id=...&val_id=...`

- Called when user is redirected after successful payment.
- Server validates with SSLCOMMERZ using `val_id`, updates order to `paid` (idempotent).
- Redirects to: `{FRONTEND_URL}/payment/success?orderId=...&tran_id=...`  
- On error or missing params: redirects to `{FRONTEND_URL}/payment?status=fail&reason=...`.

---

### 4.3 Fail callback (redirect)

**GET** `/api/payments/fail?tran_id=...`

- Order with `tran_id` (if found) is set to `failed`.
- Redirects to: `{FRONTEND_URL}/payment?status=fail&tran_id=...`.

---

### 4.4 Cancel callback (redirect)

**GET** `/api/payments/cancel?tran_id=...`

- Order with `tran_id` (if found) is set to `cancelled`.
- Redirects to: `{FRONTEND_URL}/payment?status=cancelled&tran_id=...`.

---

### 4.5 IPN (Instant Payment Notification)

**POST** `/api/payments/ipn`

- Server-to-server callback from SSLCOMMERZ. Body may be JSON or form-urlencoded.
- **Validation:** Uses `val_id` to validate with SSLCOMMERZ; updates order to `paid` or `failed`.
- **Idempotent:** If order is already `paid`, responds success without re-processing.
- **Response:** Always `200` with JSON `{ "success": true, "message": "..." }` so the gateway does not retry unnecessarily.

**Environment:** Set SSLCOMMERZ IPN URL to `{API_BASE_URL}/api/payments/ipn`.

---

## 5. Other APIs

### 5.1 Products

- **GET** `/api/products` – List active products. Query: `?gender=men|women` (optional).
- **GET** `/api/products/:identifier` – Single product by slug or MongoDB `_id`.
- **POST** `/api/products` – Create product (admin only). Body: name, originalPrice, discount, category, etc.

### 5.2 Users

- **PATCH** `/api/users/me` – Update own profile. Body: `{ "name": "...", "profileImage": "..." }` (optional fields).

### 5.3 Notes

- **GET** `/api/notes` – List all notes (demo endpoint).

---

## 6. Error responses

Standard shape:

```json
{
  "success": false,
  "message": "Human-readable message",
  "errors": ["optional", "array", "for", "validation"]
}
```

| Status | Usage |
|--------|--------|
| 400 | Validation, bad request, file type/size |
| 401 | Not authorized, invalid/expired token |
| 403 | Forbidden (RBAC) |
| 404 | Resource not found |
| 409 | Conflict (e.g. duplicate email) |
| 500 | Internal server error (message may be generic in production) |
| 502 | Payment gateway error |
| 503 | Service not configured (ImageKit, SSLCOMMERZ) |

---

## Security notes

- **Secrets:** All secrets (JWT, ImageKit private key, SSLCOMMERZ store password) are server-side only; never expose in frontend or API responses.
- **Cookies:** Access and refresh tokens are HttpOnly, Secure in production, SameSite=strict.
- **Payment:** Order identity is derived from server-side `tran_id` and validation with SSLCOMMERZ; do not trust client for payment confirmation.
- **Idempotency:** Payment success and IPN handle duplicate confirmations by checking order status before updating to `paid`.
