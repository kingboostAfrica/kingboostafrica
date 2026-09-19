import Link from "next/link";
import Image from "next/image";
import { requireAdmin } from "@/lib/admin";
import type { Product } from "@/lib/types";
import ToggleActiveButton from "@/components/ToggleActiveButton";
import DeleteButton from "@/components/admin/DeleteButton";

export default async function AdminProductsPage() {
  const { supabase } = await requireAdmin();

  const { data: products } = await supabase
    .from("products")
    .select("*, category:categories(*)")
    .order("created_at", { ascending: false });

  const list = (products as Product[] | null) || [];

  return (
    <div className="max-w-4xl mx-auto px-5 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/admin" className="text-sm text-kb-gold-dark hover:underline">
            ← Dashboard
          </Link>
          <h1 className="font-display text-3xl font-bold text-kb-charcoal mt-2">
            Food Mart Products
          </h1>
        </div>
        <Link
          href="/admin/products/new"
          className="text-sm font-medium px-5 py-2.5 bg-kb-green text-white rounded-full hover:bg-kb-green-dark transition-colors"
        >
          + New Product
        </Link>
      </div>

      {list.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-kb-green/30 rounded-2xl">
          <p className="text-kb-charcoal/60">No products yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {list.map((product) => (
            <div
              key={product.id}
              className="flex items-center gap-4 p-4 border border-kb-green/15 rounded-2xl"
            >
              <div className="w-16 h-16 bg-kb-cream rounded-xl overflow-hidden relative shrink-0">
                {product.images?.[0] && (
                  <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-kb-charcoal truncate">{product.name}</p>
                <p className="text-sm text-kb-green font-semibold">
                  ₦{product.price.toLocaleString()} / {product.unit}
                </p>
                <p className="text-xs text-kb-charcoal/50">
                  {product.stock} in stock · {product.is_active ? "Active" : "Hidden"}
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-end gap-2 shrink-0 max-w-[13rem] sm:max-w-none">
                <Link
                  href={`/admin/products/${product.id}/edit`}
                  className="text-xs font-medium px-3 py-1.5 rounded-full border border-kb-green/30 text-kb-charcoal hover:bg-kb-green/10 transition-colors"
                >
                  Edit
                </Link>
                <ToggleActiveButton table="products" id={product.id} isActive={product.is_active} />
                <DeleteButton table="products" id={product.id} confirmText="Delete this product permanently? (If it already has orders, hide it instead.)" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
