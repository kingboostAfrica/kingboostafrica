import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import type { Category, Product } from "@/lib/types";
import ProductForm from "@/components/admin/ProductForm";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase } = await requireAdmin();

  const [{ data: product }, { data: categories }] = await Promise.all([
    supabase.from("products").select("*").eq("id", id).maybeSingle(),
    supabase.from("categories").select("*").in("type", ["product", "both"]).order("name"),
  ]);

  if (!product) notFound();

  return (
    <div className="max-w-xl mx-auto px-5 py-12">
      <h1 className="font-display text-3xl font-bold text-kb-charcoal mb-8">
        Edit Product
      </h1>
      <ProductForm
        initial={product as Product}
        categories={(categories as Category[] | null) ?? []}
      />
    </div>
  );
}
