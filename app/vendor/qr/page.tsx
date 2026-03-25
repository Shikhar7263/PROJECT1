"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

export default function VendorQRPage() {
  const [shopId, setShopId] = useState<string | null>(null);
  const [shopSlug, setShopSlug] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [shopUrl, setShopUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/vendor/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data.shop) {
          setShopId(data.data.shop.id);
          setShopSlug(data.data.shop.slug);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  async function generateQR() {
    if (!shopId) return;
    setGenerating(true);
    setError("");
    try {
      const res = await fetch(`/api/qr/${shopId}`);
      const data = await res.json();
      if (data.success) {
        setQrCode(data.data.qrCode);
        setShopUrl(data.data.url);
      } else {
        setError(data.error || "Failed to generate QR code");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setGenerating(false);
    }
  }

  function downloadQR() {
    if (!qrCode) return;
    const link = document.createElement("a");
    link.href = qrCode;
    link.download = `shop-qr-${shopSlug}.png`;
    link.click();
  }

  return (
    <div className="min-h-screen bg-black font-body">
      {/* Header */}
      <header className="bg-black/60 backdrop-blur-xl rounded-full mt-4 mx-4 px-6 py-2 sticky top-0 z-50 flex justify-between items-center w-[calc(100%-2rem)] max-w-5xl md:mx-auto">
        <Link href="/" className="text-xl font-bold tracking-tighter text-white font-headline">Luminous</Link>
        <div className="hidden md:flex items-center gap-6 text-sm font-headline font-bold">
          <Link href="/vendor/dashboard" className="text-neutral-400 hover:text-white px-3 py-1 rounded-full">Overview</Link>
          <Link href="/vendor/products" className="text-neutral-400 hover:text-white px-3 py-1 rounded-full">Products</Link>
          <Link href="/vendor/shop" className="text-neutral-400 hover:text-white px-3 py-1 rounded-full">My Shop</Link>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-6 pt-10 pb-24">
        <h1 className="text-3xl font-headline font-extrabold text-white mb-2">QR Code</h1>
        <p className="text-on-surface-variant text-sm mb-8">
          Generate a QR code for your shop to use on flyers, packaging, and physical displays.
        </p>

        {error && (
          <div className="bg-error/10 border border-error/30 text-error rounded-DEFAULT px-4 py-3 mb-6 text-sm">{error}</div>
        )}

        {loading ? (
          <div className="text-center py-20 text-on-surface-variant">Loading...</div>
        ) : !shopId ? (
          <div className="text-center py-16 bg-surface-container rounded-xl border border-outline-variant/10">
            <p className="text-on-surface-variant mb-4">No shop found. Set up your shop first.</p>
            <Link href="/vendor/shop" className="bg-primary text-on-primary px-6 py-2.5 rounded-full font-bold font-headline">
              Set Up Shop
            </Link>
          </div>
        ) : (
          <div className="bg-surface-container rounded-xl border border-outline-variant/10 p-8 text-center">
            {qrCode ? (
              <>
                <div className="inline-block p-4 bg-white rounded-xl mb-6">
                  <Image src={qrCode} alt="Shop QR Code" width={240} height={240} className="rounded-lg" />
                </div>
                {shopUrl && (
                  <p className="text-on-surface-variant text-xs mb-6 break-all">
                    Points to: <a href={shopUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{shopUrl}</a>
                  </p>
                )}
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={downloadQR}
                    className="bg-primary text-on-primary px-8 py-3 rounded-full font-bold font-headline hover:opacity-90 transition-opacity flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-base">download</span>
                    Download PNG
                  </button>
                  <button
                    onClick={generateQR}
                    className="border border-outline-variant/30 text-on-surface-variant px-6 py-3 rounded-full font-bold text-sm hover:text-white transition-colors"
                  >
                    Regenerate
                  </button>
                </div>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-6xl text-on-surface-variant/30 mb-4 block">qr_code_2</span>
                <h2 className="text-xl font-headline font-bold text-white mb-2">Your Shop QR Code</h2>
                <p className="text-on-surface-variant text-sm mb-6">
                  Generate a QR code that links directly to your shop page.
                </p>
                <button
                  onClick={generateQR}
                  disabled={generating}
                  className="bg-primary text-on-primary px-10 py-4 rounded-full font-bold font-headline hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2 mx-auto"
                >
                  <span className="material-symbols-outlined text-base">qr_code</span>
                  {generating ? "Generating..." : "Generate QR Code"}
                </button>
              </>
            )}
          </div>
        )}
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-auto min-w-[280px] rounded-full px-4 py-3 z-50 bg-neutral-900/80 backdrop-blur-2xl shadow-2xl flex justify-around items-center gap-4">
        <Link href="/vendor/dashboard" className="text-neutral-500 p-3 hover:text-white">
          <span className="material-symbols-outlined">dashboard</span>
        </Link>
        <Link href="/vendor/products" className="text-neutral-500 p-3 hover:text-white">
          <span className="material-symbols-outlined">inventory_2</span>
        </Link>
        <Link href="/vendor/shop" className="text-neutral-500 p-3 hover:text-white">
          <span className="material-symbols-outlined">storefront</span>
        </Link>
        <Link href="/vendor/subscription" className="text-neutral-500 p-3 hover:text-white">
          <span className="material-symbols-outlined">workspace_premium</span>
        </Link>
      </nav>
    </div>
  );
}
