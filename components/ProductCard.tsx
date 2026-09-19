import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/types";

export default function ProductCard({ product }: { product: Product }) {
  const image = product.images?.[0];
  const soldOut = product.stock <= 0;

  return (
    <Link href={`/products/${product.slug}`} className="card group block">
      <div className="relative aspect-square bg-kb-mist">
        {image ? (
          <Image
            src={image}
            alt={product.name}
            fill
            className={`object-cover transition-transform duration-300 group-hover:scale-105 ${
              soldOut ? "opacity-60 grayscale" : ""
            }`}
            sizes="(max-width: 640px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-kb-green/60">
            No image
          </div>
        )}
        {soldOut && (
          <span className="absolute left-3 top-3 rounded-md bg-kb-charcoal px-2.5 py-1 text-xs font-semibold text-white">
            Out of stock
          </span>
        )}
      </div>
      <div className="p-4">
        <p className="truncate font-semibold text-kb-charcoal">{product.name}</p>
        <p className="mt-1 text-lg font-bold text-kb-green">
          ₦{product.price.toLocaleString()}
          <span className="text-sm font-normal text-kb-charcoal/60"> / {product.unit}</span>
        </p>
      </div>
    </Link>
  );
}
