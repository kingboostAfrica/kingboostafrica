import Link from "next/link";

export default function FilterChips({
  items,
  activeHref,
}: {
  items: { label: string; href: string }[];
  activeHref: string;
}) {
  return (
    <nav aria-label="Filter by category" className="mb-10 flex flex-wrap gap-2">
      {items.map((it) => {
        const active = it.href === activeHref;
        return (
          <Link
            key={it.href}
            href={it.href}
            aria-current={active ? "page" : undefined}
            className={`rounded-lg border px-4 py-2 text-sm font-semibold transition-colors ${
              active
                ? "border-kb-forest bg-kb-forest text-white"
                : "border-kb-forest/20 text-kb-charcoal hover:border-kb-forest/50 hover:bg-kb-mist"
            }`}
          >
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}
