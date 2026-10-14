import Link from "next/link";
import { redirect } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import AccountTabs from "@/components/account/AccountTabs";
import ProfileForm from "@/components/account/ProfileForm";
import ReorderButton from "@/components/account/ReorderButton";
import { createClient } from "@/lib/supabase/server";
import { formatNaira } from "@/lib/pricing";
import type { Product } from "@/lib/types";

export const metadata = { title: "My account — KingBoostFarms", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

type OrderLine = { product_id: string; name: string | null; slug: string | null; quantity: number; unit_price: number };
type MyOrder = {
  id: string;
  ref: string;
  created_at: string;
  status: string;
  total_amount: number;
  payment_method: string;
  fulfilment_method: string;
  cancel_token: string | null;
  items: OrderLine[];
};

const STATUS_LABEL: Record<string, string> = {
  pending: "Received",
  paid: "Paid",
  shipped: "On its way",
  completed: "Completed",
  cancelled: "Cancelled",
};

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/account/login?next=/account");

  const [{ data: profile }, { data: ordersRaw }] = await Promise.all([
    supabase.from("customer_profiles").select("full_name, phone, address").eq("user_id", user.id).maybeSingle(),
    supabase.rpc("my_orders"),
  ]);
  const orders = (Array.isArray(ordersRaw) ? ordersRaw : []) as MyOrder[];

  // Current product details, so "Order again" uses today's prices and stock.
  const ids = Array.from(new Set(orders.flatMap((o) => o.items.map((i) => i.product_id)).filter(Boolean)));
  const { data: productRows } = ids.length
    ? await supabase.from("products").select("*").in("id", ids).eq("is_active", true).gt("stock", 0)
    : { data: [] };
  const products = new Map(((productRows ?? []) as Product[]).map((p) => [p.id, p]));

  const metaName = typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : "";
  const firstName = (profile?.full_name || metaName || "").split(" ")[0];

  return (
    <>
      <PageHeader title="My account" description={firstName ? `Welcome back, ${firstName}.` : "Welcome back."} />
      <div className="mx-auto max-w-6xl px-5 py-12">
        <AccountTabs active="orders" />
        <div className="grid gap-10 lg:grid-cols-[1fr_22rem]">
          <section aria-labelledby="orders-heading">
            <h2 id="orders-heading" className="mb-4 font-display text-2xl font-bold text-kb-forest">Your orders</h2>
            {orders.length === 0 ? (
              <div className="card p-8 text-center">
                <p className="mb-2 text-kb-charcoal/70">No orders yet under {user.email}.</p>
                <p className="mb-5 text-sm text-kb-charcoal/50">
                  Orders appear here when they were placed with this email address.
                </p>
                <Link href="/food-mart" className="btn btn-primary">Browse the Food Mart</Link>
              </div>
            ) : (
              <ul className="space-y-4">
                {orders.map((o) => {
                  const lines = o.items
                    .map((i) => {
                      const p = products.get(i.product_id);
                      return p ? { product: p, quantity: i.quantity } : null;
                    })
                    .filter((l): l is { product: Product; quantity: number } => l !== null);
                  return (
                    <li key={o.id} className="card p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-kb-forest">Order #{o.ref}</p>
                          <p className="text-sm text-kb-charcoal/60">
                            {new Date(o.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })}
                          </p>
                        </div>
                        <div className="text-right">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              o.status === "cancelled" ? "bg-red-50 text-red-600" : "bg-kb-mist text-kb-green"
                            }`}
                          >
                            {STATUS_LABEL[o.status] ?? o.status}
                          </span>
                          <p className="mt-1 font-bold text-kb-charcoal">{formatNaira(Number(o.total_amount))}</p>
                        </div>
                      </div>
                      <ul className="mt-3 space-y-1 text-sm text-kb-charcoal/80">
                        {o.items.map((i, idx) => (
                          <li key={`${o.id}-${idx}`}>
                            {i.quantity} × {i.slug ? <Link href={`/products/${i.slug}`} className="hover:text-kb-green hover:underline">{i.name ?? "Item"}</Link> : (i.name ?? "Item")}
                          </li>
                        ))}
                      </ul>
                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        {o.cancel_token && (
                          <>
                            <Link href={`/order/track/${o.cancel_token}`} className="text-sm font-semibold text-kb-green hover:underline">Track order</Link>
                            <Link href={`/order/receipt/${o.cancel_token}`} className="text-sm font-semibold text-kb-green hover:underline">Receipt</Link>
                          </>
                        )}
                        <span className="ml-auto">
                          <ReorderButton lines={lines} />
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section aria-labelledby="details-heading">
            <h2 id="details-heading" className="mb-4 font-display text-2xl font-bold text-kb-forest">Your details</h2>
            <ProfileForm
              userId={user.id}
              email={user.email ?? ""}
              initial={{
                full_name: profile?.full_name ?? metaName,
                phone: profile?.phone ?? "",
                address: profile?.address ?? "",
              }}
            />
          </section>
        </div>
      </div>
    </>
  );
}
