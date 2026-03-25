import Link from "next/link";
import { auth } from "@/lib/auth";

export default async function HomePage() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-black font-body selection:bg-primary/30">
      {/* Top Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-xl">
        <div className="flex justify-between items-center w-full px-8 py-4 max-w-7xl mx-auto">
          <div className="text-2xl font-black text-primary tracking-tighter font-headline">
            Luminous
          </div>
          <div className="hidden md:flex items-center gap-8 font-headline tracking-tight font-semibold">
            <Link
              href="/marketplace"
              className="text-on-surface-variant hover:text-on-surface transition-colors"
            >
              Marketplace
            </Link>
            <a href="#pricing" className="text-on-surface-variant hover:text-on-surface transition-colors">
              Pricing
            </a>
          </div>
          <div className="flex items-center gap-4">
            {session ? (
              <Link
                href={
                  (session.user as { role: string }).role === "ADMIN"
                    ? "/admin/dashboard"
                    : "/vendor/dashboard"
                }
                className="bg-primary text-on-primary px-6 py-2.5 rounded-full font-bold transition-transform active:scale-90 font-headline hover:opacity-90"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-on-surface-variant hover:text-on-surface font-semibold transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="bg-primary text-on-primary px-6 py-2.5 rounded-full font-bold transition-transform active:scale-90 font-headline hover:opacity-90"
                >
                  Become a Vendor
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative pt-32 pb-20 overflow-hidden">
        {/* Atmospheric Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[800px] hero-glow pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="font-headline text-5xl md:text-8xl font-extrabold tracking-tighter text-on-surface mb-8">
            Sell <span className="text-primary italic">Anywhere</span>,<br />
            Everywhere.
          </h1>
          <p className="text-on-surface-variant text-lg md:text-xl max-w-2xl mx-auto mb-12 font-medium">
            The ethereal curator for modern commerce. Luminous transforms your digital storefront
            into a premium gallery experience.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link
              href="/auth/signup"
              className="w-full sm:w-auto px-10 py-5 rounded-full font-bold text-lg bg-gradient-to-r from-primary to-primary-fixed-dim text-on-primary shadow-[0_0_40px_rgba(152,255,217,0.2)] hover:shadow-[0_0_60px_rgba(152,255,217,0.3)] transition-all duration-300 font-headline"
            >
              Start Selling
            </Link>
            <Link
              href="/marketplace"
              className="w-full sm:w-auto px-10 py-5 rounded-full font-bold text-lg border border-outline-variant hover:bg-surface-variant/20 transition-all font-headline"
            >
              Explore Shops
            </Link>
          </div>

          {/* Hero Visual */}
          <div className="mt-24 relative max-w-5xl mx-auto group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-tertiary/10 to-secondary/20 rounded-xl blur-2xl opacity-50" />
            <div className="relative bg-surface rounded-xl overflow-hidden aspect-[16/9] flex items-center justify-center">
              <div className="text-on-surface-variant text-sm">Dashboard Preview</div>
            </div>
          </div>
        </div>
      </main>

      {/* Features Section (Bento Grid) */}
      <section className="py-32 bg-surface-container-lowest">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-panel p-10 rounded-xl flex flex-col items-start gap-6 border border-outline-variant/10 group hover:bg-surface-variant/30 transition-all duration-500">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-3xl">brush</span>
              </div>
              <div>
                <h3 className="font-headline text-2xl font-bold text-on-surface mb-3">
                  Beautiful Canvas
                </h3>
                <p className="text-on-surface-variant leading-relaxed">
                  Design a storefront that breathes. Custom editorial layouts that treat your
                  products like fine art.
                </p>
              </div>
            </div>

            <div className="glass-panel p-10 rounded-xl flex flex-col items-start gap-6 border border-outline-variant/10 group hover:bg-surface-variant/30 transition-all duration-500">
              <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-3xl">payments</span>
              </div>
              <div>
                <h3 className="font-headline text-2xl font-bold text-on-surface mb-3">
                  Seamless Payments
                </h3>
                <p className="text-on-surface-variant leading-relaxed">
                  Integrated Razorpay checkout with support for UPI, cards, and net banking.
                  Frictionless from day one.
                </p>
              </div>
            </div>

            <div className="glass-panel p-10 rounded-xl flex flex-col items-start gap-6 border border-outline-variant/10 group hover:bg-surface-variant/30 transition-all duration-500">
              <div className="w-14 h-14 rounded-2xl bg-tertiary/10 flex items-center justify-center text-tertiary">
                <span className="material-symbols-outlined text-3xl">qr_code_2</span>
              </div>
              <div>
                <h3 className="font-headline text-2xl font-bold text-on-surface mb-3">
                  QR Integrated
                </h3>
                <p className="text-on-surface-variant leading-relaxed">
                  Bridging physical and digital. Generate dynamic QR codes for physical pop-ups and
                  print materials.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-headline text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Simple Pricing
          </h2>
          <p className="text-on-surface-variant text-lg">
            Start free, scale as you grow.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Monthly Plan */}
          <div className="bg-surface-container rounded-xl border border-outline-variant/20 p-8">
            <h3 className="font-headline text-xl font-bold mb-2">Monthly</h3>
            <div className="text-4xl font-headline font-extrabold text-primary mb-1">
              ₹499
            </div>
            <p className="text-on-surface-variant text-sm mb-6">per month</p>
            <ul className="space-y-2 mb-8">
              {["Unlimited products", "QR code generation", "Analytics dashboard", "Priority support"].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-on-surface-variant">
                  <span className="material-symbols-outlined text-primary text-base">check_circle</span>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/auth/signup"
              className="block w-full text-center bg-surface-container-high border border-outline-variant/30 text-on-surface font-bold py-3 rounded-full hover:bg-surface-bright transition-colors"
            >
              Get Started
            </Link>
          </div>

          {/* Yearly Plan */}
          <div className="bg-surface-container rounded-xl border border-primary/30 p-8 relative">
            <div className="absolute -top-3 right-6 bg-primary text-on-primary text-xs font-bold px-3 py-1 rounded-full">
              Best Value
            </div>
            <h3 className="font-headline text-xl font-bold mb-2">Yearly</h3>
            <div className="text-4xl font-headline font-extrabold text-primary mb-1">
              ₹4,499
            </div>
            <p className="text-on-surface-variant text-sm mb-6">per year · 2 months free</p>
            <ul className="space-y-2 mb-8">
              {["Unlimited products", "QR code generation", "Analytics dashboard", "Priority support", "Custom domain", "2 months free"].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-on-surface-variant">
                  <span className="material-symbols-outlined text-primary text-base">check_circle</span>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/auth/signup"
              className="block w-full text-center bg-primary text-on-primary font-bold py-3 rounded-full hover:opacity-90 transition-opacity"
            >
              Get Started
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 max-w-7xl mx-auto px-6">
        <div className="relative bg-surface rounded-xl p-12 md:p-24 overflow-hidden text-center border border-outline-variant/10">
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-primary/20 blur-[120px] rounded-full" />
          <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-secondary/10 blur-[120px] rounded-full" />
          <div className="relative z-10">
            <h2 className="font-headline text-4xl md:text-6xl font-bold mb-8 tracking-tight">
              Join 1000+ Vendors today
            </h2>
            <p className="text-on-surface-variant text-lg max-w-xl mx-auto mb-12">
              Start your journey with Luminous and scale your commerce to the next level with our
              premium curation tools.
            </p>
            <Link
              href="/auth/signup"
              className="inline-block bg-primary text-on-primary px-12 py-5 rounded-full font-extrabold text-xl font-headline transition-transform hover:scale-105 active:scale-95 shadow-xl"
            >
              Get Started Now
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full rounded-t-xl mt-20 bg-surface">
        <div className="flex flex-col md:flex-row justify-between items-center w-full px-12 py-16 max-w-7xl mx-auto gap-8">
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="text-xl font-bold text-on-surface font-headline">Luminous</div>
            <div className="text-sm text-on-surface-variant">© 2024 Luminous Digital. All rights reserved.</div>
          </div>
          <div className="flex flex-wrap justify-center gap-8">
            <Link href="/marketplace" className="text-on-surface-variant text-sm hover:text-primary transition-colors">
              Marketplace
            </Link>
            <a href="#pricing" className="text-on-surface-variant text-sm hover:text-primary transition-colors">
              Pricing
            </a>
            <Link href="/auth/signup" className="text-primary underline text-sm hover:text-primary transition-colors">
              Join 1000+ Vendors
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
