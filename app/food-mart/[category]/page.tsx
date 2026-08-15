import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Product, Category } from "@/lib/types";
import ProductCard from "@/components/ProductCard";

export default async function FoodMartCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: categorySlug } = await params;
  const supabase = await createClient();

  const { data: category } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", categorySlug)
    .single();

  if (!category) notFound();

  const { data: products } = await supabase
    .from("products")
    .select("*, category:categories(*)")
    .eq("is_active", true)
    .eq("category_id", (category as Category).id)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-6xl mx-auto px-5 py-12">
      <Link href="/food-mart" className="text-sm text-kb-gold-dark hover:underline">
        ← All categories
      </Link>
      <h1 className="font-display text-3xl sm:text-4xl font-bold text-kb-charcoal mt-3 mb-10">
        {(category as Category).name}
      </h1>

      {products && products.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {(products as Product[]).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 border border-dashed border-kb-green/30 rounded-2xl">
          <p className="text-kb-charcoal/60">No products listed in this category yet.</p>
        </div>
      )}
    </div>
  );
}
