# Subscription Lifecycle & Payment Logic

The system depends on a subscription gating mechanism to allow Vendors to show their Shop pages publicly.

## State Transitions
1. **PENDING:** Vendor signs up -> selects plan.
2. **ACTIVE:** Vendor pays via Razorpay -> webhook `payment.captured` fires -> Status becomes `ACTIVE`.
3. **EXPIRED:** Cron job or access check verifies `endDate`. If today > `endDate` -> Status becomes `EXPIRED`.
4. **CANCELLED:** Vendor manually cancels or we fail to auto-renew after grace period.

## Shop Activation Rules
- A Shop's `isActive` flag should remain synced with its related `Subscription.status`.
- **Middleware / Server Component Check:** If `Subscription.status !== ACTIVE`, the public `/shop/[slug]` page must NOT render products, and instead show a "Temporarily Unavailable" placeholder.
- Conversely, if `ACTIVE`, the dashboard provides full access, and the shop is publicly visible via its slug or QR Code.

## QR Code Logic
- Vendor dashboards must generate a unique QR code (`/api/qr/[shopId]`).
- The QR code simply encodes the URL: `https://[domain]/shop/[slug]`.
- This means the QR code is permanent but its destination visibility acts as a switch based on the subscription rule above.
