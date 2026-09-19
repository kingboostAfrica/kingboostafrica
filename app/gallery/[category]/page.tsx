import Image from "next/image";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { GalleryItem, Category } from "@/lib/types";
import PageHeader from "@/components/PageHeader";
import FilterChips from "@/components/FilterChips";

export default async function GalleryCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: categorySlug } = await params;
  const supabase = await createClient();

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
      .select("*")
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
          <div className="columns-2 gap-4 space-y-4 sm:columns-3">
            {(items as GalleryItem[]).map((item) => (
              <figure key={item.id} className="break-inside-avoid overflow-hidden rounded-xl bg-kb-mist">
                <Image
                  src={item.image_url}
                  alt={item.caption || "KingBoostFarms photo"}
                  width={500}
                  height={500}
                  className="h-auto w-full object-cover"
                />
                {item.caption && (
                  <figcaption className="p-3 text-sm text-kb-charcoal/70">{item.caption}</figcaption>
                )}
              </figure>
            ))}
          </div>
        ) : (
          <p className="text-kb-charcoal/60">No photos in this category yet.</p>
        )}
      </div>
    </>
  );
}
