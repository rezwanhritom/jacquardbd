# Postman API Testing Guide

Use this guide to test all backend APIs one by one.  
**Base URL:** `http://localhost:5001` (or your `PORT` from `.env`).

---

## Before you start

1. **Start the backend:** `npm run dev` (or `node src/server.js`) so the server is running on the port in `.env` (e.g. 5001).
2. **Postman:** Create a new request for each step below. Leave **Cookies** enabled (Postman sends stored cookies automatically for the same domain).

---

## 1. Auth APIs (cookie-based)

Auth uses an **HTTP-only cookie** named `access_token`. After **Login**, Postman stores the cookie for `localhost:5001`; **Me** and **Logout** will then send it automatically.

### 1.1 Register

- **Method:** `POST`
- **URL:** `http://localhost:5001/api/auth/register`
- **Headers:**  
  - `Content-Type` = `application/json`
- **Body (raw JSON):**
```json
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123"
}
```

**Expected:** `201` – `{ "success": true, "message": "Registration successful", "user": { "_id", "name", "email", "role", "createdAt", "updatedAt" } }`  
**Optional:** Try again with same email → `409` "Email already registered". Try without name/email/short password → `400`.

---

### 1.2 Login (saves cookie for next steps)

- **Method:** `POST`
- **URL:** `http://localhost:5001/api/auth/login`
- **Headers:**  
  - `Content-Type` = `application/json`
- **Body (raw JSON):**
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

**Expected:** `200` – `{ "success": true, "message": "Login successful", "user": { ... } }`  
Response will include **Set-Cookie** with `access_token`. Postman stores it for `localhost:5001` so the next requests send it automatically.

**Optional:** Wrong password or unknown email → `401` "Invalid email or password".

---

### 1.3 Get current user (Me) – protected

- **Method:** `GET`
- **URL:** `http://localhost:5001/api/auth/me`
- **Headers:** none (cookie is sent automatically if you logged in in the same Postman session).
- **Body:** none

**Expected:** `200` – `{ "success": true, "user": { "_id", "name", "email", "role", "createdAt", "updatedAt" } }`  
**If you didn’t log in first or cookie expired:** `401` "Not authorized" or "Invalid or expired token".

---

### 1.4 Logout

- **Method:** `POST`
- **URL:** `http://localhost:5001/api/auth/logout`
- **Headers:** none (send cookie from login).
- **Body:** none

**Expected:** `200` – `{ "success": true, "message": "Logged out successfully" }`  
After this, **Me** should return `401` until you **Login** again.

---

## 2. Notes API (no auth)

### 2.1 List all notes

- **Method:** `GET`
- **URL:** `http://localhost:5001/api/notes`
- **Headers:** none  
- **Body:** none

**Expected:** `200` – JSON array of notes (may be empty `[]`).

---

## 3. Products APIs

### 3.1 List products (all or by gender)

- **Method:** `GET`
- **URL (all):** `http://localhost:5001/api/products`  
- **URL (men):** `http://localhost:5001/api/products?gender=men`  
- **URL (women):** `http://localhost:5001/api/products?gender=women`
- **Headers:** none  
- **Body:** none

**Expected:** `200` – `{ "success": true, "products": [ ... ] }`.

---

### 3.2 Get single product (by slug or ID)

- **Method:** `GET`
- **URL:** `http://localhost:5001/api/products/:identifier`  
  - Use a product slug, e.g. `http://localhost:5001/api/products/cool-tshirt`,  
  - or a MongoDB `_id`, e.g. `http://localhost:5001/api/products/507f1f77bcf86cd799439011`
- **Headers:** none  
- **Body:** none

**Expected:** `200` – `{ "success": true, "product": { ... } }`  
**Not found:** `404` – `{ "success": false, "message": "Product not found" }`.

---

### 3.3 Create product

- **Method:** `POST`
- **URL:** `http://localhost:5001/api/products`
- **Headers:**  
  - `Content-Type` = `application/json`
- **Body (raw JSON):**
```json
{
  "name": "Summer T-Shirt",
  "originalPrice": 29.99,
  "discount": 10
}
```

**Expected:** `200` or `201` – `{ "success": true, "product": { ... } }` (slug and final price are computed).  
**Validation error:** `400` – e.g. missing `name`, invalid `originalPrice` or `discount` (must be 0–100).

---

## Quick checklist

| # | Method | Endpoint | Auth? |
|---|--------|----------|--------|
| 1 | POST   | `/api/auth/register`   | No  |
| 2 | POST   | `/api/auth/login`      | No  |
| 3 | GET    | `/api/auth/me`         | Yes (cookie) |
| 4 | POST   | `/api/auth/logout`     | Yes (cookie) |
| 5 | GET    | `/api/notes`           | No  |
| 6 | GET    | `/api/products`        | No  |
| 7 | GET    | `/api/products/:id`    | No  |
| 8 | POST   | `/api/products`        | No  |

---

## If “Me” or “Logout” returns 401

- Run **Login** again (same collection/session).
- In Postman: **Cookies** (bottom or top) → ensure `localhost:5001` has `access_token` and that cookies are not disabled for the request.
- Token expires in 15 minutes (from `.env` `JWT_EXPIRES_IN`); log in again after expiry.

---

## Optional: Postman collection

You can create a **Collection** and add one request per row in the checklist. Set a **Collection variable** `baseUrl` = `http://localhost:5001` and use `{{baseUrl}}/api/auth/login`, etc., so you can change the base URL in one place.
