import Link from "next/link";
import { AlertTriangle, CheckCircle2, Circle, XCircle } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { lookupOrderByTrackingToken } from "@/lib/order-tracking";
import { formatNaira } from "@/lib/pricing";

export const metadata = {
  title: "Track my order — KingBoostFarms",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function TrackOrderResultPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const view = await lookupOrderByTrackingToken(token);

  if (!view.found) {
    return (
      <>
        <PageHeader title="Order not found" />
        <div className="mx-auto max-w-xl px-5 py-20 text-center">
          <AlertTriangle className="mx-auto mb-4 text-kb-gold-dark" size={48} aria-hidden="true" />
          <p className="mb-6 text-kb-charcoal/70">
            We could not find this order. The link may be incomplete. Please{" "}
            <Link href="/track-order" className="font-semibold text-kb-green hover:underline">
              try again
            </Link>{" "}
            or contact us.
          </p>
          <Link href="/contact" className="btn btn-primary">Contact us</Link>
        </div>
      </>
    );
  }

  const cancelled = view.status === "cancelled";
  const online = view.paymentMethod === "online";
  const extras = view.extras;
  const vat = extras?.vat ?? 0;
  const delivery = extras?.delivery ?? 0;

  return (
    <>
      <PageHeader title="Your order" description={`Order #${view.ref}`} />
      <div className="mx-auto max-w-2xl px-5 py-14">
        {/* Timeline */}
        <ol className="mb-10 space-y-0">
          {view.timeline!.map((step, i) => {
            const last = i === view.timeline!.length - 1;
            const Icon = step.key === "cancelled" ? XCircle : step.done ? CheckCircle2 : Circle;
            return (
              <li key={step.key} className="relative flex gap-4 pb-8 last:pb-0">
                {!last && (
                  <span
                    aria-hidden="true"
                    className={`absolute left-[11px] top-6 h-full w-0.5 ${
                      step.done ? "bg-kb-green" : "bg-kb-forest/15"
                    }`}
                  />
                )}
                <Icon
                  size={24}
                  aria-hidden="true"
                  className={`shrink-0 ${
                    step.key === "cancelled"
                      ? "text-red-600"
                      : step.done
                        ? "text-kb-green"
                        : step.current
                          ? "text-kb-gold-dark"
                          : "text-kb-forest/25"
                  }`}
                />
                <div>
                  <p
                    className={`font-semibold ${
                      step.key === "cancelled" ? "text-red-600" : step.done ? "text-kb-forest" : "text-kb-charcoal/50"
                    }`}
                  >
                    {step.label}
                  </p>
                  {step.at && (
                    <p className="text-sm text-kb-charcoal/50">{new Date(step.at).toLocaleString()}</p>
                  )}
                  {step.current && !step.at && step.key !== "placed" && (
                    <p className="text-sm text-kb-gold-dark">In progress</p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>

        {/* Order summary */}
        <div className="card p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <p className="font-semibold text-kb-charcoal">
              {view.fulfilmentMethod === "pickup" ? "Self pickup" : `Delivery${view.deliveryZone ? ` — ${view.deliveryZone}` : ""}`}
            </p>
            <p className={`text-sm font-semibold ${view.paid ? "text-kb-green" : "text-kb-gold-dark"}`}>
              {view.paid ? "Paid" : online ? "Awaiting payment" : "Pay on delivery"}
            </p>
          </div>
          <ul className="space-y-2 text-sm">
            {view.lines!.map((l, i) => (
              <li key={i} className="flex justify-between gap-4">
                <span>
                  {l.quantity} × {l.name} {l.unit ? `(${l.unit})` : ""}
                </span>
                <span className="text-kb-charcoal/60">{formatNaira(l.price * l.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 space-y-1 border-t border-kb-forest/10 pt-4 text-sm text-kb-charcoal/70">
            {(vat > 0 || delivery > 0) && (
              <>
                <p className="flex justify-between"><span>Subtotal</span><span>{formatNaira(extras?.subtotal ?? 0)}</span></p>
                {vat > 0 && <p className="flex justify-between"><span>VAT ({extras?.vatPercent}%)</span><span>{formatNaira(vat)}</span></p>}
                {delivery > 0 && <p className="flex justify-between"><span>Delivery</span><span>{formatNaira(delivery)}</span></p>}
              </>
            )}
            <p className="flex justify-between text-base font-bold text-kb-forest">
              <span>Total</span><span>{formatNaira(view.total ?? 0)}</span>
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={`/order/receipt/${token}`} className="btn btn-outline">
            View / print receipt
          </Link>
          {!cancelled && (
            <Link href={`/order/cancel/${token}`} className="btn btn-outline">
              Cancel or manage this order
            </Link>
          )}
          <Link href="/food-mart" className="btn btn-primary">
            Continue shopping
          </Link>
        </div>
      </div>
    </>
  );
}
