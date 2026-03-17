# Search: Where "Did you mean", "Stay tuned", "No results" Are Handled

Use this to verify the search page and API are wired correctly.

---

## Why you might not see any changes

1. **Backend must be running.** The search page calls `GET http://localhost:5001/api/products/search?q=...`. If the backend is not running (e.g. it crashed with "MongoDB connection error"), that request fails and you will not see the correct messages. Fix MongoDB connection and run `npm run dev` in the **backend** folder.
2. **Frontend API URL.** The frontend uses `VITE_API_URL` (see `frontend/.env` or `frontend/.env.development`). It should be `http://localhost:5001` for local dev. Restart the frontend dev server after changing env.
3. **Hard refresh.** After pulling code or env changes, do a hard refresh (Ctrl+Shift+R) so the browser does not use cached JS.

---

## Backend (API) – decides products, suggestedQuery, categoryExists

| File | Lines | What it does |
|------|--------|---------------|
| `backend/src/controller/productController.js` | 155–159 | `wordBoundaryRegex()` – word-boundary match so "ck" does not match "Black". |
| `backend/src/controller/productController.js` | 161–294 | `searchProducts()` – main search handler. Word-boundary `$and` of query words on name + categoryPath only; typo from vocabulary; sets `suggestedQuery` and `categoryExists`. |
| `backend/src/controller/productController.js` | 199–215 | Sets `categoryExists` from `isKnownCategory(raw)` when there are no products. |
| `backend/src/controller/productController.js` | 233–265 | When no exact results, finds typo suggestion and returns those products with `matchType: "fuzzy"` and `suggestedQuery`. |
| `backend/src/controller/productController.js` | 267–284 | Extra pass: if fuzzy results but no `suggestedQuery`, fills `suggestedQuery`; and when no products, sets `categoryExists` from known categories. |
| `backend/src/constants/knownCategories.js` | (whole file) | List of known category/sub names (Panjabi, Hoodies, etc.). Used for "category exists but no products" and typo suggestions. |
| `backend/src/constants/knownCategories.js` | 48–53 | `isKnownCategory(query)` – true when query matches a known category (so "panjabi" → "Stay tuned"). |
| `backend/src/routes/productRoutes.js` | 20 | Route: `GET /search` → `searchProducts`. |

---

## Frontend – shows the messages

| File | Lines | What it does |
|------|--------|---------------|
| `frontend/src/services/productApi.js` | 93–114 | `searchProducts(q)` – calls backend, returns `products`, `matchType`, `suggestedQuery`, `categoryExists`. |
| `frontend/src/Pages/Search/Search.jsx` | 28–58 | `useEffect`: when `q` changes, calls `searchProducts(q)` and sets `products`, `matchType`, `suggestedQuery`, `categoryExists`. Includes `.catch()` so failed requests still show no-results state. |
| `frontend/src/Pages/Search/Search.jsx` | 84–89 | `noResults`, `noCategoryMessage`, `categoryNoProductsMessage` – booleans that pick which message block to show. |
| `frontend/src/Pages/Search/Search.jsx` | 123–204 | **No-results block:** |
| | 127–150 | **No category / no match:** title "No results found for the search \"[q]\"", description "No such category or product name matches." + "Did you mean [suggestion]?" when `suggestedQuery` is set. |
| | 152–174 | **Category exists, no products:** title "Stay tuned for further product updates", description "No results found for the search \"[q]\"... This category exists but has no products listed yet." + optional "Did you mean?" when `suggestedQuery` is set. |
| | 176–201 | **Fallback:** "No results found for the search \"[q]\"" + "Did you mean?" when `suggestedQuery` is set. |
| `frontend/src/Pages/Search/Search.jsx` | 206–218 | **When there are results:** result count + when `matchType === "fuzzy"` and `suggestedQuery` is set, shows "(Did you mean [suggestion]?)" link. |

---

## Quick checks

- **Backend running:** Open `http://localhost:5001/api/products/search?q=test` in the browser. You should get JSON with `success`, `products`, `matchType`, `suggestedQuery`, `categoryExists`. If you get "Cannot GET" or connection refused, the backend is not running or the route is wrong.
- **Frontend env:** In browser DevTools → Network, when you search, the request URL should be `http://localhost:5001/api/products/search?q=...` (or whatever your `VITE_API_URL` is). If it points to another host, the frontend is not using your local backend.
