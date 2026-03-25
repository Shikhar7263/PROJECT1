import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

async function getShop(slug: string) {
  return prisma.shop.findUnique({
    where: { slug },
    include: {
      products: {
        orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      },
      categories: true,
      user: {
        select: {
          subscription: {
            select: { status: true, endDate: true },
          },
        },
      },
    },
  });
}

export default async function ShopPage({ params }: { params: { slug: string } }) {
  const shop = await getShop(params.slug);

  if (!shop) notFound();

  const isSubscriptionActive = shop.user.subscription?.status === "ACTIVE";

  return (
    <div className="min-h-screen bg-black font-body">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/60 backdrop-blur-xl px-6 py-4 border-b border-outline-variant/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/marketplace" className="flex items-center gap-2 text-on-surface-variant hover:text-on-surface transition-colors">
            <span className="material-symbols-outlined text-base">arrow_back</span>
            <span className="text-sm">Marketplace</span>
          </Link>
          <Link href="/" className="text-xl font-black text-primary tracking-tighter font-headline">
            Luminous
          </Link>
          <div className="w-24" />
        </div>
      </header>

      {/* Shop Hero */}
      <div className="relative">
        {/* Banner */}
        <div className="h-56 md:h-72 bg-surface-container-high relative overflow-hidden">
          {shop.banner ? (
            <Image src={shop.banner} alt={`${shop.name} banner`} fill className="object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-surface-container-high to-surface" />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60" />
        </div>

        {/* Shop Info Card */}
        <div className="max-w-7xl mx-auto px-6 -mt-16 relative z-10">
          <div className="bg-surface-container rounded-xl p-8 border border-outline-variant/10">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
              {/* Logo */}
              <div className="w-20 h-20 rounded-xl bg-surface-container-high overflow-hidden flex-shrink-0 border border-outline-variant/20">
                {shop.logo ? (
                  <Image src={shop.logo} alt={shop.name} width={80} height={80} className="object-cover w-full h-full" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-3xl text-on-surface-variant/50">storefront</span>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-3xl font-headline font-extrabold text-on-surface tracking-tight">
                    {shop.name}
                  </h1>
                  {isSubscriptionActive ? (
                    <span className="bg-primary/10 text-primary px-3 py-0.5 rounded-full text-xs font-bold tracking-widest uppercase">
                      Active
                    </span>
                  ) : (
                    <span className="bg-error/10 text-error px-3 py-0.5 rounded-full text-xs font-bold tracking-widest uppercase">
                      Unavailable
                    </span>
                  )}
                </div>
                {shop.description && (
                  <p className="text-on-surface-variant mt-2 max-w-2xl">{shop.description}</p>
                )}
                <div className="flex flex-wrap gap-4 mt-3 text-sm text-on-surface-variant">
                  {shop.city && (
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-base">location_on</span>
                      {shop.city}{shop.state ? `, ${shop.state}` : ""}
                    </span>
                  )}
                  {shop.whatsapp && (
                    <a
                      href={`https://wa.me/${shop.whatsapp.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-primary hover:underline"
                    >
                      <span className="material-symbols-outlined text-base">chat</span>
                      WhatsApp
                    </a>
                  )}
                  {shop.openTime && shop.closeTime && (
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-base">schedule</span>
                      {shop.openTime} – {shop.closeTime}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {!isSubscriptionActive ? (
          <div className="text-center py-24 bg-surface-container rounded-xl border border-outline-variant/10">
            <span className="material-symbols-outlined text-6xl text-on-surface-variant/30 mb-4 block">
              store_mall_directory
            </span>
            <h2 className="text-2xl font-headline font-bold text-on-surface mb-3">
              Shop Temporarily Unavailable
            </h2>
            <p className="text-on-surface-variant max-w-sm mx-auto">
              This shop&apos;s subscription has expired. Check back later.
            </p>
          </div>
        ) : shop.products.length === 0 ? (
          <div className="text-center py-24 text-on-surface-variant">
            <span className="material-symbols-outlined text-6xl mb-4 block">inventory_2</span>
            <p className="text-xl font-headline">No products yet</p>
          </div>
        ) : (
          <>
            {/* Category filter */}
            {shop.categories.length > 0 && (
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-4 mb-8">
                <button className="bg-primary text-on-primary px-6 py-2 rounded-full text-sm font-bold whitespace-nowrap">
                  All
                </button>
                {shop.categories.map((cat) => (
                  <button
                    key={cat.id}
                    className="bg-surface-container-high/60 hover:bg-surface-container-high text-on-surface-variant px-6 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors"
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {shop.products.map((product) => (
                <div
                  key={product.id}
                  className="group bg-surface-container rounded-xl overflow-hidden border border-outline-variant/10 hover:border-primary/20 transition-all duration-300"
                >
                  {/* Product Image */}
                  <div className="aspect-square bg-surface-container-high relative overflow-hidden">
                    {product.images[0] ? (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-4xl text-on-surface-variant/30">
                          image
                        </span>
                      </div>
                    )}
                    {product.featured && (
                      <div className="absolute top-2 left-2 bg-primary text-on-primary text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Featured
                      </div>
                    )}
                    {!product.inStock && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-white text-sm font-bold uppercase tracking-wider">
                          Out of Stock
                        </span>
                      </div>
                    )}
                  </div>
                  {/* Product Info */}
                  <div className="p-4">
                    <h3 className="font-headline font-bold text-on-surface text-sm mb-1 line-clamp-2">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-primary font-bold">
                        {formatCurrency(product.salePrice || product.price)}
                      </span>
                      {product.salePrice && (
                        <span className="text-on-surface-variant text-xs line-through">
                          {formatCurrency(product.price)}
                        </span>
                      )}
                    </div>
                    {shop.whatsapp && (
                      <a
                        href={`https://wa.me/${shop.whatsapp.replace(/\D/g, "")}?text=Hi, I'm interested in ${encodeURIComponent(product.name)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 w-full flex items-center justify-center gap-1.5 bg-surface-container-high hover:bg-primary hover:text-on-primary text-on-surface text-xs font-bold py-2.5 rounded-full transition-all duration-200 border border-outline-variant/20"
                      >
                        <span className="material-symbols-outlined text-sm">chat</span>
                        Enquire
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
