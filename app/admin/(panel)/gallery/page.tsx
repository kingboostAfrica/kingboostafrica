import Image from "next/image";
import { requireAdmin } from "@/lib/admin";
import type { Category, GalleryItem } from "@/lib/types";
import GalleryUploader from "@/components/admin/GalleryUploader";
import DeleteButton from "@/components/admin/DeleteButton";
import FeaturedToggle from "@/components/admin/FeaturedToggle";
import GalleryProductLink from "@/components/admin/GalleryProductLink";

export default async function AdminGalleryPage() {
  const { supabase } = await requireAdmin();

  const [{ data: items }, { data: categories }, { data: products }] = await Promise.all([
    supabase.from("gallery_items").select("*").order("created_at", { ascending: false }),
    supabase.from("categories").select("*").in("type", ["gallery", "both"]).order("name"),
    supabase.from("products").select("id, name").eq("is_active", true).order("name"),
  ]);

  const list = (items as GalleryItem[] | null) ?? [];
  const cats = (categories as Category[] | null) ?? [];
  const catName = new Map(cats.map((c) => [c.id, c.name]));
  const productList = (products as { id: string; name: string }[] | null) ?? [];

  return (
    <div className="max-w-4xl mx-auto px-5 py-12">
      <h1 className="font-display text-3xl font-bold text-kb-charcoal mt-2 mb-2">Gallery</h1>
      <p className="text-kb-charcoal/60 mb-8">
        Photos here appear on the Gallery page, and every one of them also plays in the homepage slider after your
        main hero photo (featured ones first, then the rest, newest first). Tick <strong>Show in homepage slider</strong>{" "}
        to feature a photo, and link a photo to a product so hovering it on the Gallery page shows that product and
        links straight to it.
      </p>

      <GalleryUploader categories={cats} />

      <h2 className="font-display text-lg font-bold text-kb-charcoal mt-12 mb-4">
        Published photos ({list.length})
      </h2>
      {list.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-kb-green/30 rounded-2xl">
          <p className="text-kb-charcoal/60">No photos yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {list.map((item) => (
            <div key={item.id} className="border border-kb-green/15 rounded-2xl overflow-hidden">
              <div className="aspect-square relative bg-kb-cream">
                <Image
                  src={item.image_url}
                  alt={item.caption || "Gallery photo"}
                  fill
                  sizes="(max-width: 640px) 50vw, 33vw"
                  className="object-cover"
                />
              </div>
              <div className="p-3 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  {item.caption && (
                    <p className="text-xs text-kb-charcoal/70 truncate">{item.caption}</p>
                  )}
                  <p className="text-[11px] text-kb-charcoal/40 truncate">
                    {item.category_id ? catName.get(item.category_id) ?? "—" : "Uncategorised"}
                  </p>
                </div>
                <DeleteButton table="gallery_items" id={item.id} confirmText="Remove this photo from the gallery?" />
              </div>
              <div className="space-y-2 px-3 pb-3">
                <FeaturedToggle id={item.id} featured={Boolean(item.featured)} />
                <GalleryProductLink galleryItemId={item.id} productId={item.product_id ?? null} products={productList} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
