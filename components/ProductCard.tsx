import Link from "next/link";
import Image from "next/image";
import { MapPin } from "lucide-react";
import type { Product } from "@/lib/types";

export default function ProductCard({ product }: { product: Product }) {
  const image = product.images?.[0];

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block rounded-2xl overflow-hidden border border-sage/40 bg-white/40 hover:shadow-lg hover:-translate-y-0.5 transition-all"
    >
      <div className="aspect-square bg-sage-light relative">
        {image ? (
          <Image
            src={image}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-sage text-sm">
            No image
          </div>
        )}
      </div>
      <div className="p-4">
        <p className="font-medium text-ink truncate">{product.name}</p>
        <p className="text-clay font-semibold mt-1">
          ₦{product.price.toLocaleString()}
          <span className="text-ink/50 font-normal text-sm"> / {product.unit}</span>
        </p>
        {product.farmer && (
          <p className="text-xs text-ink/50 mt-2 flex items-center gap-1">
            <MapPin size={12} />
            {product.farmer.location || product.farmer.full_name}
          </p>
        )}
      </div>
    </Link>
  );
}
