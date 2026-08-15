import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;

  return (
    <div className="max-w-xl mx-auto px-5 py-24 text-center">
      <CheckCircle2 className="mx-auto text-kb-green mb-4" size={48} />
      <h1 className="font-display text-3xl font-bold text-kb-charcoal mb-3">
        Order placed
      </h1>
      <p className="text-kb-charcoal/60 mb-2">
        Thank you — your order has been received.
      </p>
      {order && (
        <p className="text-sm text-kb-charcoal/50 mb-8">
          Order reference: <span className="font-mono">{order}</span>
        </p>
      )}
      <Link
        href="/food-mart"
        className="inline-block bg-kb-green text-white px-6 py-3 rounded-full font-medium hover:bg-kb-green-dark transition-colors"
      >
        Continue Shopping
      </Link>
    </div>
  );
}
