import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

async function getVendors() {
  return prisma.user.findMany({
    where: { role: "VENDOR" },
    include: {
      shop: { select: { name: true, slug: true, isActive: true, _count: { select: { products: true } } } },
      subscription: { include: { plan: { select: { name: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export default async function AdminVendorsPage() {
  const session = await auth();
  if (!session?.user || (session.user as { role: string }).role !== "ADMIN") {
    redirect("/auth/login");
  }

  const vendors = await getVendors();

  return (
    <div className="min-h-screen bg-black font-body">
      {/* Header */}
      <header className="bg-black/60 backdrop-blur-xl px-8 py-4 border-b border-outline-variant/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-black text-primary tracking-tighter font-headline">Luminous</Link>
            <nav className="hidden md:flex items-center gap-6 text-sm font-headline font-bold">
              <Link href="/admin/dashboard" className="text-neutral-400 hover:text-white">Dashboard</Link>
              <span className="text-white border-b-2 border-white pb-0.5">Vendors</span>
              <Link href="/admin/payments" className="text-neutral-400 hover:text-white">Payments</Link>
              <Link href="/admin/plans" className="text-neutral-400 hover:text-white">Plans</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-10 pb-24">
        <h1 className="text-3xl font-headline font-extrabold text-white mb-8">
          Vendors <span className="text-on-surface-variant text-xl font-normal">({vendors.length})</span>
        </h1>

        <div className="bg-surface-container rounded-xl border border-outline-variant/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-on-surface-variant text-xs uppercase tracking-widest border-b border-outline-variant/10 bg-surface-container-high">
                  <th className="text-left px-6 py-4 font-semibold">Vendor</th>
                  <th className="text-left px-6 py-4 font-semibold">Shop</th>
                  <th className="text-left px-6 py-4 font-semibold">Products</th>
                  <th className="text-left px-6 py-4 font-semibold">Subscription</th>
                  <th className="text-left px-6 py-4 font-semibold">Joined</th>
                  <th className="text-left px-6 py-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {vendors.map((vendor) => (
                  <tr key={vendor.id} className="hover:bg-surface-container-high/50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-white font-medium">{vendor.name}</p>
                        <p className="text-on-surface-variant text-xs">{vendor.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {vendor.shop ? (
                        <div>
                          <Link href={`/shop/${vendor.shop.slug}`} target="_blank" className="text-primary hover:underline text-xs">
                            {vendor.shop.name}
                          </Link>
                          <div className="flex items-center gap-1 mt-0.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${vendor.shop.isActive ? "bg-primary" : "bg-error"}`} />
                            <span className="text-on-surface-variant text-xs">{vendor.shop.isActive ? "Active" : "Inactive"}</span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-on-surface-variant text-xs">No shop</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-on-surface-variant">
                      {vendor.shop?._count.products ?? 0}
                    </td>
                    <td className="px-6 py-4">
                      {vendor.subscription ? (
                        <div>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${
                            vendor.subscription.status === "ACTIVE" ? "bg-primary/10 text-primary" :
                            vendor.subscription.status === "EXPIRED" ? "bg-error/10 text-error" :
                            "bg-outline/10 text-on-surface-variant"
                          }`}>
                            {vendor.subscription.status}
                          </span>
                          <p className="text-on-surface-variant text-xs mt-0.5">{vendor.subscription.plan.name}</p>
                        </div>
                      ) : (
                        <span className="text-on-surface-variant text-xs">No plan</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-on-surface-variant text-xs">
                      {formatDate(vendor.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      {vendor.shop && (
                        <Link
                          href={`/shop/${vendor.shop.slug}`}
                          target="_blank"
                          className="text-primary text-xs hover:underline"
                        >
                          View Shop
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
                {vendors.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center text-on-surface-variant">
                      No vendors registered yet
                    </td>
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
