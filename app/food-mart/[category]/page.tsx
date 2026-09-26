import { notFound } from "next/navigation";
import { createPublicClient } from "@/lib/supabase/public";
import type { Product, Category } from "@/lib/types";
import ProductBrowser from "@/components/ProductBrowser";
import PageHeader from "@/components/PageHeader";
import { getDefaultLowStockThreshold } from "@/lib/store-settings";
import FilterChips from "@/components/FilterChips";

// Served from a saved copy and rebuilt at most every 60 seconds (and instantly after admin edits).
export const revalidate = 60;

// No pages are built ahead of time; each one is built on first visit, then reused.
export function generateStaticParams() {
  return [];
}

export default async function FoodMartCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: categorySlug } = await params;
  const supabase = createPublicClient();

  const { data: category } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", categorySlug)
    .single();

  if (!category) notFound();
  const cat = category as Category;

  const [{ data: products }, { data: categories }, lowStockDefault] = await Promise.all([
    supabase
      .from("products")
      .select("*, category:categories(*)")
      .eq("is_active", true)
      .eq("category_id", cat.id)
      .order("created_at", { ascending: false }),
    supabase.from("categories").select("*").in("type", ["product", "both"]).order("name"),
    getDefaultLowStockThreshold(),
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
      <PageHeader title={cat.name} crumbs={[{ label: "Food Mart", href: "/food-mart" }]} />
      <div className="mx-auto max-w-6xl px-5 py-12">
        <FilterChips items={chips} activeHref={`/food-mart/${cat.slug}`} />

        {products && products.length > 0 ? (
          <ProductBrowser products={products as Product[]} lowStockDefault={lowStockDefault} />
        ) : (
          <div className="rounded-xl border border-dashed border-kb-forest/25 py-24 text-center">
            <p className="text-kb-charcoal/60">No products listed in this category yet.</p>
          </div>
        )}
      </div>
    </>
  );
}
