import Link from "next/link";
import { CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import ClearCart from "@/components/ClearCart";
import { confirmPayment } from "@/lib/paystack";
import { cancelEnabled, isToken } from "@/lib/order-cancel";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatNaira } from "@/lib/pricing";

export const metadata = { title: "Order — KingBoostFarms" };

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; total?: string; reference?: string; trxref?: string; t?: string; pickup?: string }>;
}) {
  const { order, total, reference, trxref, t, pickup } = await searchParams;
  const ref = reference || trxref;

  // ───── Paid online: ask Paystack, never trust the URL ─────
  if (ref) {
    const result = await confirmPayment(ref);
    const shortRef = (result.orderId ?? order ?? "").slice(0, 8).toUpperCase();
    const checkAgain = `/checkout/success?order=${encodeURIComponent(order ?? "")}&reference=${encodeURIComponent(ref)}`;

    if (result.state === "paid") {
      let trackToken: string | null = null;
      if (result.orderId) {
        const admin = createAdminClient();
        const { data } = (await admin?.from("orders").select("cancel_token").eq("id", result.orderId).maybeSingle()) ?? {};
        trackToken = data?.cancel_token ?? null;
      }
      return (
        <>
          <PageHeader title="Payment received" />
          <ClearCart />
          <div className="mx-auto max-w-xl px-5 py-20 text-center">
            <CheckCircle2 className="mx-auto mb-4 text-kb-green" size={48} aria-hidden="true" />
            <h2 className="font-display text-2xl font-bold text-kb-forest mb-3">Thank you for your order</h2>
            <p className="mb-2 text-kb-charcoal/70">
              Your payment was received. We will contact you shortly to arrange delivery.
            </p>
            {shortRef && (
              <p className="mb-2 text-sm text-kb-charcoal/50">
                Order reference: <span className="font-mono">{shortRef}</span>
              </p>
            )}
            {result.total ? (
              <p className="mb-8 text-sm text-kb-charcoal/70">
                Amount paid: <span className="font-semibold text-kb-green">{formatNaira(result.total)}</span>
              </p>
            ) : null}
            <Link href="/food-mart" className="btn btn-primary">Continue shopping</Link>
            {trackToken && (
              <p className="mt-6 text-sm text-kb-charcoal/60">
                <Link href={`/order/track/${trackToken}`} className="font-semibold text-kb-green hover:underline">
                  Track this order
                </Link>
              </p>
            )}
          </div>
        </>
      );
    }

    if (result.state === "pending") {
      return (
        <>
          <PageHeader title="Confirming your payment" />
          <div className="mx-auto max-w-xl px-5 py-20 text-center">
            <Clock className="mx-auto mb-4 text-kb-gold-dark" size={48} aria-hidden="true" />
            <h2 className="font-display text-2xl font-bold text-kb-forest mb-3">Waiting for confirmation</h2>
            <p className="mb-6 text-kb-charcoal/70">
              We have not received confirmation from Paystack yet. If you completed the payment, it
              will be confirmed automatically within a few minutes and we will email you. Please do
              not pay again.
            </p>
            <Link href={checkAgain} className="btn btn-primary">Check again</Link>
          </div>
        </>
      );
    }

    if (result.state === "failed") {
      return (
        <>
          <PageHeader title="Payment not completed" />
          <div className="mx-auto max-w-xl px-5 py-20 text-center">
            <AlertTriangle className="mx-auto mb-4 text-kb-gold-dark" size={48} aria-hidden="true" />
            <h2 className="font-display text-2xl font-bold text-kb-forest mb-3">Your payment did not go through</h2>
            <p className="mb-6 text-kb-charcoal/70">
              You have not been charged. Your items are held for a short time. Go back to your cart to try again.
            </p>
            <Link href="/cart" className="btn btn-primary">Back to cart</Link>
          </div>
        </>
      );
    }

    return (
      <>
        <PageHeader title="We could not confirm this payment" />
        <div className="mx-auto max-w-xl px-5 py-20 text-center">
          <AlertTriangle className="mx-auto mb-4 text-kb-gold-dark" size={48} aria-hidden="true" />
          <p className="mb-4 text-kb-charcoal/70">
            Something needs a quick check on our side. If you were charged, please email{" "}
            <a className="font-semibold text-kb-green" href="mailto:kingboost.africa@gmail.com">
              kingboost.africa@gmail.com
            </a>{" "}
            with this reference and we will sort it out.
          </p>
          <p className="mb-8 font-mono text-sm text-kb-charcoal/60">{ref}</p>
          <Link href="/contact" className="btn btn-primary">Contact us</Link>
        </div>
      </>
    );
  }

  // ───── Pay on delivery ─────
  const totalNum = Number(total);
  return (
    <>
      <PageHeader title="Order placed" />
      <div className="mx-auto max-w-xl px-5 py-20 text-center">
        <CheckCircle2 className="mx-auto mb-4 text-kb-green" size={48} aria-hidden="true" />
        <h2 className="font-display text-2xl font-bold text-kb-forest mb-3">Thank you for your order</h2>
        <p className="mb-2 text-kb-charcoal/70">Thank you — your order has been received.</p>
        {order && (
          <p className="mb-8 text-sm text-kb-charcoal/50">
            Order reference: <span className="font-mono">{order.slice(0, 8).toUpperCase()}</span>
          </p>
        )}
        {Number.isFinite(totalNum) && totalNum > 0 && (
          <p className="mb-8 text-sm text-kb-charcoal/70">
            Order total: <span className="font-semibold text-kb-green">{formatNaira(totalNum)}</span> — {pickup === "1" ? "payable when you collect." : "payable on delivery."}
          </p>
        )}
        <Link href="/food-mart" className="btn btn-primary">Continue shopping</Link>
        {cancelEnabled() && isToken(t) && (
          <p className="mt-6 text-sm text-kb-charcoal/60">
            <Link href={`/order/track/${t}`} className="font-semibold text-kb-green hover:underline">
              Track this order
            </Link>
            {" · "}
            <Link href={`/order/cancel/${t}`} className="font-semibold text-kb-green hover:underline">
              Cancel this order
            </Link>
          </p>
        )}
      </div>
    </>
  );
}
