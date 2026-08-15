"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    buyerName: "",
    buyerEmail: "",
    buyerPhone: "",
    deliveryAddress: "",
  });

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-5 py-24 text-center">
        <p className="text-ink/60">Your cart is empty.</p>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, items }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed.");

      clearCart();
      router.push(`/checkout/success?order=${data.orderId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto px-5 py-12">
      <h1 className="font-display text-3xl font-semibold text-ink mb-2">
        Checkout
      </h1>
      <p className="text-ink/60 mb-8">
        Total: <span className="text-clay font-semibold">₦{total.toLocaleString()}</span>
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-ink mb-1">
            Full name
          </label>
          <input
            required
            value={form.buyerName}
            onChange={(e) => setForm({ ...form, buyerName: e.target.value })}
            className="w-full border border-sage rounded-xl px-4 py-2.5 bg-white/60"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink mb-1">
            Email
          </label>
          <input
            required
            type="email"
            value={form.buyerEmail}
            onChange={(e) => setForm({ ...form, buyerEmail: e.target.value })}
            className="w-full border border-sage rounded-xl px-4 py-2.5 bg-white/60"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink mb-1">
            Phone number
          </label>
          <input
            value={form.buyerPhone}
            onChange={(e) => setForm({ ...form, buyerPhone: e.target.value })}
            className="w-full border border-sage rounded-xl px-4 py-2.5 bg-white/60"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink mb-1">
            Delivery address
          </label>
          <textarea
            required
            value={form.deliveryAddress}
            onChange={(e) => setForm({ ...form, deliveryAddress: e.target.value })}
            className="w-full border border-sage rounded-xl px-4 py-2.5 bg-white/60"
            rows={3}
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-clay text-millet px-6 py-3 rounded-full font-medium hover:bg-clay-dark transition-colors disabled:opacity-60"
        >
          {loading ? "Placing order..." : "Place Order"}
        </button>
        <p className="text-xs text-ink/50 text-center">
          Payment is collected on delivery for now. Online payment is coming soon.
        </p>
      </form>
    </div>
  );
}
