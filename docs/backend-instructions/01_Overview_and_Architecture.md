# Vendor Marketplace SaaS Platform — Overview & Architecture

## Context
A multi-vendor marketplace where shopkeepers create catalogue pages with subscription-based activation, QR codes for physical distribution, and role-based dashboards.
The frontend UI has mostly been generated/styled via Stitch, but the Next.js scaffold and full backend architecture need to be built by you (Claude).

## High-Level Architecture

```mermaid
graph TD
    subgraph Client["Client (Browser)"]
        HP[Homepage / Marketplace]
        VD[Vendor Dashboard]
        AD[Admin Dashboard]
        SP[Shop Pages]
    end

    subgraph NextJS["Next.js App (App Router)"]
        MW[Middleware — Auth + Role Guard]
        API[API Routes]
        SSR[Server Components]
        SA[Server Actions]
    end

    subgraph Services["Backend Services"]
        AUTH[NextAuth.js]
        SUB[Subscription Service]
        PAY[Razorpay Service]
        QR[QR Code Service]
        IMG[Image Upload Service]
    end

    subgraph External["External"]
        RZ[Razorpay API]
        CS[Cloudinary / UploadThing]
    end

    subgraph DB["Database"]
        PG[(PostgreSQL via Prisma)]
    end

    Client --> MW --> API
    MW --> SSR
    API --> Services
    SSR --> SA --> Services
    Services --> DB
    PAY --> RZ
    IMG --> CS
```

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Framer Motion
- **Auth**: NextAuth.js v5 (credentials provider)
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Payments**: Razorpay
- **Image Upload**: UploadThing
- **QR Codes**: `qrcode` npm package
