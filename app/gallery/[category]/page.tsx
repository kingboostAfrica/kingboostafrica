import { notFound } from "next/navigation";
import { createPublicClient } from "@/lib/supabase/public";
import type { GalleryItem, Category } from "@/lib/types";
import PageHeader from "@/components/PageHeader";
import FilterChips from "@/components/FilterChips";
import GalleryGrid from "@/components/GalleryGrid";

// Served from a saved copy and rebuilt at most every 120 seconds (and instantly after admin edits).
export const revalidate = 120;

// No pages are built ahead of time; each one is built on first visit, then reused.
export function generateStaticParams() {
  return [];
}

export default async function GalleryCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: categorySlug } = await params;
  const supabase = createPublicClient();

  const { data: category } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", categorySlug)
    .single();

  if (!category) notFound();
  const cat = category as Category;

  const [{ data: items }, { data: categories }] = await Promise.all([
    supabase
      .from("gallery_items")
      .select("*, category:categories(*), product:products(id, name, slug, price, unit)")
      .eq("category_id", cat.id)
      .order("created_at", { ascending: false }),
    supabase.from("categories").select("*").in("type", ["gallery", "both"]).order("name"),
  ]);

  const chips = [
    { label: "All", href: "/gallery" },
    ...((categories as Category[] | null) ?? []).map((c) => ({
      label: c.name,
      href: `/gallery/${c.slug}`,
    })),
  ];

  return (
    <>
      <PageHeader title={cat.name} crumbs={[{ label: "Gallery", href: "/gallery" }]} />
      <div className="mx-auto max-w-6xl px-5 py-12">
        <FilterChips items={chips} activeHref={`/gallery/${cat.slug}`} />

        {items && items.length > 0 ? (
          <GalleryGrid items={items as GalleryItem[]} />
        ) : (
          <p className="text-kb-charcoal/60">No photos in this category yet.</p>
        )}
      </div>
    </>
  );
}
