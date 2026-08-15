import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/types";
import ToggleProductButton from "@/components/ToggleProductButton";

export default async function DashboardProductsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: products } = await supabase
    .from("products")
    .select("*, category:categories(*)")
    .eq("farmer_id", user.id)
    .order("created_at", { ascending: false });

  const list = (products as Product[] | null) || [];

  return (
    <div className="max-w-4xl mx-auto px-5 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl font-semibold text-ink">
          Your Listings
        </h1>
        <Link
          href="/dashboard/products/new"
          className="text-sm font-medium px-5 py-2.5 bg-clay text-millet rounded-full hover:bg-clay-dark transition-colors"
        >
          + New Product
        </Link>
      </div>

      {list.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-sage rounded-2xl">
          <p className="text-ink/60">You haven&apos;t listed any products yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {list.map((product) => (
            <div
              key={product.id}
              className="flex items-center gap-4 p-4 border border-sage/40 rounded-2xl"
            >
              <div className="w-16 h-16 bg-sage-light rounded-xl overflow-hidden relative shrink-0">
                {product.images?.[0] && (
                  <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-ink truncate">{product.name}</p>
                <p className="text-sm text-clay font-semibold">
                  ₦{product.price.toLocaleString()} / {product.unit}
                </p>
                <p className="text-xs text-ink/50">
                  {product.stock} in stock · {product.is_active ? "Active" : "Hidden"}
                </p>
              </div>
              <ToggleProductButton productId={product.id} isActive={product.is_active} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
