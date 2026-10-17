import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createPublicClient } from "@/lib/supabase/public";
import type { Product } from "@/lib/types";
import AddToCartButton from "@/components/AddToCartButton";
import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getWhatsappNumber, getUsdRate } from "@/lib/store-settings";
import { usdEstimate } from "@/lib/currency";
import { whatsappLink } from "@/lib/whatsapp";
import { SITE_URL } from "@/lib/site";
import WishlistButton from "@/components/WishlistButton";
import ProductCard from "@/components/ProductCard";
import ProductReviews, { getReviewSummary } from "@/components/reviews/ProductReviews";

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
  const [whatsapp, usdRate, reviewSummary, related] = await Promise.all([
    getWhatsappNumber(),
    getUsdRate(),
    getReviewSummary(p.id),
    getRelatedProducts(supabase, p),
  ]);

  // Lets Google show star ratings under the product in search results (only when there are real reviews).
  const jsonLd =
    reviewSummary.count > 0
      ? {
          "@context": "https://schema.org",
          "@type": "Product",
          name: p.name,
          ...(p.images?.[0] ? { image: p.images[0] } : {}),
          ...(p.description ? { description: p.description } : {}),
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: Number(reviewSummary.average.toFixed(1)),
            reviewCount: reviewSummary.count,
          },
        }
      : null;

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
        {usdEstimate(p.price, usdRate) && (
          <p className="text-sm text-kb-charcoal/50">
            {usdEstimate(p.price, usdRate)} — charged in Naira; your bank sets the exact rate.
          </p>
        )}

        {p.description && (
          <p className="text-kb-charcoal/70 mt-6 leading-relaxed">{p.description}</p>
        )}

        <p className="text-sm text-kb-charcoal/50 mt-4">
          {p.stock > 0 ? `${p.stock} ${p.unit} in stock` : "Out of stock"}
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <AddToCartButton product={p} />
          <WishlistButton productId={p.id} productName={p.name} variant="full" />
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

      <ProductReviews productId={p.id} summary={reviewSummary} />

      {related.length > 0 && (
        <section aria-labelledby="related-heading" className="mx-auto max-w-6xl border-t border-kb-forest/10 px-5 py-12">
          <h2 id="related-heading" className="mb-6 font-display text-2xl font-bold text-kb-forest">You may also like</h2>
          <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
            {related.map((r) => (
              <ProductCard key={r.id} product={r} usdRate={usdRate} />
            ))}
          </div>
        </section>
      )}

      {jsonLd && (
        <script
          type="application/ld+json"
          // The data is built on the server from our own database, and "<" is escaped so it can't break out of the tag.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
      )}
    </>
  );
}

// Same-category products first, topped up with other products so the row is never empty.
async function getRelatedProducts(supabase: ReturnType<typeof createPublicClient>, product: Product): Promise<Product[]> {
  const LIMIT = 4;
  const picked: Product[] = [];

  if (product.category_id) {
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .eq("category_id", product.category_id)
      .neq("id", product.id)
      .gt("stock", 0)
      .order("created_at", { ascending: false })
      .limit(LIMIT);
    picked.push(...((data ?? []) as Product[]));
  }

  if (picked.length < LIMIT) {
    const exclude = [product.id, ...picked.map((x) => x.id)];
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .not("id", "in", `(${exclude.join(",")})`)
      .gt("stock", 0)
      .order("created_at", { ascending: false })
      .limit(LIMIT - picked.length);
    picked.push(...((data ?? []) as Product[]));
  }
  return picked;
}
