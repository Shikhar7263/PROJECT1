"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";

type Plan = {
  id: string;
  name: string;
  price: number;
  duration: number;
  features: string[];
};

type Subscription = {
  status: string;
  startDate: string | null;
  endDate: string | null;
  plan: Plan;
};

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill?: { name?: string; email?: string };
  theme?: { color?: string };
}

interface RazorpayInstance {
  open(): void;
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export default function VendorSubscriptionPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    Promise.all([fetch("/api/admin/plans"), fetch("/api/vendor/me")])
      .then(async ([plansRes, meRes]) => {
        const plansData = await plansRes.json();
        const meData = await meRes.json();
        if (plansData.success) setPlans(plansData.data);
        if (meData.success && meData.data.subscription) setSubscription(meData.data.subscription);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSubscribe(planId: string) {
    setError("");
    setSuccess("");
    setProcessing(true);

    try {
      // Load Razorpay script
      if (!window.Razorpay) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.onload = () => resolve();
          script.onerror = () => reject(new Error("Failed to load Razorpay"));
          document.head.appendChild(script);
        });
      }

      // Create order
      const orderRes = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        setError(orderData.error || "Failed to create order");
        return;
      }

      const { orderId, amount, currency, keyId, plan } = orderData.data;

      // Open Razorpay checkout
      const razorpay = new window.Razorpay({
        key: keyId,
        amount,
        currency,
        name: "Luminous Marketplace",
        description: `${plan.name} Plan Subscription`,
        order_id: orderId,
        handler: async (response: RazorpayResponse) => {
          // Verify payment
          const verifyRes = await fetch("/api/payments/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              planId,
            }),
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            setSuccess("Subscription activated! Your shop is now live.");
            // Refresh subscription info
            const meRes = await fetch("/api/vendor/me");
            const meData = await meRes.json();
            if (meData.success && meData.data.subscription) setSubscription(meData.data.subscription);
          } else {
            setError("Payment verification failed. Contact support.");
          }
        },
        theme: { color: "#e7fff3" },
      });

      razorpay.open();
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setProcessing(false);
    }
  }

  const isActive = subscription?.status === "ACTIVE";
  const daysLeft = subscription?.endDate
    ? Math.max(0, Math.ceil((new Date(subscription.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  return (
    <div className="min-h-screen bg-black font-body">
      {/* Header */}
      <header className="bg-black/60 backdrop-blur-xl rounded-full mt-4 mx-4 px-6 py-2 sticky top-0 z-50 flex justify-between items-center w-[calc(100%-2rem)] max-w-5xl md:mx-auto">
        <Link href="/" className="text-xl font-bold tracking-tighter text-white font-headline">Luminous</Link>
        <div className="hidden md:flex items-center gap-6 text-sm font-headline font-bold">
          <Link href="/vendor/dashboard" className="text-neutral-400 hover:text-white px-3 py-1 rounded-full">Overview</Link>
          <Link href="/vendor/products" className="text-neutral-400 hover:text-white px-3 py-1 rounded-full">Products</Link>
          <Link href="/vendor/shop" className="text-neutral-400 hover:text-white px-3 py-1 rounded-full">My Shop</Link>
          <span className="text-white border-b-2 border-white pb-0.5">Subscription</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 pt-10 pb-24">
        <h1 className="text-3xl font-headline font-extrabold text-white mb-8">Subscription</h1>

        {error && (
          <div className="bg-error/10 border border-error/30 text-error rounded-DEFAULT px-4 py-3 mb-6 text-sm">{error}</div>
        )}
        {success && (
          <div className="bg-primary/10 border border-primary/30 text-primary rounded-DEFAULT px-4 py-3 mb-6 text-sm">{success}</div>
        )}

        {/* Current Subscription Status */}
        {subscription && (
          <div className={`rounded-xl p-6 border mb-8 ${isActive ? "bg-primary/5 border-primary/20" : "bg-error/5 border-error/20"}`}>
            <div className="flex items-center gap-3 mb-4">
              <span className={`material-symbols-outlined ${isActive ? "text-primary" : "text-error"}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                {isActive ? "verified" : "warning"}
              </span>
              <div>
                <p className={`font-headline font-bold ${isActive ? "text-primary" : "text-error"}`}>
                  {subscription.status}
                </p>
                <p className="text-on-surface-variant text-xs">{subscription.plan.name} Plan</p>
              </div>
            </div>
            {isActive && subscription.endDate && (
              <div className="flex flex-wrap gap-6 text-sm">
                <div>
                  <p className="text-on-surface-variant text-xs uppercase tracking-widest mb-1">Expires</p>
                  <p className="text-white font-bold">{formatDate(subscription.endDate)}</p>
                </div>
                <div>
                  <p className="text-on-surface-variant text-xs uppercase tracking-widest mb-1">Days Remaining</p>
                  <p className="text-white font-bold">{daysLeft} days</p>
                </div>
                <div>
                  <p className="text-on-surface-variant text-xs uppercase tracking-widest mb-1">Plan Price</p>
                  <p className="text-white font-bold">{formatCurrency(subscription.plan.price)}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Available Plans */}
        <h2 className="text-xl font-headline font-bold text-white mb-4">
          {isActive ? "Upgrade Plan" : "Choose a Plan"}
        </h2>

        {loading ? (
          <div className="text-center py-12 text-on-surface-variant">Loading plans...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {plans.map((plan) => {
              const isCurrent = subscription?.plan?.id === plan.id && isActive;
              return (
                <div
                  key={plan.id}
                  className={`bg-surface-container rounded-xl border p-6 relative ${isCurrent ? "border-primary/40" : "border-outline-variant/20"}`}
                >
                  {isCurrent && (
                    <div className="absolute -top-3 right-4 bg-primary text-on-primary text-xs font-bold px-3 py-0.5 rounded-full">
                      Current Plan
                    </div>
                  )}
                  <h3 className="font-headline text-xl font-bold text-white mb-1">{plan.name}</h3>
                  <div className="text-3xl font-headline font-extrabold text-primary mb-1">
                    {formatCurrency(plan.price)}
                  </div>
                  <p className="text-on-surface-variant text-xs mb-4">
                    Valid for {plan.duration} days
                  </p>
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-on-surface-variant">
                        <span className="material-symbols-outlined text-primary text-base">check_circle</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={processing || isCurrent}
                    className={`w-full py-3 rounded-full font-bold font-headline text-sm transition-all ${
                      isCurrent
                        ? "bg-surface-container-high text-on-surface-variant cursor-not-allowed"
                        : "bg-primary text-on-primary hover:opacity-90 active:scale-95 disabled:opacity-50"
                    }`}
                  >
                    {isCurrent ? "Active" : processing ? "Processing..." : "Subscribe Now"}
                  </button>
                </div>
              );
            })}
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
        <span className="bg-primary-container/30 text-primary-container rounded-full p-3">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
        </span>
      </nav>
    </div>
  );
}
