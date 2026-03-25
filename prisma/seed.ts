import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create subscription plans
  const monthlyPlan = await prisma.plan.upsert({
    where: { id: "plan-monthly" },
    update: {},
    create: {
      id: "plan-monthly",
      name: "Monthly",
      price: 499,
      duration: 30,
      features: [
        "Unlimited products",
        "QR code generation",
        "Analytics dashboard",
        "Priority support",
      ],
    },
  });

  const yearlyPlan = await prisma.plan.upsert({
    where: { id: "plan-yearly" },
    update: {},
    create: {
      id: "plan-yearly",
      name: "Yearly",
      price: 4499,
      duration: 365,
      features: [
        "Unlimited products",
        "QR code generation",
        "Analytics dashboard",
        "Priority support",
        "Custom domain",
        "2 months free",
      ],
    },
  });

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@luminous.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@luminous.com",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  // Create demo vendor
  const vendorPassword = await bcrypt.hash("vendor123", 12);
  const vendor = await prisma.user.upsert({
    where: { email: "vendor@luminous.com" },
    update: {},
    create: {
      name: "Demo Vendor",
      email: "vendor@luminous.com",
      password: vendorPassword,
      role: "VENDOR",
    },
  });

  // Create demo shop
  const shop = await prisma.shop.upsert({
    where: { slug: "demo-shop" },
    update: {},
    create: {
      name: "Demo Shop",
      slug: "demo-shop",
      description: "A demo shop for testing",
      address: "123 Main Street",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001",
      isActive: true,
      userId: vendor.id,
    },
  });

  // Create demo subscription
  await prisma.subscription.upsert({
    where: { userId: vendor.id },
    update: {},
    create: {
      userId: vendor.id,
      planId: monthlyPlan.id,
      status: "ACTIVE",
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  console.log("Seed complete:", { admin: admin.email, vendor: vendor.email, shop: shop.slug });
  console.log("Plans created:", { monthly: monthlyPlan.name, yearly: yearlyPlan.name });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
