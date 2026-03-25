import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";

async function getShops(search?: string) {
  return prisma.shop.findMany({
    where: {
      isActive: true,
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
          { city: { contains: search, mode: "insensitive" } },
        ],
      }),
    },
    include: {
      _count: { select: { products: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 24,
  });
}

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: { search?: string };
}) {
  const shops = await getShops(searchParams.search);

  return (
    <div className="min-h-screen bg-black font-body">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-8 py-3 rounded-full mt-4 mx-auto max-w-7xl w-[95%] bg-neutral-900/60 backdrop-blur-2xl shadow-[0_16px_48px_rgba(225,195,255,0.08)]">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-2xl font-bold tracking-tighter text-primary font-headline">
            Luminous
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <span className="text-primary font-bold border-b-2 border-primary pb-1 text-sm tracking-tight">
              Marketplace
            </span>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <form method="GET">
            <div className="relative hidden sm:block">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">
                search
              </span>
              <input
                name="search"
                defaultValue={searchParams.search || ""}
                className="bg-surface-container-high/40 border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-1 focus:ring-primary/50 w-64 placeholder:text-on-surface-variant/50 text-on-surface"
                placeholder="Search shops..."
                type="text"
              />
            </div>
          </form>
          <Link href="/auth/login" className="text-primary font-bold text-sm hover:opacity-80 transition-opacity">
            Sign In
          </Link>
        </div>
      </header>

      <main className="relative">
        {/* Hero Section */}
        <section className="relative pt-24 pb-16 px-6 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div className="max-w-2xl">
                <span className="text-secondary font-label tracking-[0.2em] text-xs font-bold uppercase mb-4 block">
                  The Collective
                </span>
                <h1 className="text-6xl md:text-8xl font-headline font-extrabold tracking-tighter text-on-background leading-none">
                  Explore <br />
                  <span className="text-primary">Shops.</span>
                </h1>
              </div>
              <p className="text-on-surface-variant font-body text-lg max-w-sm mb-2 opacity-80">
                Discover a curated ecosystem of independent designers and digital artisans shaping
                the new aesthetic.
              </p>
            </div>
          </div>
        </section>

        {/* Shop Grid */}
        <section className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 pb-32">
          {shops.length === 0 ? (
            <div className="col-span-3 text-center py-24 text-on-surface-variant">
              <span className="material-symbols-outlined text-6xl mb-4 block">storefront</span>
              <p className="text-xl font-headline">No shops found</p>
              <p className="text-sm mt-2">
                {searchParams.search
                  ? "Try a different search term"
                  : "Be the first to open a shop!"}
              </p>
              <Link
                href="/auth/signup"
                className="inline-block mt-6 bg-primary text-on-primary px-8 py-3 rounded-full font-bold font-headline hover:opacity-90 transition-opacity"
              >
                Open Your Shop
              </Link>
            </div>
          ) : (
            shops.map((shop) => (
              <div
                key={shop.id}
                className="group relative bg-surface-container rounded-xl overflow-hidden hover:shadow-[0_16px_64px_rgba(225,195,255,0.08)] transition-all duration-500"
              >
                <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
                <div className="h-48 overflow-hidden relative bg-surface-container-high">
                  {shop.banner ? (
                    <Image
                      src={shop.banner}
                      alt={shop.name}
                      fill
                      className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-5xl text-on-surface-variant/30">
                        storefront
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-container via-transparent to-transparent opacity-60" />
                </div>
                <div className="p-8">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-headline font-bold text-on-surface tracking-tight mb-1">
                        {shop.name}
                      </h3>
                      <span className="text-on-surface-variant text-sm font-medium">
                        {shop.city ? `${shop.city}${shop.state ? `, ${shop.state}` : ""}` : "Online Store"}
                      </span>
                    </div>
                    <span className="bg-surface-container-high text-on-surface-variant px-2 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase">
                      {shop._count.products} items
                    </span>
                  </div>
                  {shop.description && (
                    <p className="text-on-surface-variant text-sm line-clamp-2 mb-4">
                      {shop.description}
                    </p>
                  )}
                  <Link
                    href={`/shop/${shop.slug}`}
                    className="block w-full text-center bg-surface-bright/10 hover:bg-primary hover:text-on-primary backdrop-blur-md text-on-surface font-bold py-3.5 rounded-full transition-all duration-300 group-hover:scale-[1.02] border border-outline-variant/20"
                  >
                    Visit Shop
                  </Link>
                </div>
              </div>
            ))
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full flex flex-col md:flex-row justify-between items-center gap-6 py-12 px-8 mt-4 bg-neutral-950 border-t border-neutral-800/30">
        <div>
          <span className="text-lg font-black text-primary font-headline">Luminous</span>
          <p className="text-xs tracking-wide text-on-surface-variant mt-2">
            © 2024 The Luminous Curator
          </p>
        </div>
        <div className="flex gap-8">
          <Link href="/" className="text-xs tracking-wide text-on-surface-variant hover:text-primary transition-colors">
            Home
          </Link>
          <Link href="/auth/signup" className="text-xs tracking-wide text-on-surface-variant hover:text-primary transition-colors">
            Become a Vendor
          </Link>
        </div>
      </footer>
    </div>
  );
}
