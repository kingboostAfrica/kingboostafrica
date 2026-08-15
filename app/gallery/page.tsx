import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import type { GalleryItem, Category } from "@/lib/types";

export const metadata = { title: "Gallery — KingBoostAfrica" };

export default async function GalleryPage() {
  const supabase = await createClient();

  const [{ data: items }, { data: categories }] = await Promise.all([
    supabase
      .from("gallery_items")
      .select("*, farmer:farmers(*), category:categories(*)")
      .order("created_at", { ascending: false }),
    supabase.from("categories").select("*").in("type", ["gallery", "both"]),
  ]);

  return (
    <div className="max-w-6xl mx-auto px-5 py-12">
      <h1 className="font-display text-3xl sm:text-4xl font-semibold text-ink mb-2">
        Gallery
      </h1>
      <p className="text-ink/60 mb-8">
        Life on the farm — photos shared by our farmers.
      </p>

      <div className="flex flex-wrap gap-2 mb-10">
        <Link href="/gallery" className="text-sm font-medium px-4 py-2 rounded-full bg-cassava text-millet">
          All
        </Link>
        {(categories as Category[] | null)?.map((cat) => (
          <Link
            key={cat.id}
            href={`/gallery/${cat.slug}`}
            className="text-sm font-medium px-4 py-2 rounded-full border border-sage text-ink hover:bg-sage-light transition-colors"
          >
            {cat.name}
          </Link>
        ))}
      </div>

      {items && items.length > 0 ? (
        <div className="columns-2 sm:columns-3 gap-4 space-y-4">
          {(items as GalleryItem[]).map((item) => (
            <div key={item.id} className="break-inside-avoid rounded-2xl overflow-hidden bg-sage-light">
              <div className="relative w-full">
                <Image
                  src={item.image_url}
                  alt={item.caption || "Farm photo"}
                  width={500}
                  height={500}
                  className="w-full h-auto object-cover"
                />
              </div>
              {item.caption && (
                <p className="text-xs text-ink/60 p-3">{item.caption}</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 border border-dashed border-sage rounded-2xl">
          <p className="text-ink/60">No photos shared yet.</p>
        </div>
      )}
    </div>
  );
}
