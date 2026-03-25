import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

async function getAdminStats() {
  const [totalVendors, activeShops, totalRevenue, recentPayments, pendingSubscriptions] =
    await Promise.all([
      prisma.user.count({ where: { role: "VENDOR" } }),
      prisma.shop.count({ where: { isActive: true } }),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: "captured" },
      }),
      prisma.payment.findMany({
        where: { status: "captured" },
        include: {
          user: { select: { name: true, email: true } },
          subscription: { include: { plan: { select: { name: true } } } },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.subscription.count({ where: { status: "EXPIRED" } }),
    ]);

  return {
    totalVendors,
    activeShops,
    totalRevenue: totalRevenue._sum.amount || 0,
    recentPayments,
    pendingSubscriptions,
  };
}

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user || (session.user as { role: string }).role !== "ADMIN") {
    redirect("/auth/login");
  }

  const stats = await getAdminStats();

  const statCards = [
    { label: "Total Vendors", value: stats.totalVendors, icon: "group", color: "text-primary" },
    { label: "Active Shops", value: stats.activeShops, icon: "storefront", color: "text-secondary" },
    { label: "Total Revenue", value: formatCurrency(stats.totalRevenue), icon: "payments", color: "text-tertiary" },
    { label: "Expired Subs", value: stats.pendingSubscriptions, icon: "warning", color: "text-error" },
  ];

  return (
    <div className="min-h-screen bg-black font-body">
      {/* Header */}
      <header className="bg-black/60 backdrop-blur-xl px-8 py-4 border-b border-outline-variant/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-black text-primary tracking-tighter font-headline">Luminous</Link>
            <nav className="hidden md:flex items-center gap-6 text-sm font-headline font-bold">
              <span className="text-white border-b-2 border-white pb-0.5">Dashboard</span>
              <Link href="/admin/vendors" className="text-neutral-400 hover:text-white transition-colors">Vendors</Link>
              <Link href="/admin/payments" className="text-neutral-400 hover:text-white transition-colors">Payments</Link>
              <Link href="/admin/plans" className="text-neutral-400 hover:text-white transition-colors">Plans</Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-on-surface-variant text-sm">Admin</span>
            <Link
              href="/api/auth/signout"
              className="text-error text-sm hover:underline"
            >
              Sign out
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-10 pb-24">
        <h1 className="text-3xl font-headline font-extrabold text-white mb-8">Admin Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {statCards.map((card) => (
            <div key={card.label} className="bg-surface-container rounded-xl border border-outline-variant/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-on-surface-variant text-xs uppercase tracking-widest font-bold">{card.label}</span>
                <span className={`material-symbols-outlined ${card.color}`}>{card.icon}</span>
              </div>
              <div className="text-3xl font-headline font-extrabold text-white">{card.value}</div>
            </div>
          ))}
        </div>

        {/* Recent Payments */}
        <div className="bg-surface-container rounded-xl border border-outline-variant/10 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-headline font-bold text-xl text-white">Recent Payments</h2>
            <Link href="/admin/payments" className="text-primary text-sm font-bold hover:underline">View all</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-on-surface-variant text-xs uppercase tracking-widest border-b border-outline-variant/10">
                  <th className="text-left pb-3 font-semibold">Vendor</th>
                  <th className="text-left pb-3 font-semibold">Plan</th>
                  <th className="text-right pb-3 font-semibold">Amount</th>
                  <th className="text-right pb-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {stats.recentPayments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="py-3">
                      <div>
                        <p className="text-white font-medium">{payment.user.name}</p>
                        <p className="text-on-surface-variant text-xs">{payment.user.email}</p>
                      </div>
                    </td>
                    <td className="py-3 text-on-surface-variant">
                      {payment.subscription?.plan?.name || "—"}
                    </td>
                    <td className="py-3 text-right font-bold text-primary">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="py-3 text-right">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${
                        payment.status === "captured"
                          ? "bg-primary/10 text-primary"
                          : "bg-error/10 text-error"
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {stats.recentPayments.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-on-surface-variant">No payments yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Link href="/admin/vendors" className="bg-surface-container rounded-xl border border-outline-variant/10 p-6 flex items-center gap-4 hover:border-primary/20 transition-colors group">
            <span className="material-symbols-outlined text-primary text-3xl">group</span>
            <div>
              <p className="font-headline font-bold text-white">Manage Vendors</p>
              <p className="text-on-surface-variant text-xs">{stats.totalVendors} vendors registered</p>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant ml-auto group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </Link>
          <Link href="/admin/payments" className="bg-surface-container rounded-xl border border-outline-variant/10 p-6 flex items-center gap-4 hover:border-primary/20 transition-colors group">
            <span className="material-symbols-outlined text-secondary text-3xl">payments</span>
            <div>
              <p className="font-headline font-bold text-white">View Payments</p>
              <p className="text-on-surface-variant text-xs">{formatCurrency(stats.totalRevenue)} total</p>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant ml-auto group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </Link>
          <Link href="/admin/plans" className="bg-surface-container rounded-xl border border-outline-variant/10 p-6 flex items-center gap-4 hover:border-primary/20 transition-colors group">
            <span className="material-symbols-outlined text-tertiary text-3xl">workspace_premium</span>
            <div>
              <p className="font-headline font-bold text-white">Manage Plans</p>
              <p className="text-on-surface-variant text-xs">Edit subscription plans</p>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant ml-auto group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </Link>
        </div>
      </main>
    </div>
  );
}
