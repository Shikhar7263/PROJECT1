# Claude Code Next Tasks

You have been handed this project. Here is what you need to build next:

1. **Scaffold Next.js App**: Run `create-next-app` in this directory (there may be naming conflicts due to caps; if so, create app in a lowercase folder and copy files). Include App Router, Tailwind, TypeScript.
2. **Setup Prisma**: Run `npx prisma init` and copy the schema from `02_Database_Schema.prisma`. Run migrations.
3. **Setup NextAuth v5**: Implement Credentials provider, bcrypt hashing, and Role-based JWTs.
4. **Implement Global Middleware**: Secure the `/vendor/` and `/admin/` routes based on roles in token.
5. **Build Services**: Implement the backend service layers (`user.service.ts`, `product.service.ts`, `shop.service.ts`).
6. **Implement API Routes**: Map the controllers to the functions documented in `03_API_Routes.md`.
7. **Razorpay Integration**: Build the `/create-order` and webhook verification logic for the Subscription system.

Note: The front-end styling has been partially mocked in Stitch (a design tool). You must wire up the backend logic first, and then integrate the static React components once the APIs are solid.
