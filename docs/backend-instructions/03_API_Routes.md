# API Route Design

Here are the API endpoints that need to be built by Claude Code to support the Next.js frontend and provide the Vendor/Admin dashboard functionalities.

| Method | Route | Description | Auth Requirement |
|---|---|---|---|
| POST | `/api/auth/signup` | Register vendor/user | Public |
| POST/GET | `/api/auth/[...nextauth]` | NextAuth credential handlers | Public |
| GET | `/api/shops` | List active shops | Public |
| GET | `/api/shops/[slug]` | Get shop by slug | Public |
| PUT | `/api/shops` | Update own shop details | Vendor Only |
| GET/POST | `/api/products` | List / create products | Vendor Only |
| PUT/DELETE| `/api/products/[id]` | Update / delete product | Vendor Only |
| POST | `/api/payments/create-order` | Create Razorpay order | Vendor Only |
| POST | `/api/payments/verify` | Verify payment signature | Vendor Only |
| POST | `/api/webhooks/razorpay` | Razorpay webhook handler | Webhook Signature |
| GET | `/api/qr/[shopId]` | Generate QR code for shop URL | Vendor Only |
| POST | `/api/upload` | Upload image (Cloudinary/UploadThing) | Vendor Only |
| GET | `/api/admin/vendors` | List all vendors | Admin Only |
| GET | `/api/admin/payments` | List all payments | Admin Only |
| PUT | `/api/admin/plans/[id]` | Manage subscription plans | Admin Only |

Make sure to protect these routes using Next.js route handlers and NextAuth session checking.
