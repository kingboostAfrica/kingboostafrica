import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";

// The hero's visual: three real products with their prices, each one a link to its page.
// One tall card and two smaller ones, so it reads as a shop window rather than a poster.
export default function HeroShopWindow({ products }: { products: Product[] }) {
  const [main, ...rest] = products.slice(0, 3);
  if (!main) return null;

  const tile = (p: Product, sizes: string, priority = false) => (
    <Link
      key={p.id}
      href={`/products/${p.slug}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-kb-cream shadow-xl ring-1 ring-white/20 transition-transform duration-300 hover:-translate-y-1"
    >
      <div className="relative min-h-0 flex-1">
        <Image
          src={p.images[0]}
          alt={p.name}
          fill
          sizes={sizes}
          priority={priority}
          className="object-contain p-2 transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </div>
      <div className="flex items-baseline justify-between gap-2 bg-kb-forest px-3.5 py-2.5 text-white">
        <span className="truncate text-sm font-semibold">{p.name}</span>
        <span className="shrink-0 text-sm font-bold text-kb-gold">
          ₦{p.price.toLocaleString()}
          {p.unit && <span className="text-xs font-medium text-white/70"> / {p.unit}</span>}
        </span>
      </div>
    </Link>
  );

  return (
    <div className="relative">
      <div className="pointer-events-none absolute -bottom-4 -right-4 hidden h-full w-full rounded-3xl border-2 border-kb-gold/50 sm:block" aria-hidden="true" />
      <div
        className={`relative grid h-[26rem] gap-3 sm:h-[30rem] lg:h-[28rem] ${
          rest.length > 0 ? "grid-cols-[1.15fr_1fr] grid-rows-2" : "grid-cols-1"
        }`}
      >
        <div className={rest.length > 0 ? "row-span-2" : ""}>{tile(main, "(min-width: 1024px) 18rem, 55vw", true)}</div>
        {rest.map((p) => (
          <div key={p.id}>{tile(p, "(min-width: 1024px) 15rem, 45vw")}</div>
        ))}
      </div>
    </div>
  );
}
