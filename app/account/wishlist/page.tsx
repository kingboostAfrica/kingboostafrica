import Link from "next/link";
import { redirect } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import AccountTabs from "@/components/account/AccountTabs";
import ProductCard from "@/components/ProductCard";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/types";

export const metadata = { title: "My wishlist — KingBoostFarms", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function WishlistPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/account/login?next=/account/wishlist");

  const { data } = await supabase
    .from("wishlist_items")
    .select("created_at, product:products(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  type Row = { product: Product | Product[] | null };
  const products = ((data ?? []) as unknown as Row[])
    .map((r) => (Array.isArray(r.product) ? r.product[0] : r.product))
    .filter((p): p is Product => Boolean(p && p.is_active));

  return (
    <>
      <PageHeader title="My wishlist" description="Products you've saved for later." crumbs={[{ label: "Account", href: "/account" }]} />
      <div className="mx-auto max-w-6xl px-5 py-12">
        <AccountTabs active="wishlist" />
        {products.length === 0 ? (
          <div className="card mx-auto max-w-xl p-8 text-center">
            <p className="mb-5 text-kb-charcoal/70">
              Nothing saved yet. Tap the heart on any product to keep it here.
            </p>
            <Link href="/food-mart" className="btn btn-primary">Browse the Food Mart</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
