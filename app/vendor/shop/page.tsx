"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type ShopData = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo: string | null;
  banner: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  whatsapp: string | null;
  email: string | null;
  openTime: string | null;
  closeTime: string | null;
  isActive: boolean;
};

export default function VendorShopPage() {
  const [shop, setShop] = useState<ShopData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    description: "",
    logo: "",
    banner: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    whatsapp: "",
    email: "",
    openTime: "",
    closeTime: "",
  });

  useEffect(() => {
    fetch("/api/vendor/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data.shop) {
          const s = data.data.shop as ShopData;
          setShop(s);
          setForm({
            name: s.name || "",
            description: s.description || "",
            logo: s.logo || "",
            banner: s.banner || "",
            address: s.address || "",
            city: s.city || "",
            state: s.state || "",
            pincode: s.pincode || "",
            whatsapp: s.whatsapp || "",
            email: s.email || "",
            openTime: s.openTime || "",
            closeTime: s.closeTime || "",
          });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setSaving(true);
    try {
      const res = await fetch("/api/shops", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save");
      } else {
        setSuccess(true);
        setShop(data.data);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "w-full bg-surface-container-high border border-outline-variant/30 rounded-DEFAULT px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary/50 placeholder:text-on-surface-variant/50";

  return (
    <div className="min-h-screen bg-black font-body">
      {/* Header */}
      <header className="bg-black/60 backdrop-blur-xl rounded-full mt-4 mx-4 px-6 py-2 sticky top-0 z-50 flex justify-between items-center w-[calc(100%-2rem)] max-w-5xl md:mx-auto">
        <Link href="/" className="text-xl font-bold tracking-tighter text-white font-headline">Luminous</Link>
        <div className="hidden md:flex items-center gap-6 text-sm font-headline font-bold">
          <Link href="/vendor/dashboard" className="text-neutral-400 hover:text-white px-3 py-1 rounded-full transition-colors">Overview</Link>
          <Link href="/vendor/products" className="text-neutral-400 hover:text-white px-3 py-1 rounded-full transition-colors">Products</Link>
          <span className="text-white border-b-2 border-white pb-0.5">My Shop</span>
        </div>
        {shop && (
          <Link href={`/shop/${shop.slug}`} target="_blank" className="text-primary text-sm font-bold hover:underline">
            Preview →
          </Link>
        )}
      </header>

      <main className="max-w-2xl mx-auto px-6 pt-10 pb-24">
        <div className="mb-8">
          <h1 className="text-3xl font-headline font-extrabold text-white">Shop Settings</h1>
          {shop && (
            <p className="text-on-surface-variant text-sm mt-1">
              Your shop URL:{" "}
              <Link href={`/shop/${shop.slug}`} target="_blank" className="text-primary hover:underline">
                /shop/{shop.slug}
              </Link>
            </p>
          )}
        </div>

        {loading ? (
          <div className="text-center py-20 text-on-surface-variant">Loading...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-error/10 border border-error/30 text-error rounded-DEFAULT px-4 py-3 text-sm">{error}</div>
            )}
            {success && (
              <div className="bg-primary/10 border border-primary/30 text-primary rounded-DEFAULT px-4 py-3 text-sm">
                Shop updated successfully!
              </div>
            )}

            {/* Basic Info */}
            <div className="bg-surface-container rounded-xl p-6 border border-outline-variant/10 space-y-4">
              <h2 className="font-headline font-bold text-white">Basic Info</h2>
              <div>
                <label className="block text-xs font-medium text-on-surface-variant mb-1">Shop Name *</label>
                <input type="text" required value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-medium text-on-surface-variant mb-1">Description</label>
                <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={3} className={inputClass + " resize-none"} placeholder="Tell customers about your shop..." />
              </div>
              <div>
                <label className="block text-xs font-medium text-on-surface-variant mb-1">Logo URL</label>
                <input type="url" value={form.logo} onChange={(e) => setForm((p) => ({ ...p, logo: e.target.value }))} className={inputClass} placeholder="https://..." />
              </div>
              <div>
                <label className="block text-xs font-medium text-on-surface-variant mb-1">Banner URL</label>
                <input type="url" value={form.banner} onChange={(e) => setForm((p) => ({ ...p, banner: e.target.value }))} className={inputClass} placeholder="https://..." />
              </div>
            </div>

            {/* Location */}
            <div className="bg-surface-container rounded-xl p-6 border border-outline-variant/10 space-y-4">
              <h2 className="font-headline font-bold text-white">Location</h2>
              <div>
                <label className="block text-xs font-medium text-on-surface-variant mb-1">Address</label>
                <input type="text" value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-on-surface-variant mb-1">City</label>
                  <input type="text" value={form.city} onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-on-surface-variant mb-1">State</label>
                  <input type="text" value={form.state} onChange={(e) => setForm((p) => ({ ...p, state: e.target.value }))} className={inputClass} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-on-surface-variant mb-1">Pincode</label>
                <input type="text" value={form.pincode} onChange={(e) => setForm((p) => ({ ...p, pincode: e.target.value }))} className={inputClass} />
              </div>
            </div>

            {/* Contact */}
            <div className="bg-surface-container rounded-xl p-6 border border-outline-variant/10 space-y-4">
              <h2 className="font-headline font-bold text-white">Contact</h2>
              <div>
                <label className="block text-xs font-medium text-on-surface-variant mb-1">WhatsApp Number</label>
                <input type="tel" value={form.whatsapp} onChange={(e) => setForm((p) => ({ ...p, whatsapp: e.target.value }))} className={inputClass} placeholder="+91 9876543210" />
              </div>
              <div>
                <label className="block text-xs font-medium text-on-surface-variant mb-1">Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-on-surface-variant mb-1">Opening Time</label>
                  <input type="time" value={form.openTime} onChange={(e) => setForm((p) => ({ ...p, openTime: e.target.value }))} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-on-surface-variant mb-1">Closing Time</label>
                  <input type="time" value={form.closeTime} onChange={(e) => setForm((p) => ({ ...p, closeTime: e.target.value }))} className={inputClass} />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-primary text-on-primary font-bold py-4 rounded-full font-headline hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        )}
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-auto min-w-[280px] rounded-full px-4 py-3 z-50 bg-neutral-900/80 backdrop-blur-2xl shadow-2xl flex justify-around items-center gap-4">
        <Link href="/vendor/dashboard" className="text-neutral-500 p-3 hover:text-white transition-all">
          <span className="material-symbols-outlined">dashboard</span>
        </Link>
        <Link href="/vendor/products" className="text-neutral-500 p-3 hover:text-white transition-all">
          <span className="material-symbols-outlined">inventory_2</span>
        </Link>
        <span className="bg-primary-container/30 text-primary-container rounded-full p-3">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>storefront</span>
        </span>
        <Link href="/vendor/subscription" className="text-neutral-500 p-3 hover:text-white transition-all">
          <span className="material-symbols-outlined">workspace_premium</span>
        </Link>
      </nav>
    </div>
  );
}
