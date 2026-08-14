import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, ShieldCheck } from "lucide-react";
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
    .select("*, farmer:farmers(*), category:categories(*)")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!product) notFound();

  const p = product as Product;

  return (
    <div className="max-w-6xl mx-auto px-5 py-12 grid sm:grid-cols-2 gap-10">
      <div className="aspect-square bg-sage-light rounded-2xl overflow-hidden relative">
        {p.images?.[0] ? (
          <Image src={p.images[0]} alt={p.name} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-sage">
            No image
          </div>
        )}
      </div>

      <div>
        {p.category && (
          <Link
            href={`/shop/${p.category.slug}`}
            className="text-xs font-semibold uppercase tracking-wider text-clay"
          >
            {p.category.name}
          </Link>
        )}
        <h1 className="font-display text-3xl font-semibold text-ink mt-2">
          {p.name}
        </h1>
        <p className="text-2xl font-semibold text-clay mt-4">
          ₦{p.price.toLocaleString()}
          <span className="text-ink/50 font-normal text-base"> / {p.unit}</span>
        </p>

        {p.description && (
          <p className="text-ink/70 mt-6 leading-relaxed">{p.description}</p>
        )}

        <p className="text-sm text-ink/50 mt-4">
          {p.stock > 0 ? `${p.stock} ${p.unit}(s) available` : "Out of stock"}
        </p>

        <div className="mt-8">
          <AddToCartButton product={p} />
        </div>

        {p.farmer && (
          <Link
            href={`/farmers/${p.farmer.id}`}
            className="mt-10 flex items-center gap-3 p-4 border border-sage/40 rounded-2xl hover:bg-sage-light/40 transition-colors"
          >
            <div className="w-12 h-12 rounded-full bg-sage-light overflow-hidden relative shrink-0">
              {p.farmer.photo_url && (
                <Image src={p.farmer.photo_url} alt={p.farmer.full_name} fill className="object-cover" />
              )}
            </div>
            <div>
              <p className="font-medium text-ink flex items-center gap-1">
                {p.farmer.full_name}
                {p.farmer.verified && <ShieldCheck size={14} className="text-clay" />}
              </p>
              <p className="text-xs text-ink/50 flex items-center gap-1">
                <MapPin size={12} /> {p.farmer.location}
              </p>
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}
