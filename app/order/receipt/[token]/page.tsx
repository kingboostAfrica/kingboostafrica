import Link from "next/link";
import Image from "next/image";
import { AlertTriangle } from "lucide-react";
import PrintButton from "@/components/PrintButton";
import { lookupOrderByTrackingToken, getBusinessDetails } from "@/lib/order-tracking";
import { formatNaira } from "@/lib/pricing";

export const metadata = {
  title: "Receipt — KingBoostFarms",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function ReceiptPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const [view, biz] = await Promise.all([lookupOrderByTrackingToken(token), getBusinessDetails()]);

  if (!view.found) {
    return (
      <div className="mx-auto max-w-xl px-5 py-20 text-center">
        <AlertTriangle className="mx-auto mb-4 text-kb-gold-dark" size={48} aria-hidden="true" />
        <p className="mb-6 text-kb-charcoal/70">We could not find this receipt. Please contact us.</p>
        <Link href="/contact" className="btn btn-primary print:hidden">Contact us</Link>
      </div>
    );
  }

  const extras = view.extras;
  const vat = extras?.vat ?? 0;
  const delivery = extras?.delivery ?? 0;
  const cancelled = view.status === "cancelled";

  return (
    <div className="mx-auto max-w-2xl px-5 py-10 print:max-w-none print:p-0">
      <div className="mb-6 flex items-center justify-between print:hidden">
        <Link href={`/order/track/${token}`} className="text-sm font-semibold text-kb-green hover:underline">
          ← Back to order
        </Link>
        <PrintButton label="Print receipt" />
      </div>

      <div className="card p-8 print:border-0 print:p-0 print:shadow-none">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-kb-forest/15 pb-6">
          <div className="flex items-center gap-3">
            <Image src="/kingboost-icon.png" alt="" width={40} height={56} className="h-12 w-auto" />
            <div>
              <p className="font-display text-lg font-bold text-kb-forest">{biz.name}</p>
              <p className="max-w-xs text-xs text-kb-charcoal/60">{biz.address}</p>
              <p className="text-xs text-kb-charcoal/60">
                {biz.email}
                {biz.phone ? ` · ${biz.phone}` : ""}
              </p>
              {(biz.rc || biz.tin) && (
                <p className="text-xs text-kb-charcoal/50">
                  {biz.rc ? `RC ${biz.rc}` : ""}
                  {biz.rc && biz.tin ? " · " : ""}
                  {biz.tin ? `TIN ${biz.tin}` : ""}
                </p>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="font-display text-2xl font-bold text-kb-forest">Receipt</p>
            <p className="text-sm text-kb-charcoal/60">#{view.ref}</p>
            <p className="text-sm text-kb-charcoal/60">{new Date(view.placedAt!).toLocaleDateString()}</p>
            {cancelled && <p className="mt-1 text-sm font-semibold text-red-600">CANCELLED</p>}
          </div>
        </div>

        <div className="grid gap-6 py-6 sm:grid-cols-2">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-kb-charcoal/50">Billed to</p>
            <p className="font-semibold text-kb-charcoal">{view.buyerName}</p>
            <p className="text-sm text-kb-charcoal/70">{view.buyerEmail}</p>
            {view.buyerPhone && <p className="text-sm text-kb-charcoal/70">{view.buyerPhone}</p>}
          </div>
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-kb-charcoal/50">
              {view.fulfilmentMethod === "pickup" ? "Pickup" : "Delivery"}
            </p>
            <p className="text-sm text-kb-charcoal/70">
              {view.fulfilmentMethod === "pickup"
                ? String(view.address).replace(/^Self pickup — /, "") || "Self pickup"
                : view.address}
              {view.deliveryZone ? ` (${view.deliveryZone})` : ""}
            </p>
            <p className="mt-2 text-sm text-kb-charcoal/70">
              Payment:{" "}
              <span className="font-semibold">
                {view.paymentMethod === "online" ? "Paid online (Paystack)" : view.paid ? "Paid" : "Pay on delivery"}
              </span>
            </p>
            {view.paymentReference && (
              <p className="text-xs text-kb-charcoal/50">Ref: {view.paymentReference}</p>
            )}
          </div>
        </div>

        <table className="w-full border-t border-kb-forest/15 text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-kb-charcoal/50">
              <th className="py-2 font-semibold">Item</th>
              <th className="py-2 text-center font-semibold">Qty</th>
              <th className="py-2 text-right font-semibold">Unit price</th>
              <th className="py-2 text-right font-semibold">Amount</th>
            </tr>
          </thead>
          <tbody>
            {view.lines!.map((l, i) => (
              <tr key={i} className="border-t border-kb-forest/10">
                <td className="py-2">
                  {l.name} {l.unit ? <span className="text-kb-charcoal/50">({l.unit})</span> : null}
                </td>
                <td className="py-2 text-center">{l.quantity}</td>
                <td className="py-2 text-right">{formatNaira(l.price)}</td>
                <td className="py-2 text-right">{formatNaira(l.price * l.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="ml-auto mt-4 max-w-xs space-y-1 text-sm">
          {(vat > 0 || delivery > 0) && (
            <>
              <p className="flex justify-between text-kb-charcoal/70">
                <span>Subtotal</span><span>{formatNaira(extras?.subtotal ?? 0)}</span>
              </p>
              {vat > 0 && (
                <p className="flex justify-between text-kb-charcoal/70">
                  <span>VAT ({extras?.vatPercent}%)</span><span>{formatNaira(vat)}</span>
                </p>
              )}
              {delivery > 0 && (
                <p className="flex justify-between text-kb-charcoal/70">
                  <span>Delivery</span><span>{formatNaira(delivery)}</span>
                </p>
              )}
            </>
          )}
          <p className="flex justify-between border-t border-kb-forest/15 pt-2 text-base font-bold text-kb-forest">
            <span>Total</span><span>{formatNaira(view.total ?? 0)}</span>
          </p>
        </div>

        <p className="mt-8 border-t border-kb-forest/15 pt-4 text-center text-xs text-kb-charcoal/50">
          Thank you for shopping with {biz.name}. This receipt was generated on {new Date().toLocaleString()}.
        </p>
      </div>
    </div>
  );
}
