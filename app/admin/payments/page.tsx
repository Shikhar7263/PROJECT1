import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";

async function getPayments() {
  const [payments, stats] = await Promise.all([
    prisma.payment.findMany({
      include: {
        user: { select: { name: true, email: true } },
        subscription: { include: { plan: { select: { name: true } } } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.payment.aggregate({
      _sum: { amount: true },
      _count: true,
      where: { status: "captured" },
    }),
  ]);
  return { payments, stats };
}

export default async function AdminPaymentsPage() {
  const session = await auth();
  if (!session?.user || (session.user as { role: string }).role !== "ADMIN") {
    redirect("/auth/login");
  }

  const { payments, stats } = await getPayments();

  return (
    <div className="min-h-screen bg-black font-body">
      {/* Header */}
      <header className="bg-black/60 backdrop-blur-xl px-8 py-4 border-b border-outline-variant/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-black text-primary tracking-tighter font-headline">Luminous</Link>
            <nav className="hidden md:flex items-center gap-6 text-sm font-headline font-bold">
              <Link href="/admin/dashboard" className="text-neutral-400 hover:text-white">Dashboard</Link>
              <Link href="/admin/vendors" className="text-neutral-400 hover:text-white">Vendors</Link>
              <span className="text-white border-b-2 border-white pb-0.5">Payments</span>
              <Link href="/admin/plans" className="text-neutral-400 hover:text-white">Plans</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-10 pb-24">
        <h1 className="text-3xl font-headline font-extrabold text-white mb-4">Payments</h1>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <div className="bg-surface-container rounded-xl border border-outline-variant/10 p-6">
            <p className="text-on-surface-variant text-xs uppercase tracking-widest mb-2 font-bold">Total Revenue</p>
            <p className="text-4xl font-headline font-extrabold text-primary">{formatCurrency(stats._sum.amount || 0)}</p>
          </div>
          <div className="bg-surface-container rounded-xl border border-outline-variant/10 p-6">
            <p className="text-on-surface-variant text-xs uppercase tracking-widest mb-2 font-bold">Successful Transactions</p>
            <p className="text-4xl font-headline font-extrabold text-white">{stats._count}</p>
          </div>
        </div>

        <div className="bg-surface-container rounded-xl border border-outline-variant/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-on-surface-variant text-xs uppercase tracking-widest border-b border-outline-variant/10 bg-surface-container-high">
                  <th className="text-left px-6 py-4 font-semibold">Vendor</th>
                  <th className="text-left px-6 py-4 font-semibold">Plan</th>
                  <th className="text-right px-6 py-4 font-semibold">Amount</th>
                  <th className="text-left px-6 py-4 font-semibold">Status</th>
                  <th className="text-left px-6 py-4 font-semibold">Date</th>
                  <th className="text-left px-6 py-4 font-semibold">Razorpay ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-surface-container-high/50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-white font-medium">{payment.user.name}</p>
                        <p className="text-on-surface-variant text-xs">{payment.user.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-on-surface-variant">
                      {payment.subscription?.plan?.name || "—"}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-primary">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${
                        payment.status === "captured" ? "bg-primary/10 text-primary" :
                        payment.status === "failed" ? "bg-error/10 text-error" :
                        "bg-outline/10 text-on-surface-variant"
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-on-surface-variant text-xs">
                      {formatDate(payment.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-on-surface-variant text-xs font-mono">
                      {payment.razorpayPaymentId ? payment.razorpayPaymentId.slice(-8) : "—"}
                    </td>
                  </tr>
                ))}
                {payments.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center text-on-surface-variant">No payments yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
