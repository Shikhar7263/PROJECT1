import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";

async function getVendorData(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      email: true,
      shop: {
        include: {
          _count: { select: { products: true } },
        },
      },
      subscription: {
        include: { plan: true },
      },
      payments: {
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { subscription: { include: { plan: true } } },
      },
    },
  });
}

export default async function VendorDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const data = await getVendorData(session.user.id!);
  if (!data) redirect("/auth/login");

  const { shop, subscription, payments } = data;
  const isActive = subscription?.status === "ACTIVE";
  const daysLeft =
    subscription?.endDate
      ? Math.max(0, Math.ceil((new Date(subscription.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
      : 0;

  return (
    <div className="min-h-screen bg-black font-body">
      {/* Ambient Background */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 gradient-blob pointer-events-none z-0" />

      {/* Header */}
      <header className="bg-black/60 backdrop-blur-xl text-white font-headline tracking-tight font-bold rounded-full mt-4 mx-4 px-6 py-2 sticky top-0 z-50 shadow-[0_40px_40px_rgba(226,222,226,0.08)] flex justify-between items-center w-[calc(100%-2rem)] max-w-5xl md:mx-auto">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-xl font-bold tracking-tighter text-white">Luminous</Link>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-6 mr-6">
            <Link href="/vendor/dashboard" className="text-white font-bold transition-colors">Overview</Link>
            <Link href="/vendor/products" className="text-neutral-400 hover:bg-neutral-800/50 transition-colors px-3 py-1 rounded-full">Products</Link>
            <Link href="/vendor/shop" className="text-neutral-400 hover:bg-neutral-800/50 transition-colors px-3 py-1 rounded-full">My Shop</Link>
            <Link href="/vendor/subscription" className="text-neutral-400 hover:bg-neutral-800/50 transition-colors px-3 py-1 rounded-full">Subscription</Link>
          </div>
          <div className="w-8 h-8 rounded-full bg-surface-container-highest border border-outline-variant/20 flex items-center justify-center text-sm font-bold text-on-surface">
            {data.name.charAt(0).toUpperCase()}
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-5xl mx-auto px-6 pt-12 pb-32">
        {/* Hero Section */}
        <section className="mb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <h1 className="text-on-surface-variant font-label text-sm uppercase tracking-[0.2em] mb-2">
                Vendor Dashboard
              </h1>
              <h2 className="text-4xl md:text-5xl font-headline font-extrabold tracking-tight text-white">
                Welcome back, {data.name.split(" ")[0]}!
              </h2>
            </div>
            <div className="flex gap-3">
              <Link
                href="/vendor/products"
                className="bg-primary-container text-on-primary-fixed px-8 py-4 rounded-full font-bold flex items-center gap-2 transition-transform active:scale-95 shadow-lg"
              >
                <span className="material-symbols-outlined text-[20px]">add</span>
                Add Product
              </Link>
              {shop && (
                <Link
                  href={`/shop/${shop.slug}`}
                  target="_blank"
                  className="border border-outline-variant/30 text-white px-8 py-4 rounded-full font-bold hover:bg-white/5 transition-all active:scale-95"
                >
                  View Shop
                </Link>
              )}
            </div>
          </div>

          {/* Subscription Status Card */}
          <div className="bg-surface-container rounded-xl md:rounded-xl p-8 md:p-12 relative overflow-hidden group mb-6">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <span className={`text-sm font-label font-bold uppercase tracking-widest ${isActive ? "text-secondary" : "text-error"}`}>
                  Subscription Status
                </span>
                <span
                  className={`material-symbols-outlined text-lg ${isActive ? "text-secondary" : "text-error"}`}
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {isActive ? "verified" : "warning"}
                </span>
              </div>
              <div className="flex flex-col md:flex-row md:items-baseline gap-4">
                <span className={`text-5xl md:text-6xl font-headline font-extrabold tracking-tighter ${isActive ? "text-white" : "text-error"}`}>
                  {isActive ? "ACTIVE" : subscription?.status || "NO PLAN"}
                </span>
                {isActive && (
                  <div className="bg-secondary-container/30 px-3 py-1 rounded-full flex items-center gap-1">
                    <span className="material-symbols-outlined text-secondary text-sm">schedule</span>
                    <span className="text-secondary font-bold text-sm">{daysLeft} days left</span>
                  </div>
                )}
              </div>
              <div className="mt-6 flex flex-wrap gap-8">
                {subscription?.plan && (
                  <div>
                    <p className="text-on-surface-variant text-xs uppercase tracking-widest mb-1">Plan</p>
                    <p className="text-white font-headline font-bold">{subscription.plan.name}</p>
                  </div>
                )}
                {subscription?.endDate && (
                  <div>
                    <p className="text-on-surface-variant text-xs uppercase tracking-widest mb-1">Expires</p>
                    <p className="text-white font-headline font-bold">{formatDate(subscription.endDate)}</p>
                  </div>
                )}
                {shop && (
                  <div>
                    <p className="text-on-surface-variant text-xs uppercase tracking-widest mb-1">Products</p>
                    <p className="text-white font-headline font-bold">{shop._count.products}</p>
                  </div>
                )}
              </div>
              {!isActive && (
                <Link
                  href="/vendor/subscription"
                  className="mt-6 inline-block bg-primary text-on-primary px-8 py-3 rounded-full font-bold font-headline hover:opacity-90 transition-opacity"
                >
                  Activate Subscription
                </Link>
              )}
            </div>
            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-secondary/5 rounded-full blur-3xl group-hover:bg-secondary/10 transition-colors duration-700" />
          </div>
        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Recent Payments */}
          <div className="md:col-span-7 bg-surface-container rounded-xl p-8">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-headline font-bold text-xl text-white">Recent Payments</h3>
              <Link href="/vendor/subscription" className="text-secondary text-sm font-bold hover:underline">
                See all
              </Link>
            </div>
            <div className="space-y-5">
              {payments.length === 0 ? (
                <p className="text-on-surface-variant text-sm text-center py-6">No payments yet</p>
              ) : (
                payments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-surface-container-lowest flex items-center justify-center">
                        <span className={`material-symbols-outlined text-sm ${payment.status === "captured" ? "text-primary-container" : "text-error"}`}>
                          {payment.status === "captured" ? "check_circle" : "cancel"}
                        </span>
                      </div>
                      <div>
                        <p className="text-white font-bold text-sm">
                          {payment.subscription?.plan?.name || "Subscription"} Plan
                        </p>
                        <p className="text-on-surface-variant text-xs">{formatDate(payment.createdAt)}</p>
                      </div>
                    </div>
                    <span className={`font-bold text-sm ${payment.status === "captured" ? "text-secondary" : "text-error"}`}>
                      {payment.status === "captured" ? "+" : ""}
                      {formatCurrency(payment.amount)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="md:col-span-5 bg-surface-container rounded-xl p-8 flex flex-col gap-4">
            <h3 className="font-headline font-bold text-xl text-white mb-2">Quick Actions</h3>
            <Link
              href="/vendor/products"
              className="flex items-center gap-3 p-4 bg-surface-container-high rounded-DEFAULT hover:bg-surface-bright transition-colors group"
            >
              <span className="material-symbols-outlined text-primary-container">inventory_2</span>
              <div>
                <p className="text-white font-bold text-sm">Manage Products</p>
                <p className="text-on-surface-variant text-xs">{shop?._count.products || 0} products</p>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant ml-auto group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </Link>
            <Link
              href="/vendor/shop"
              className="flex items-center gap-3 p-4 bg-surface-container-high rounded-DEFAULT hover:bg-surface-bright transition-colors group"
            >
              <span className="material-symbols-outlined text-tertiary-fixed">storefront</span>
              <div>
                <p className="text-white font-bold text-sm">Edit Shop Details</p>
                <p className="text-on-surface-variant text-xs">{shop?.name || "Set up your shop"}</p>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant ml-auto group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </Link>
            {shop && (
              <Link
                href={`/vendor/qr`}
                className="flex items-center gap-3 p-4 bg-surface-container-high rounded-DEFAULT hover:bg-surface-bright transition-colors group"
              >
                <span className="material-symbols-outlined text-secondary">qr_code_2</span>
                <div>
                  <p className="text-white font-bold text-sm">Get QR Code</p>
                  <p className="text-on-surface-variant text-xs">Share your shop</p>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant ml-auto group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </Link>
            )}
            <Link
              href="/vendor/subscription"
              className="flex items-center gap-3 p-4 bg-surface-container-high rounded-DEFAULT hover:bg-surface-bright transition-colors group"
            >
              <span className="material-symbols-outlined text-secondary-fixed">workspace_premium</span>
              <div>
                <p className="text-white font-bold text-sm">Subscription</p>
                <p className="text-on-surface-variant text-xs">
                  {isActive ? `${daysLeft} days remaining` : "Not active"}
                </p>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant ml-auto group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </Link>
          </div>
        </section>
      </main>

      {/* Bottom Navigation (mobile) */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-auto min-w-[280px] rounded-full px-4 py-3 z-50 bg-neutral-900/80 backdrop-blur-2xl shadow-2xl flex justify-around items-center gap-4">
        <Link href="/vendor/dashboard" className="bg-primary-container/30 text-primary-container rounded-full p-3 active:scale-95 duration-200">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
        </Link>
        <Link href="/vendor/products" className="text-neutral-500 p-3 hover:text-white transition-all active:scale-95 duration-200">
          <span className="material-symbols-outlined">inventory_2</span>
        </Link>
        <Link href="/vendor/shop" className="text-neutral-500 p-3 hover:text-white transition-all active:scale-95 duration-200">
          <span className="material-symbols-outlined">storefront</span>
        </Link>
        <Link href="/vendor/subscription" className="text-neutral-500 p-3 hover:text-white transition-all active:scale-95 duration-200">
          <span className="material-symbols-outlined">workspace_premium</span>
        </Link>
      </nav>
    </div>
  );
}
