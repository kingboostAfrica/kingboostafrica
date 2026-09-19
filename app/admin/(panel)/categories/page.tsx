import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import type { Category } from "@/lib/types";
import CategoryManager from "@/components/admin/CategoryManager";

export default async function AdminCategoriesPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("categories").select("*").order("name");

  return (
    <div className="max-w-2xl mx-auto px-5 py-12">
      <Link href="/admin" className="text-sm text-kb-gold-dark hover:underline">
        ← Dashboard
      </Link>
      <h1 className="font-display text-3xl font-bold text-kb-charcoal mt-2 mb-2">Categories</h1>
      <p className="text-kb-charcoal/60 mb-8">
        Categories group Food Mart products and Gallery photos. Add at least one product
        category before listing products.
      </p>
      <CategoryManager categories={(data as Category[] | null) ?? []} />
    </div>
  );
}
