# jacquard

## Coupons

- **Admin:** `/admin/coupons` — CRUD coupon codes (percentage or fixed BDT, dates, min order, optional product scope, usage limits).
- **Checkout:** Payment step applies codes; discount is taken from subtotal before tax; server validates on order create.
- **DB:** MongoDB `coupons` collection; orders include `couponCode` and `couponDiscount`.

## Reward points

- **Earning (logged-in only):** 1 point per ৳100 spent (subtotal after coupon, before reward discount).
- **Admin:** **Customers** → edit → **Reward points**; **Reward points** (`/admin/reward-rules`) → rules (points cost, % or ৳ off, product scope, min subtotal, free shipping).
- **Account:** `/account/reward-points` — balance, offers, **Redeem for next order** (applies on next qualifying checkout).
- **Checkout:** Saved reward or redeem on this order. Guests cannot use points.
- **DB:** `rewardrules` collection; users have `rewardPoints` and optional `pendingReward`; orders store `rewardDiscount`, `rewardFreeShipping`, `pointsEarned`, etc.
