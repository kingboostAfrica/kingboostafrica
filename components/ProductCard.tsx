import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/types";

export default function ProductCard({ product }: { product: Product }) {
  const image = product.images?.[0];

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block rounded-2xl overflow-hidden border border-kb-green/15 bg-white hover:shadow-lg hover:-translate-y-0.5 transition-all"
    >
      <div className="aspect-square bg-kb-cream relative">
        {image ? (
          <Image
            src={image}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-kb-green/50 text-sm">
            No image
          </div>
        )}
      </div>
      <div className="p-4">
        <p className="font-medium text-kb-charcoal truncate">{product.name}</p>
        <p className="text-kb-green font-semibold mt-1">
          ₦{product.price.toLocaleString()}
          <span className="text-kb-charcoal/50 font-normal text-sm"> / {product.unit}</span>
        </p>
      </div>
    </Link>
  );
}
