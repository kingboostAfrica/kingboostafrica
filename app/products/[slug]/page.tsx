import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/types";
import AddToCartButton from "@/components/AddToCartButton";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("*, category:categories(*)")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!product) notFound();

  const p = product as Product;

  return (
    <div className="max-w-6xl mx-auto px-5 py-12 grid sm:grid-cols-2 gap-10">
      <div className="aspect-square bg-kb-cream rounded-2xl overflow-hidden relative">
        {p.images?.[0] ? (
          <Image src={p.images[0]} alt={p.name} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-kb-green/50">
            No image
          </div>
        )}
      </div>

      <div>
        {p.category && (
          <Link
            href={`/food-mart/${p.category.slug}`}
            className="text-xs font-semibold uppercase tracking-wider text-kb-gold-dark"
          >
            {p.category.name}
          </Link>
        )}
        <h1 className="font-display text-3xl font-bold text-kb-charcoal mt-2">
          {p.name}
        </h1>
        <p className="text-2xl font-semibold text-kb-green mt-4">
          ₦{p.price.toLocaleString()}
          <span className="text-kb-charcoal/50 font-normal text-base"> / {p.unit}</span>
        </p>

        {p.description && (
          <p className="text-kb-charcoal/70 mt-6 leading-relaxed">{p.description}</p>
        )}

        <p className="text-sm text-kb-charcoal/50 mt-4">
          {p.stock > 0 ? `${p.stock} ${p.unit}(s) available` : "Out of stock"}
        </p>

        <div className="mt-8">
          <AddToCartButton product={p} />
        </div>
      </div>
    </div>
  );
}
