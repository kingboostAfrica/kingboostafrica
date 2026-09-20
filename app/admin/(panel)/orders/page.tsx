import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import type { Order, OrderItem } from "@/lib/types";
import StatusSelect from "@/components/admin/StatusSelect";
import { MapPin, Phone, MessageCircle } from "lucide-react";

const STATUSES = ["pending", "paid", "shipped", "completed", "cancelled"];

const statusStyle: Record<string, string> = {
  pending: "bg-kb-gold/15 text-kb-gold-dark",
  paid: "bg-kb-green/10 text-kb-green",
  shipped: "bg-blue-50 text-blue-700",
  completed: "bg-kb-green/15 text-kb-green-dark",
  cancelled: "bg-red-50 text-red-600",
};

// Nigerian numbers: 0803... -> 234803... for wa.me links.
function whatsappLink(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 7) return null;
  const intl = digits.startsWith("0") ? `234${digits.slice(1)}` : digits;
  return `https://wa.me/${intl}`;
}

export default async function AdminOrdersPage() {
  const { supabase } = await requireAdmin();

  const { data: ordersData } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  const orders = (ordersData as Order[] | null) ?? [];

  // Fetched separately (no reliance on foreign-key embedding).
  const orderIds = orders.map((o) => o.id);
  const { data: itemsData } = orderIds.length
    ? await supabase.from("order_items").select("*").in("order_id", orderIds)
    : { data: [] as OrderItem[] };
  const items = (itemsData as OrderItem[] | null) ?? [];

  const productIds = Array.from(new Set(items.map((i) => i.product_id)));
  const { data: productsData } = productIds.length
    ? await supabase.from("products").select("id, name, unit").in("id", productIds)
    : { data: [] as { id: string; name: string; unit: string }[] };
  const productMap = new Map(
    ((productsData as { id: string; name: string; unit: string }[] | null) ?? []).map((p) => [p.id, p])
  );

  const pending = orders.filter((o) => o.status === "pending").length;

  return (
    <div className="max-w-4xl mx-auto px-5 py-12">
      <Link href="/admin" className="text-sm text-kb-gold-dark hover:underline">
        ← Dashboard
      </Link>
      <h1 className="font-display text-3xl font-bold text-kb-charcoal mt-2">Orders</h1>
      <p className="text-kb-charcoal/60 mt-1 mb-8">
        {orders.length} order(s) · {pending} pending. Payment is collected on delivery for now.
        Cancelling an order puts its stock back automatically.
      </p>

      {orders.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-kb-green/30 rounded-2xl">
          <p className="text-kb-charcoal/60">No orders yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => {
            const lines = items.filter((i) => i.order_id === o.id);
            const wa = o.buyer_phone ? whatsappLink(o.buyer_phone) : null;
            return (
              <div key={o.id} className="p-5 border border-kb-green/15 rounded-2xl">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-kb-charcoal">
                      {o.buyer_name}{" "}
                      <span
                        className={`ml-1 text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full ${
                          statusStyle[o.status] ?? ""
                        }`}
                      >
                        {o.status}
                      </span>
                    </p>
                    <p className="text-sm text-kb-charcoal/60">{o.buyer_email}</p>
                    <p className="text-xs text-kb-charcoal/40 mt-0.5">
                      #{o.id.slice(0, 8).toUpperCase()} · {new Date(o.created_at).toLocaleString()}
                    </p>
                    <p className="mt-1 text-xs font-semibold">
                      {o.payment_method === "online" ? (
                        o.status === "pending" ? (
                          <span className="text-kb-gold-dark">Online payment — waiting for payment</span>
                        ) : o.status === "cancelled" ? (
                          <span className="text-red-600">Online order — cancelled</span>
                        ) : (
                          <span className="text-kb-green">
                            Paid online via Paystack
                            {o.payment_reference ? ` (${o.payment_reference})` : ""}
                          </span>
                        )
                      ) : (
                        <span className="text-kb-charcoal/50">Pay on delivery</span>
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-kb-green">
                      ₦{Number(o.total_amount).toLocaleString()}
                    </p>
                    <div className="mt-2 flex justify-end">
                      <StatusSelect
                        table="orders"
                        endpoint="/api/admin/orders/status"
                        id={o.id}
                        value={o.status}
                        options={o.status === "cancelled" ? ["cancelled"] : STATUSES}
                        confirmOn={{
                          value: "cancelled",
                          message:
                            "Cancel this order? The items go back into stock and the order cannot be re-opened.",
                        }}
                      />
                    </div>
                  </div>
                </div>

                <ul className="mt-4 text-sm text-kb-charcoal/70 space-y-1">
                  {lines.map((l) => {
                    const p = productMap.get(l.product_id);
                    return (
                      <li key={l.id} className="flex justify-between gap-4">
                        <span>
                          {l.quantity} × {p?.name ?? "Deleted product"}
                          {p?.unit ? ` (${p.unit})` : ""}
                        </span>
                        <span className="text-kb-charcoal/50">
                          ₦{(Number(l.unit_price) * l.quantity).toLocaleString()}
                        </span>
                      </li>
                    );
                  })}
                </ul>

                <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-kb-charcoal/60">
                  {o.delivery_address && (
                    <span className="flex items-start gap-1.5">
                      <MapPin size={14} className="mt-0.5 shrink-0 text-kb-green" />
                      {o.delivery_address}
                    </span>
                  )}
                  {o.buyer_phone && (
                    <a href={`tel:${o.buyer_phone}`} className="flex items-center gap-1.5 hover:text-kb-green">
                      <Phone size={14} className="text-kb-green" /> {o.buyer_phone}
                    </a>
                  )}
                  {wa && (
                    <a
                      href={wa}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 hover:text-kb-green"
                    >
                      <MessageCircle size={14} className="text-kb-green" /> WhatsApp
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
