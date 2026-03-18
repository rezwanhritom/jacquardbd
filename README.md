# jacquard

## Coupons

- **Admin:** `/admin/coupons` — CRUD coupon codes (percentage or fixed BDT, dates, min order, optional product scope, usage limits).
- **Checkout:** Payment step applies codes; discount is taken from subtotal before tax; server validates on order create.
- **DB:** MongoDB `coupons` collection; orders include `couponCode` and `couponDiscount`.
