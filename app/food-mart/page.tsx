import Link from "next/link";
import { Briefcase } from "lucide-react";
import { createPublicClient } from "@/lib/supabase/public";
import { getDefaultLowStockThreshold } from "@/lib/store-settings";
import type { Product, Category } from "@/lib/types";
import ProductBrowser from "@/components/ProductBrowser";
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

  const [{ data: products }, { data: categories }, lowStockDefault] = await Promise.all([
    supabase
      .from("products")
      .select("*, category:categories(*)")
      .eq("is_active", true)
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
      <PageHeader
        title="Food Mart"
        description="Pure, natural, nutritious produce and staples, grown and sourced with care."
      />
      <div className="mx-auto max-w-6xl px-5 py-12">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-kb-mist p-5">
          <p className="text-sm text-kb-charcoal/70">
            Buying for a business, event or large household? We can put together a price for a bulk order.
          </p>
          <Link href="/request-quote" className="btn btn-outline shrink-0">
            <Briefcase size={16} aria-hidden="true" /> Request a bulk quote
          </Link>
        </div>

        {chips.length > 1 && <FilterChips items={chips} activeHref="/food-mart" />}

        {products && products.length > 0 ? (
          <ProductBrowser products={products as Product[]} lowStockDefault={lowStockDefault} />
        ) : (
          <div className="rounded-xl border border-dashed border-kb-forest/25 py-24 text-center">
            <p className="text-kb-charcoal/60">No products listed yet. Check back soon.</p>
          </div>
        )}
      </div>
    </>
  );
}
