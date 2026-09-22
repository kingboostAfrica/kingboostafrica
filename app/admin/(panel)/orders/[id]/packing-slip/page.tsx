import Link from "next/link";
import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/admin";
import PrintButton from "@/components/PrintButton";

export default async function PackingSlipPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireStaff();

  const { data: order } = await supabase.from("orders").select("*").eq("id", id).maybeSingle();
  if (!order) notFound();

  const { data: items } = await supabase.from("order_items").select("*").eq("order_id", id);
  const productIds = Array.from(new Set((items ?? []).map((i) => i.product_id)));
  const { data: products } = productIds.length
    ? await supabase.from("products").select("id, name, unit").in("id", productIds)
    : { data: [] as { id: string; name: string; unit: string }[] };
  const byId = new Map((products ?? []).map((p) => [p.id, p]));

  const ref = String(order.id).slice(0, 8).toUpperCase();
  const pickup = order.fulfilment_method === "pickup";

  return (
    <div className="mx-auto max-w-2xl px-5 py-10">
      <div className="mb-6 flex items-center justify-between print:hidden">
        <Link href="/admin/orders" className="text-sm font-semibold text-kb-green hover:underline">
          ← Back to orders
        </Link>
        <PrintButton label="Print packing slip" />
      </div>

      <div className="card p-8 print:border-0 print:p-0 print:shadow-none">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-kb-forest/15 pb-6">
          <div>
            <p className="font-display text-2xl font-bold text-kb-forest">Packing slip</p>
            <p className="text-sm text-kb-charcoal/60">Order #{ref}</p>
            <p className="text-sm text-kb-charcoal/60">{new Date(order.created_at).toLocaleString()}</p>
          </div>
          <span className="rounded-full bg-kb-gold/20 px-4 py-1.5 text-sm font-bold uppercase tracking-wide text-kb-forest">
            {pickup ? "Self pickup" : "For delivery"}
          </span>
        </div>

        <div className="grid gap-6 py-6 sm:grid-cols-2">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-kb-charcoal/50">Customer</p>
            <p className="font-semibold text-kb-charcoal">{order.buyer_name}</p>
            {order.buyer_phone && <p className="text-sm text-kb-charcoal/70">{order.buyer_phone}</p>}
            <p className="text-sm text-kb-charcoal/70">{order.buyer_email}</p>
          </div>
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-kb-charcoal/50">
              {pickup ? "Pickup" : "Deliver to"}
            </p>
            <p className="text-sm text-kb-charcoal/70">
              {pickup ? String(order.delivery_address).replace(/^Self pickup — /, "") || "Self pickup" : order.delivery_address}
              {order.delivery_zone ? ` (${order.delivery_zone})` : ""}
            </p>
          </div>
        </div>

        <table className="w-full border-t border-kb-forest/15 text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-kb-charcoal/50">
              <th className="py-2 font-semibold">✓</th>
              <th className="py-2 font-semibold">Item</th>
              <th className="py-2 text-right font-semibold">Qty</th>
            </tr>
          </thead>
          <tbody>
            {(items ?? []).map((i) => {
              const p = byId.get(i.product_id);
              return (
                <tr key={i.id} className="border-t border-kb-forest/10">
                  <td className="w-10 py-3">
                    <span className="inline-block h-4 w-4 rounded border border-kb-forest/40" aria-hidden="true" />
                  </td>
                  <td className="py-3">
                    {p?.name ?? "Item"} {p?.unit ? <span className="text-kb-charcoal/50">({p.unit})</span> : null}
                  </td>
                  <td className="py-3 text-right font-semibold">{i.quantity}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <p className="mt-8 text-xs text-kb-charcoal/50">
          No prices are shown on this slip — it is for packing only, not for the customer.
        </p>
      </div>
    </div>
  );
}
