"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/lib/types";

type SortKey = "newest" | "price-asc" | "price-desc" | "name-asc";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "newest", label: "Newest" },
  { key: "price-asc", label: "Price: low to high" },
  { key: "price-desc", label: "Price: high to low" },
  { key: "name-asc", label: "Name: A to Z" },
];

// Search, sort and an "in stock only" filter over a list of products already on the page
// (no extra network requests — the Food Mart pages already load everything active).
export default function ProductBrowser({
  products,
  lowStockDefault,
}: {
  products: Product[];
  lowStockDefault: number | null;
}) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");
  const [inStockOnly, setInStockOnly] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = products;
    if (q) {
      list = list.filter(
        (p) => p.name.toLowerCase().includes(q) || (p.description ?? "").toLowerCase().includes(q)
      );
    }
    if (inStockOnly) list = list.filter((p) => p.stock > 0);

    const sorted = [...list];
    switch (sort) {
      case "price-asc":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "name-asc":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    return sorted;
  }, [products, query, sort, inStockOnly]);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-kb-charcoal/40" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products..."
            aria-label="Search products"
            className="w-full rounded-lg border border-kb-forest/25 bg-white py-2.5 pl-10 pr-4 text-sm"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <SlidersHorizontal size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-kb-charcoal/40" aria-hidden="true" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              aria-label="Sort products"
              className="rounded-lg border border-kb-forest/25 bg-white py-2.5 pl-9 pr-8 text-sm"
            >
              {SORTS.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <label className="flex shrink-0 items-center gap-2 text-sm text-kb-charcoal/70">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="h-4 w-4 accent-[#2E7D32]"
            />
            In stock only
          </label>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-kb-forest/25 py-24 text-center">
          <p className="text-kb-charcoal/60">
            {query ? `No products match "${query}".` : "No products to show."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} lowStockDefault={lowStockDefault} />
          ))}
        </div>
      )}
    </div>
  );
}
