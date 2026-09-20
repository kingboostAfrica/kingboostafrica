import Image from "next/image";
import { createPublicClient } from "@/lib/supabase/public";
import type { GalleryItem, Category } from "@/lib/types";
import PageHeader from "@/components/PageHeader";
import FilterChips from "@/components/FilterChips";

// Served from a saved copy and rebuilt at most every 120 seconds (and instantly after admin edits).
export const revalidate = 120;

export const metadata = {
  title: "Gallery — KingBoostFarms",
  description: "Photos from the KingBoostFarms farms, mart and programs.",
};

export default async function GalleryPage() {
  const supabase = createPublicClient();

  const [{ data: items }, { data: categories }] = await Promise.all([
    supabase
      .from("gallery_items")
      .select("*, category:categories(*)")
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
      <PageHeader
        title="Gallery"
        description="Life at KingBoostFarms — photos from our farms, mart and programs."
      />
      <div className="mx-auto max-w-6xl px-5 py-12">
        {chips.length > 1 && <FilterChips items={chips} activeHref="/gallery" />}

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
          <div className="rounded-xl border border-dashed border-kb-forest/25 py-24 text-center">
            <p className="text-kb-charcoal/60">No photos shared yet.</p>
          </div>
        )}
      </div>
    </>
  );
}
