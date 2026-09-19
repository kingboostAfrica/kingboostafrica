import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import PageHeader from "@/components/PageHeader";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; total?: string }>;
}) {
  const { order, total } = await searchParams;
  const totalNum = Number(total);

  return (
    <>
    <PageHeader title="Order placed" />
    <div className="max-w-xl mx-auto px-5 py-20 text-center">
      <CheckCircle2 className="mx-auto text-kb-green mb-4" size={48} aria-hidden="true" />
      <h2 className="font-display text-2xl font-bold text-kb-forest mb-3">
        Thank you for your order
      </h2>
      <p className="text-kb-charcoal/70 mb-2">
        Thank you — your order has been received.
      </p>
      {order && (
        <p className="text-sm text-kb-charcoal/50 mb-8">
          Order reference:{" "}
          <span className="font-mono">{order.slice(0, 8).toUpperCase()}</span>
        </p>
      )}
      {Number.isFinite(totalNum) && totalNum > 0 && (
        <p className="text-sm text-kb-charcoal/70 mb-8">
          Order total: <span className="font-semibold text-kb-green">₦{totalNum.toLocaleString()}</span>
          {" "}— payable on delivery.
        </p>
      )}
      <Link
        href="/food-mart"
        className="btn btn-primary"
      >
        Continue shopping
      </Link>
    </div>
    </>
  );
}
