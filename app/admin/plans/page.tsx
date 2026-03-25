"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

type Plan = {
  id: string;
  name: string;
  price: number;
  duration: number;
  features: string[];
  isActive: boolean;
};

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [form, setForm] = useState({ name: "", price: "", duration: "", features: "", isActive: true });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function fetchPlans() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/plans");
      const data = await res.json();
      if (data.success) setPlans(data.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchPlans(); }, []);

  function openEdit(plan: Plan) {
    setEditingPlan(plan);
    setForm({
      name: plan.name,
      price: plan.price.toString(),
      duration: plan.duration.toString(),
      features: plan.features.join("\n"),
      isActive: plan.isActive,
    });
    setError("");
    setShowForm(true);
  }

  function openCreate() {
    setEditingPlan(null);
    setForm({ name: "", price: "", duration: "", features: "", isActive: true });
    setError("");
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        price: parseFloat(form.price),
        duration: parseInt(form.duration),
        features: form.features.split("\n").map((f) => f.trim()).filter(Boolean),
        isActive: form.isActive,
      };

      const url = editingPlan ? `/api/admin/plans/${editingPlan.id}` : "/api/admin/plans";
      const method = editingPlan ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save");
      } else {
        setShowForm(false);
        fetchPlans();
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-black font-body">
      <header className="bg-black/60 backdrop-blur-xl px-8 py-4 border-b border-outline-variant/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-black text-primary tracking-tighter font-headline">Luminous</Link>
            <nav className="hidden md:flex items-center gap-6 text-sm font-headline font-bold">
              <Link href="/admin/dashboard" className="text-neutral-400 hover:text-white">Dashboard</Link>
              <Link href="/admin/vendors" className="text-neutral-400 hover:text-white">Vendors</Link>
              <Link href="/admin/payments" className="text-neutral-400 hover:text-white">Payments</Link>
              <span className="text-white border-b-2 border-white pb-0.5">Plans</span>
            </nav>
          </div>
          <button onClick={openCreate} className="bg-primary text-on-primary px-6 py-2.5 rounded-full font-bold text-sm font-headline flex items-center gap-1.5 hover:opacity-90">
            <span className="material-symbols-outlined text-base">add</span>
            New Plan
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 pt-10 pb-24">
        <h1 className="text-3xl font-headline font-extrabold text-white mb-8">Subscription Plans</h1>

        {loading ? (
          <div className="text-center py-20 text-on-surface-variant">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {plans.map((plan) => (
              <div key={plan.id} className={`bg-surface-container rounded-xl border p-6 ${plan.isActive ? "border-outline-variant/20" : "border-error/20 opacity-60"}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-headline text-xl font-bold text-white">{plan.name}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${plan.isActive ? "bg-primary/10 text-primary" : "bg-error/10 text-error"}`}>
                    {plan.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="text-3xl font-headline font-extrabold text-primary mb-1">{formatCurrency(plan.price)}</div>
                <p className="text-on-surface-variant text-xs mb-4">Valid for {plan.duration} days</p>
                <ul className="space-y-1 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="text-xs text-on-surface-variant flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-primary text-sm">check</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => openEdit(plan)}
                  className="w-full bg-surface-container-high hover:bg-surface-bright text-on-surface py-2.5 rounded-full text-sm font-bold transition-colors border border-outline-variant/20"
                >
                  Edit Plan
                </button>
              </div>
            ))}
            {plans.length === 0 && (
              <div className="col-span-2 text-center py-16 bg-surface-container rounded-xl border border-outline-variant/10">
                <p className="text-on-surface-variant mb-4">No plans yet</p>
                <button onClick={openCreate} className="bg-primary text-on-primary px-6 py-2.5 rounded-full font-bold text-sm">Create First Plan</button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container rounded-xl border border-outline-variant/20 p-8 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-headline font-bold text-white">{editingPlan ? "Edit Plan" : "New Plan"}</h2>
              <button onClick={() => setShowForm(false)} className="text-on-surface-variant hover:text-white">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            {error && (
              <div className="bg-error/10 border border-error/30 text-error rounded-DEFAULT px-4 py-3 mb-4 text-sm">{error}</div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-on-surface-variant mb-1">Name *</label>
                <input type="text" required value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full bg-surface-container-high border border-outline-variant/30 rounded-DEFAULT px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary/50" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-on-surface-variant mb-1">Price (₹) *</label>
                  <input type="number" required min="0" step="0.01" value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
                    className="w-full bg-surface-container-high border border-outline-variant/30 rounded-DEFAULT px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary/50" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-on-surface-variant mb-1">Duration (days) *</label>
                  <input type="number" required min="1" value={form.duration} onChange={(e) => setForm((p) => ({ ...p, duration: e.target.value }))}
                    className="w-full bg-surface-container-high border border-outline-variant/30 rounded-DEFAULT px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary/50" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-on-surface-variant mb-1">Features (one per line)</label>
                <textarea value={form.features} onChange={(e) => setForm((p) => ({ ...p, features: e.target.value }))} rows={4}
                  className="w-full bg-surface-container-high border border-outline-variant/30 rounded-DEFAULT px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none"
                  placeholder="Unlimited products&#10;QR code generation&#10;..." />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))} className="rounded" />
                <span className="text-sm text-on-surface-variant">Active (visible to vendors)</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-outline-variant/30 text-on-surface-variant py-3 rounded-full font-bold text-sm">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 bg-primary text-on-primary py-3 rounded-full font-bold text-sm disabled:opacity-50">
                  {saving ? "Saving..." : editingPlan ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
