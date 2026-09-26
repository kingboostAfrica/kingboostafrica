"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import PageHeader from "@/components/PageHeader";
import { computeTotals, formatNaira } from "@/lib/pricing";
import { createClient } from "@/lib/supabase/client";
import { Phone, Tag, X } from "lucide-react";

type Zone = { id: string; name: string; fee: number };

export default function CheckoutClient({
  paystackEnabled,
  vatPercent,
  pickup,
  zones,
  contactPhone,
}: {
  paystackEnabled: boolean;
  vatPercent: number;
  pickup: { enabled: boolean; address: string; instructions: string };
  zones: Zone[];
  contactPhone?: string | null;
}) {
  const { items, total: subtotal, clearCart } = useCart();
  const [fulfilment, setFulfilment] = useState<"delivery" | "pickup">("delivery");
  const [zoneId, setZoneId] = useState("");
  const selectedZone = zones.find((z) => z.id === zoneId);
  const deliveryFee = fulfilment === "pickup" ? 0 : (selectedZone?.fee ?? 0);
  const [discountInput, setDiscountInput] = useState("");
  const [discount, setDiscount] = useState<{ code: string; amount: number } | null>(null);
  const [discountChecking, setDiscountChecking] = useState(false);
  const [discountMessage, setDiscountMessage] = useState("");
  const totals = computeTotals(subtotal, vatPercent, deliveryFee, discount?.amount ?? 0);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"online" | "delivery">(
    paystackEnabled ? "online" : "delivery"
  );

  async function applyDiscount() {
    const code = discountInput.trim();
    if (!code) return;
    setDiscountChecking(true);
    setDiscountMessage("");
    try {
      const supabase = createClient();
      const { data, error } = await supabase.rpc("preview_discount_code", { p_code: code, p_subtotal: subtotal });
      if (error) throw error;
      const result = data as { valid: boolean; message?: string; discount?: number };
      if (!result.valid) {
        setDiscount(null);
        setDiscountMessage(result.message ?? "That code is not valid.");
      } else {
        setDiscount({ code, amount: Number(result.discount ?? 0) });
        setDiscountMessage("");
      }
    } catch {
      setDiscount(null);
      setDiscountMessage("Could not check that code right now. It will still be checked when you place your order.");
    } finally {
      setDiscountChecking(false);
    }
  }

  function removeDiscount() {
    setDiscount(null);
    setDiscountInput("");
    setDiscountMessage("");
  }

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
          paymentMethod,
          fulfilmentMethod: fulfilment,
          zoneId: fulfilment === "delivery" ? zoneId : "",
          discountCode: discount?.code || undefined,
          items: items.map((i) => ({ product: { id: i.product.id }, quantity: i.quantity })),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed.");

      // Paying online: go to Paystack. The cart is emptied after payment is confirmed.
      if (data.authorizationUrl) {
        window.location.href = data.authorizationUrl;
        return; // keep the button disabled while the browser navigates
      }

      clearCart();
      router.push(
        `/checkout/success?order=${encodeURIComponent(data.orderId)}&total=${encodeURIComponent(String(data.total))}${
          data.cancelToken ? `&t=${encodeURIComponent(data.cancelToken)}` : ""
        }${fulfilment === "pickup" ? "&pickup=1" : ""}`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      // (when redirecting to Paystack we returned above, and the page unloads)
      setLoading(false);
    }
  }

  return (
    <>
      <PageHeader title="Checkout" crumbs={[{ label: "Cart", href: "/cart" }]} description={
          paystackEnabled
            ? "Tell us where to deliver, then pay securely online or on delivery."
            : "Tell us where to deliver. You pay on delivery."
        } />
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
          {pickup.enabled && (
            <fieldset className="grid gap-3 pt-2 sm:grid-cols-2">
              <legend className="mb-1 block text-sm font-medium text-kb-charcoal">
                How would you like to receive your order?
              </legend>
              {[
                { value: "delivery" as const, title: "Delivery", hint: "We bring it to your address." },
                { value: "pickup" as const, title: "Self pickup", hint: "Collect it yourself. No delivery fee." },
              ].map((o) => (
                <label
                  key={o.value}
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors ${
                    fulfilment === o.value
                      ? "border-kb-green bg-kb-mist"
                      : "border-kb-forest/20 hover:border-kb-forest/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="fulfilment"
                    value={o.value}
                    checked={fulfilment === o.value}
                    onChange={() => setFulfilment(o.value)}
                    className="mt-1 accent-[#2E7D32]"
                  />
                  <span>
                    <span className="block font-semibold text-kb-charcoal">{o.title}</span>
                    <span className="block text-sm text-kb-charcoal/60">{o.hint}</span>
                  </span>
                </label>
              ))}
            </fieldset>
          )}

          {fulfilment === "pickup" ? (
            <div className="rounded-lg border border-kb-forest/15 bg-kb-mist p-4 text-sm">
              <p className="font-semibold text-kb-forest">Pick up from</p>
              <p className="mt-1 text-kb-charcoal/80">{pickup.address || "We will confirm the pickup address with you."}</p>
              {pickup.instructions && <p className="mt-2 text-kb-charcoal/60">{pickup.instructions}</p>}
            </div>
          ) : (
            <>
              {zones.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-kb-charcoal mb-1">
                    Delivery area
                  </label>
                  <select
                    required
                    value={zoneId}
                    onChange={(e) => setZoneId(e.target.value)}
                    className="w-full border border-kb-forest/25 rounded-lg px-4 py-2.5 bg-white"
                  >
                    <option value="">Choose your area</option>
                    {zones.map((z) => (
                      <option key={z.id} value={z.id}>
                        {z.name} — {z.fee > 0 ? formatNaira(z.fee) : "free delivery"}
                      </option>
                    ))}
                  </select>
                </div>
              )}
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
            </>
          )}
  
          <div className="pt-2">
            <label className="mb-1 block text-sm font-medium text-kb-charcoal">
              Discount code (optional)
            </label>
            {discount ? (
              <div className="flex items-center justify-between rounded-lg border border-kb-green bg-kb-mist px-4 py-2.5">
                <span className="flex items-center gap-2 text-sm font-semibold text-kb-green">
                  <Tag size={15} aria-hidden="true" /> {discount.code.toUpperCase()} applied
                </span>
                <button
                  type="button"
                  onClick={removeDiscount}
                  aria-label="Remove discount code"
                  className="text-kb-charcoal/50 hover:text-red-600"
                >
                  <X size={16} aria-hidden="true" />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  value={discountInput}
                  onChange={(e) => setDiscountInput(e.target.value)}
                  placeholder="e.g. WELCOME10"
                  className="w-full border border-kb-forest/25 rounded-lg px-4 py-2.5 bg-white uppercase placeholder:normal-case"
                />
                <button
                  type="button"
                  onClick={applyDiscount}
                  disabled={discountChecking || !discountInput.trim()}
                  className="btn btn-outline shrink-0 !px-5 disabled:opacity-60"
                >
                  {discountChecking ? "Checking..." : "Apply"}
                </button>
              </div>
            )}
            {discountMessage && <p className="mt-1.5 text-sm text-red-600">{discountMessage}</p>}
          </div>

          {paystackEnabled && (
            <fieldset className="space-y-3 pt-2">
              <legend className="mb-1 block text-sm font-medium text-kb-charcoal">
                How would you like to pay?
              </legend>
              {[
                {
                  value: "online" as const,
                  title: "Pay now (card, bank transfer or USSD)",
                  hint: "Secure payment by Paystack. Your order is confirmed instantly.",
                },
                {
                  value: "delivery" as const,
                  title: fulfilment === "pickup" ? "Pay when you collect" : "Pay on delivery",
                  hint: fulfilment === "pickup" ? "Pay when you pick up your order." : "Pay when your order arrives.",
                },
              ].map((o) => (
                <label
                  key={o.value}
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors ${
                    paymentMethod === o.value
                      ? "border-kb-green bg-kb-mist"
                      : "border-kb-forest/20 hover:border-kb-forest/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={o.value}
                    checked={paymentMethod === o.value}
                    onChange={() => setPaymentMethod(o.value)}
                    className="mt-1 accent-[#2E7D32]"
                  />
                  <span>
                    <span className="block font-semibold text-kb-charcoal">{o.title}</span>
                    <span className="block text-sm text-kb-charcoal/60">{o.hint}</span>
                  </span>
                </label>
              ))}
            </fieldset>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full disabled:opacity-60"
          >
            {loading
              ? paymentMethod === "online"
                ? "Taking you to Paystack..."
                : "Placing order..."
              : paymentMethod === "online"
                ? `Pay ${formatNaira(totals.total)} securely`
                : "Place Order"}
          </button>
          <p className="text-xs text-kb-charcoal/50 text-center">
            {paymentMethod === "online"
              ? "You will be redirected to Paystack to complete your payment."
              : fulfilment === "pickup" ? "Payment is collected when you pick up your order." : "Payment is collected on delivery."}
          </p>
          <p className="text-xs text-kb-charcoal/50 text-center">
            By placing your order you agree to our{" "}
            <Link href="/delivery-and-refunds" target="_blank" className="font-semibold text-kb-green hover:underline">
              Delivery &amp; Refund Policy
            </Link>{" "}
            and{" "}
            <Link href="/privacy-policy" target="_blank" className="font-semibold text-kb-green hover:underline">
              Privacy Policy
            </Link>
            .
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
          <div className="mt-5 space-y-2 border-t border-kb-forest/10 pt-5 text-sm">
            <p className="flex justify-between text-kb-charcoal/70">
              <span>Subtotal</span>
              <span>{formatNaira(totals.subtotal)}</span>
            </p>
            {totals.discount > 0 && (
              <p className="flex justify-between font-semibold text-kb-green">
                <span>Discount ({discount?.code.toUpperCase()})</span>
                <span>−{formatNaira(totals.discount)}</span>
              </p>
            )}
            {vatPercent > 0 && (
              <p className="flex justify-between text-kb-charcoal/70">
                <span>VAT ({vatPercent}%)</span>
                <span>{formatNaira(totals.vat)}</span>
              </p>
            )}
            {fulfilment === "pickup" ? (
              <p className="flex justify-between text-kb-charcoal/70">
                <span>Self pickup</span>
                <span>Free</span>
              </p>
            ) : zones.length > 0 && !selectedZone ? (
              <p className="flex justify-between text-kb-charcoal/70">
                <span>Delivery</span>
                <span>Choose your area</span>
              </p>
            ) : deliveryFee > 0 ? (
              <p className="flex justify-between text-kb-charcoal/70">
                <span>Delivery{selectedZone ? ` (${selectedZone.name})` : ""}</span>
                <span>{formatNaira(totals.delivery)}</span>
              </p>
            ) : null}
            <p className="flex items-center justify-between pt-3">
              <span className="font-semibold text-kb-charcoal">Total</span>
              <span className="text-2xl font-bold text-kb-green">{formatNaira(totals.total)}</span>
            </p>
          </div>
          <p className="mt-2 text-xs text-kb-charcoal/60">
            Final prices are confirmed when you place the order.
          </p>
          {contactPhone && (
            <a
              href={`tel:${contactPhone}`}
              className="mt-5 flex items-center gap-2 border-t border-kb-forest/10 pt-4 text-sm font-semibold text-kb-green hover:underline"
            >
              <Phone size={15} aria-hidden="true" /> Need help? Call {contactPhone}
            </a>
          )}
        </aside>
      </div>
    </>
  );
}
