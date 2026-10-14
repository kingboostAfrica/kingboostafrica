"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { GalleryItem } from "@/lib/types";
import { formatNaira } from "@/lib/pricing";

// Gallery photo grid. Hovering (or focusing, for keyboard/touch users) a photo reveals its
// details: caption, category, and — when the admin has linked it to a product — that
// product's name, price and a link straight to it.
export default function GalleryGrid({ items }: { items: GalleryItem[] }) {
  return (
    <div className="columns-2 gap-4 space-y-4 sm:columns-3">
      {items.map((item) => {
        const hasDetails = Boolean(item.caption || item.category || item.product);
        const body = (
          <>
            <Image
              src={item.image_url}
              alt={item.caption || item.product?.name || "KingBoostFarms photo"}
              width={500}
              height={500}
              className="h-auto w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {hasDetails && (
              <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-kb-forest/90 via-kb-forest/20 to-transparent p-4 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100">
                {item.category?.name && (
                  <span className="mb-1 w-fit rounded-full bg-kb-gold/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-kb-forest">
                    {item.category.name}
                  </span>
                )}
                {item.product ? (
                  <div>
                    <p className="font-semibold text-white">{item.product.name}</p>
                    <p className="text-sm text-kb-gold">
                      {formatNaira(item.product.price)} / {item.product.unit}
                    </p>
                    <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-white/90">
                      View product <ArrowRight size={12} aria-hidden="true" />
                    </span>
                  </div>
                ) : (
                  item.caption && <p className="text-sm text-white">{item.caption}</p>
                )}
              </div>
            )}
          </>
        );

        return (
          <figure key={item.id} className="group relative break-inside-avoid overflow-hidden rounded-xl bg-kb-mist">
            {item.product ? (
              <Link href={`/products/${item.product.slug}`} tabIndex={0} className="block">
                {body}
              </Link>
            ) : (
              <div tabIndex={hasDetails ? 0 : -1}>{body}</div>
            )}
            {!item.product && item.caption && (
              <figcaption className="p-3 text-sm text-kb-charcoal/70">{item.caption}</figcaption>
            )}
          </figure>
        );
      })}
    </div>
  );
}
