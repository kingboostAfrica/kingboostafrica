import { createPublicClient } from "@/lib/supabase/public";
import type { Product, Category } from "@/lib/types";
import ProductCard from "@/components/ProductCard";
import PageHeader from "@/components/PageHeader";
import FilterChips from "@/components/FilterChips";

// Served from a saved copy and rebuilt at most every 60 seconds (and instantly after admin edits).
export const revalidate = 60;

export const metadata = {
  title: "Food Mart — KingBoostFarms",
  description: "Pure, natural, nutritious produce and staples from KingBoostFarms.",
};

export default async function FoodMartPage() {
  const supabase = createPublicClient();

  const [{ data: products }, { data: categories }] = await Promise.all([
    supabase
      .from("products")
      .select("*, category:categories(*)")
      .eq("is_active", true)
      .order("created_at", { ascending: false }),
    supabase.from("categories").select("*").in("type", ["product", "both"]).order("name"),
  ]);

  const chips = [
    { label: "All", href: "/food-mart" },
    ...((categories as Category[] | null) ?? []).map((c) => ({
      label: c.name,
      href: `/food-mart/${c.slug}`,
    })),
  ];

  return (
    <>
      <PageHeader
        title="Food Mart"
        description="Pure, natural, nutritious produce and staples, grown and sourced with care."
      />
      <div className="mx-auto max-w-6xl px-5 py-12">
        {chips.length > 1 && <FilterChips items={chips} activeHref="/food-mart" />}

        {products && products.length > 0 ? (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {(products as Product[]).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-kb-forest/25 py-24 text-center">
            <p className="text-kb-charcoal/60">No products listed yet. Check back soon.</p>
          </div>
        )}
      </div>
    </>
  );
}
