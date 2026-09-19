import { requireAdmin } from "@/lib/admin";
import type { Category } from "@/lib/types";
import ProductForm from "@/components/admin/ProductForm";

export default async function NewProductPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .in("type", ["product", "both"])
    .order("name");

  return (
    <div className="max-w-xl mx-auto px-5 py-12">
      <h1 className="font-display text-3xl font-bold text-kb-charcoal mb-8">
        List a New Product
      </h1>
      <ProductForm categories={(data as Category[] | null) ?? []} />
    </div>
  );
}
