import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import type { GalleryItem, Category } from "@/lib/types";

export const metadata = { title: "Gallery — KingBoostFarms" };

export default async function GalleryPage() {
  const supabase = await createClient();

  const [{ data: items }, { data: categories }] = await Promise.all([
    supabase
      .from("gallery_items")
      .select("*, category:categories(*)")
      .order("created_at", { ascending: false }),
    supabase.from("categories").select("*").in("type", ["gallery", "both"]),
  ]);

  return (
    <div className="max-w-6xl mx-auto px-5 py-12">
      <h1 className="font-display text-3xl sm:text-4xl font-bold text-kb-charcoal mb-2">
        Gallery
      </h1>
      <p className="text-kb-charcoal/60 mb-8">
        Life at KingBoostFarms — photos from our farms, mart, and programs.
      </p>

      <div className="flex flex-wrap gap-2 mb-10">
        <Link href="/gallery" className="text-sm font-medium px-4 py-2 rounded-full bg-kb-green text-white">
          All
        </Link>
        {(categories as Category[] | null)?.map((cat) => (
          <Link
            key={cat.id}
            href={`/gallery/${cat.slug}`}
            className="text-sm font-medium px-4 py-2 rounded-full border border-kb-green/30 text-kb-charcoal hover:bg-kb-green/10 transition-colors"
          >
            {cat.name}
          </Link>
        ))}
      </div>

      {items && items.length > 0 ? (
        <div className="columns-2 sm:columns-3 gap-4 space-y-4">
          {(items as GalleryItem[]).map((item) => (
            <div key={item.id} className="break-inside-avoid rounded-2xl overflow-hidden bg-kb-cream">
              <div className="relative w-full">
                <Image
                  src={item.image_url}
                  alt={item.caption || "KingBoostFarms photo"}
                  width={500}
                  height={500}
                  className="w-full h-auto object-cover"
                />
              </div>
              {item.caption && (
                <p className="text-xs text-kb-charcoal/60 p-3">{item.caption}</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 border border-dashed border-kb-green/30 rounded-2xl">
          <p className="text-kb-charcoal/60">No photos shared yet.</p>
        </div>
      )}
    </div>
  );
}
