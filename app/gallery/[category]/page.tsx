import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { GalleryItem, Category } from "@/lib/types";

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

  const { data: items } = await supabase
    .from("gallery_items")
    .select("*, farmer:farmers(*)")
    .eq("category_id", (category as Category).id)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-6xl mx-auto px-5 py-12">
      <Link href="/gallery" className="text-sm text-clay hover:underline">
        ← All photos
      </Link>
      <h1 className="font-display text-3xl sm:text-4xl font-semibold text-ink mt-3 mb-10">
        {(category as Category).name}
      </h1>

      {items && items.length > 0 ? (
        <div className="columns-2 sm:columns-3 gap-4 space-y-4">
          {(items as GalleryItem[]).map((item) => (
            <div key={item.id} className="break-inside-avoid rounded-2xl overflow-hidden bg-sage-light">
              <Image
                src={item.image_url}
                alt={item.caption || "Farm photo"}
                width={500}
                height={500}
                className="w-full h-auto object-cover"
              />
              {item.caption && <p className="text-xs text-ink/60 p-3">{item.caption}</p>}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-ink/60">No photos in this category yet.</p>
      )}
    </div>
  );
}
