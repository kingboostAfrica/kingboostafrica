import Link from "next/link";
import { CheckCircle2, AlertTriangle, Clock } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import CancelOrderButton from "@/components/CancelOrderButton";
import { lookupOrderByToken } from "@/lib/order-cancel";
import { formatNaira } from "@/lib/pricing";

export const metadata = {
  title: "Your order — KingBoostFarms",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function CancelOrderPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const view = await lookupOrderByToken(token);

  if (!view.found) {
    return (
      <>
        <PageHeader title="Order not found" />
        <div className="mx-auto max-w-xl px-5 py-20 text-center">
          <AlertTriangle className="mx-auto mb-4 text-kb-gold-dark" size={48} aria-hidden="true" />
          <p className="mb-6 text-kb-charcoal/70">
            We could not find this order. The link may be incomplete. Please contact us and we will help.
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
      <PageHeader title={cancelled ? "Order cancelled" : "Your order"} description={`Order #${view.ref}`} />
      <div className="mx-auto max-w-xl px-5 py-14">
        <div className="card p-6">
          <ul className="space-y-2 text-sm">
            {view.lines.map((l, i) => (
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
              <span>Total</span><span>{formatNaira(view.total)}</span>
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          {cancelled ? (
            <>
              <CheckCircle2 className="mx-auto mb-3 text-kb-green" size={40} aria-hidden="true" />
              <p className="mb-6 text-kb-charcoal/70">
                This order has been cancelled.{" "}
                {online
                  ? view.refundStatus === "processed"
                    ? "Your refund has been processed."
                    : view.refundStatus === "queued"
                      ? "Your refund has been started. It can take several business days to show in your account."
                      : "If you already paid, we will be in touch about your refund."
                  : "You have not been charged."}
              </p>
              <Link href="/food-mart" className="btn btn-primary">Visit the Food Mart</Link>
            </>
          ) : view.canCancel ? (
            <>
              <p className="mb-5 text-kb-charcoal/70">
                Changed your mind? You can cancel this order until we start processing it.
              </p>
              <CancelOrderButton token={token} />
            </>
          ) : view.requested && view.status === "paid" ? (
            <>
              <Clock className="mx-auto mb-3 text-kb-gold-dark" size={40} aria-hidden="true" />
              <p className="mb-2 font-semibold text-kb-forest">Cancellation requested</p>
              <p className="mb-6 text-kb-charcoal/70">
                We have your request and will review it. We will email you as soon as we have an answer.
              </p>
              <Link href="/contact" className="btn btn-primary">Contact us</Link>
            </>
          ) : view.canRequest ? (
            <>
              <p className="mb-5 text-kb-charcoal/70">
                You have paid for this order. You can ask us to cancel it and refund your payment, as long
                as we have not shipped it yet. We will review your request and email you.
              </p>
              <CancelOrderButton token={token} mode="request" />
            </>
          ) : (
            <>
              <AlertTriangle className="mx-auto mb-3 text-kb-gold-dark" size={40} aria-hidden="true" />
              <p className="mb-6 text-kb-charcoal/70">
                We have already started on this order, so it can no longer be cancelled here. Please contact us
                if you need help.
              </p>
              <Link href="/contact" className="btn btn-primary">Contact us</Link>
            </>
          )}
        </div>
      </div>
    </>
  );
}
