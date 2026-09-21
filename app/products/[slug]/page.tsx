import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createPublicClient } from "@/lib/supabase/public";
import type { Product } from "@/lib/types";
import AddToCartButton from "@/components/AddToCartButton";
import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getWhatsappNumber } from "@/lib/store-settings";
import { whatsappLink } from "@/lib/whatsapp";
import { SITE_URL } from "@/lib/site";

// Served from a saved copy and rebuilt at most every 60 seconds (and instantly after admin edits).
export const revalidate = 60;

// No pages are built ahead of time; each one is built on first visit, then reused.
export function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("products")
    .select("name, description, images")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();
  if (!data) return {};
  const title = `${data.name} — KingBoostFarms Food Mart`;
  const description = data.description ?? `Buy ${data.name} from KingBoostFarms Food Mart.`;
  const image = data.images?.[0];
  return {
    title,
    description,
    openGraph: { title, description, ...(image ? { images: [image] } : {}) },
  };
}


export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = createPublicClient();

  const { data: product } = await supabase
    .from("products")
    .select("*, category:categories(*)")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!product) notFound();

  const p = product as Product;
  const whatsapp = await getWhatsappNumber();

  return (
    <>
      <Breadcrumbs crumbs={[{ label: "Food Mart", href: "/food-mart" }, ...(p.category ? [{ label: p.category.name, href: `/food-mart/${p.category.slug}` }] : []), { label: p.name }]} />
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 sm:grid-cols-2">
      <div className="aspect-square bg-kb-mist rounded-xl overflow-hidden relative">
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
            className="text-sm font-semibold text-kb-gold-dark hover:underline"
          >
            {p.category.name}
          </Link>
        )}
        <h1 className="font-display text-3xl font-bold text-kb-forest mt-2 sm:text-4xl">
          {p.name}
        </h1>
        <p className="text-3xl font-bold text-kb-green mt-4">
          ₦{p.price.toLocaleString()}
          <span className="text-kb-charcoal/50 font-normal text-base"> / {p.unit}</span>
        </p>

        {p.description && (
          <p className="text-kb-charcoal/70 mt-6 leading-relaxed">{p.description}</p>
        )}

        <p className="text-sm text-kb-charcoal/50 mt-4">
          {p.stock > 0 ? `${p.stock} ${p.unit}(s) available` : "Out of stock"}
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <AddToCartButton product={p} />
          {whatsapp && (
            <a
              href={whatsappLink(whatsapp, `Hello KingBoostFarms, I would like to ask about ${p.name} (${SITE_URL}/products/${p.slug}).`)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline"
            >
              Ask on WhatsApp
            </a>
          )}
        </div>
      </div>
      </div>
    </>
  );
}
