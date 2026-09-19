"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import PageHeader from "@/components/PageHeader";

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
      <>
        <PageHeader title="Checkout" crumbs={[{ label: "Cart", href: "/cart" }]} />
        <div className="mx-auto max-w-xl px-5 py-20 text-center">
          <p className="text-kb-charcoal/70">Your cart is empty.</p>
        </div>
      </>
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
        // Only ids + quantities: the server looks up the real prices.
        body: JSON.stringify({
          ...form,
          items: items.map((i) => ({ product: { id: i.product.id }, quantity: i.quantity })),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed.");

      clearCart();
      router.push(
        `/checkout/success?order=${encodeURIComponent(data.orderId)}&total=${encodeURIComponent(String(data.total))}`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageHeader title="Checkout" crumbs={[{ label: "Cart", href: "/cart" }]} description="Tell us where to deliver. You pay on delivery." />
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 lg:grid-cols-[1fr_22rem]">
        <div className="card p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-kb-charcoal mb-1">
              Full name
            </label>
            <input
              required
              value={form.buyerName}
              onChange={(e) => setForm({ ...form, buyerName: e.target.value })}
              className="w-full border border-kb-forest/25 rounded-lg px-4 py-2.5 bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-kb-charcoal mb-1">
              Email
            </label>
            <input
              required
              type="email"
              value={form.buyerEmail}
              onChange={(e) => setForm({ ...form, buyerEmail: e.target.value })}
              className="w-full border border-kb-forest/25 rounded-lg px-4 py-2.5 bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-kb-charcoal mb-1">
              Phone number
            </label>
            <input
              value={form.buyerPhone}
              onChange={(e) => setForm({ ...form, buyerPhone: e.target.value })}
              className="w-full border border-kb-forest/25 rounded-lg px-4 py-2.5 bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-kb-charcoal mb-1">
              Delivery address
            </label>
            <textarea
              required
              value={form.deliveryAddress}
              onChange={(e) => setForm({ ...form, deliveryAddress: e.target.value })}
              className="w-full border border-kb-forest/25 rounded-lg px-4 py-2.5 bg-white"
              rows={3}
            />
          </div>
  
          {error && <p className="text-sm text-red-600">{error}</p>}
  
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full disabled:opacity-60"
          >
            {loading ? "Placing order..." : "Place Order"}
          </button>
          <p className="text-xs text-kb-charcoal/50 text-center">
            Payment is collected on delivery for now. Online payment is coming soon.
          </p>
        </form>
        </div>

        <aside className="card h-fit p-6 lg:sticky lg:top-28">
          <h2 className="text-xl font-bold text-kb-forest">Your order</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {items.map(({ product, quantity }) => (
              <li key={product.id} className="flex justify-between gap-3">
                <span className="text-kb-charcoal/80">
                  {quantity} × {product.name}
                </span>
                <span className="shrink-0 text-kb-charcoal/60">
                  ₦{(product.price * quantity).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-5 flex items-center justify-between border-t border-kb-forest/10 pt-5">
            <p className="font-semibold text-kb-charcoal">Estimated total</p>
            <p className="text-2xl font-bold text-kb-green">₦{total.toLocaleString()}</p>
          </div>
          <p className="mt-2 text-xs text-kb-charcoal/60">
            Final prices are confirmed when you place the order.
          </p>
        </aside>
      </div>
    </>
  );
}
