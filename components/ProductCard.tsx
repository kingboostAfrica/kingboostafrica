import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/types";
import { usdEstimate } from "@/lib/currency";
import WishlistButton from "@/components/WishlistButton";
import AddToCartButton from "@/components/AddToCartButton";

export default function ProductCard({
  product,
  lowStockDefault = null,
  usdRate = null,
  showAdd = false,
}: {
  product: Product;
  lowStockDefault?: number | null;
  usdRate?: number | null;
  showAdd?: boolean;
}) {
  const image = product.images?.[0];
  const soldOut = product.stock <= 0;
  const threshold = product.low_stock_threshold ?? lowStockDefault;
  const lowStock = !soldOut && threshold != null && product.stock <= threshold;

  return (
    <div className="relative">
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
        {soldOut ? (
          <span className="absolute left-3 top-3 rounded-md bg-kb-charcoal px-2.5 py-1 text-xs font-semibold text-white">
            Out of stock
          </span>
        ) : (
          lowStock && (
            <span className="absolute left-3 top-3 rounded-md bg-kb-gold px-2.5 py-1 text-xs font-semibold text-kb-forest">
              Only {product.stock} left
            </span>
          )
        )}
      </div>
      <div className="p-4">
        <p className="truncate font-semibold text-kb-charcoal">{product.name}</p>
        <p className="mt-1 text-lg font-bold text-kb-green">
          ₦{product.price.toLocaleString()}
          <span className="text-sm font-normal text-kb-charcoal/60"> / {product.unit}</span>
        </p>
        {usdEstimate(product.price, usdRate) && (
          <p className="text-xs text-kb-charcoal/50">{usdEstimate(product.price, usdRate)}</p>
        )}
      </div>
    </Link>
    <WishlistButton productId={product.id} productName={product.name} />
    {showAdd && (
      <div className="mt-2 [&>button]:w-full">
        <AddToCartButton product={product} />
      </div>
    )}
    </div>
  );
}
