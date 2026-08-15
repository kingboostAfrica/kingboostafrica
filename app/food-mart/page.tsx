import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Product, Category } from "@/lib/types";
import ProductCard from "@/components/ProductCard";

export const metadata = { title: "Food Mart — KingBoostFarms" };

export default async function FoodMartPage() {
  const supabase = await createClient();

  const [{ data: products }, { data: categories }] = await Promise.all([
    supabase
      .from("products")
      .select("*, category:categories(*)")
      .eq("is_active", true)
      .order("created_at", { ascending: false }),
    supabase.from("categories").select("*").in("type", ["product", "both"]),
  ]);

  return (
    <div className="max-w-6xl mx-auto px-5 py-12">
      <div className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-wider text-kb-gold-dark mb-2">
          Pure. Natural. Nutritious.
        </p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-kb-charcoal">
          Food Mart
        </h1>
        <p className="text-kb-charcoal/60 mt-2">
          Fresh produce and staples, grown and sourced with care.
        </p>
      </div>

      {/* Category filter chips */}
      <div className="flex flex-wrap gap-2 mb-10">
        <Link
          href="/food-mart"
          className="text-sm font-medium px-4 py-2 rounded-full bg-kb-green text-white"
        >
          All
        </Link>
        {(categories as Category[] | null)?.map((cat) => (
          <Link
            key={cat.id}
            href={`/food-mart/${cat.slug}`}
            className="text-sm font-medium px-4 py-2 rounded-full border border-kb-green/30 text-kb-charcoal hover:bg-kb-green/10 transition-colors"
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
        <div className="text-center py-24 border border-dashed border-kb-green/30 rounded-2xl">
          <p className="text-kb-charcoal/60">
            No products listed yet. Check back soon.
          </p>
        </div>
      )}
    </div>
  );
}
