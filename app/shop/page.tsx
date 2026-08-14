import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Product, Category } from "@/lib/types";
import ProductCard from "@/components/ProductCard";

export const metadata = { title: "Marketplace — KingBoostAfrica" };

export default async function ShopPage() {
  const supabase = await createClient();

  const [{ data: products }, { data: categories }] = await Promise.all([
    supabase
      .from("products")
      .select("*, farmer:farmers(*), category:categories(*)")
      .eq("is_active", true)
      .order("created_at", { ascending: false }),
    supabase.from("categories").select("*").in("type", ["product", "both"]),
  ]);

  return (
    <div className="max-w-6xl mx-auto px-5 py-12">
      <div className="mb-10">
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-ink">
          Marketplace
        </h1>
        <p className="text-ink/60 mt-2">
          Produce, livestock, and equipment — listed directly by farmers.
        </p>
      </div>

      {/* Category filter chips */}
      <div className="flex flex-wrap gap-2 mb-10">
        <Link
          href="/shop"
          className="text-sm font-medium px-4 py-2 rounded-full bg-cassava text-millet"
        >
          All
        </Link>
        {(categories as Category[] | null)?.map((cat) => (
          <Link
            key={cat.id}
            href={`/shop/${cat.slug}`}
            className="text-sm font-medium px-4 py-2 rounded-full border border-sage text-ink hover:bg-sage-light transition-colors"
          >
            {cat.name}
          </Link>
        ))}
      </div>

      {products && products.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {(products as Product[]).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 border border-dashed border-sage rounded-2xl">
          <p className="text-ink/60">
            No products listed yet. Check back soon, or{" "}
            <Link href="/farmers/register" className="text-clay underline">
              register as a farmer
            </Link>{" "}
            to be the first.
          </p>
        </div>
      )}
    </div>
  );
}
