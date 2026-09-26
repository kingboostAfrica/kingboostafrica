import { requireAdmin } from "@/lib/admin";
import type { Category } from "@/lib/types";
import ProductImport from "@/components/admin/ProductImport";

export default async function AdminProductImportPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("categories").select("*").in("type", ["product", "both"]).order("name");

  return (
    <div className="max-w-3xl mx-auto px-5 py-12">
      <h1 className="font-display text-3xl font-bold text-kb-charcoal mb-2">Import products</h1>
      <p className="text-kb-charcoal/60 mb-8">
        Upload a CSV file with columns <span className="font-mono text-xs">name, category, price, unit, stock, description</span>.
        Download the template below to get the layout right. A category that doesn&apos;t match one of yours is left
        uncategorised (you can fix it afterwards in Products), everything else must be valid before you can import.
      </p>
      <ProductImport categories={(data as Category[] | null) ?? []} />
    </div>
  );
}
