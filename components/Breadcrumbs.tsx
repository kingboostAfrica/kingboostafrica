import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Crumb } from "@/components/PageHeader";

// Slim breadcrumb strip for detail pages (product, course, service).
export default function Breadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
  const items: Crumb[] = [{ label: "Home", href: "/" }, ...crumbs];
  return (
    <div className="border-b border-kb-forest/10 bg-kb-mist">
      <nav aria-label="Breadcrumb" className="mx-auto max-w-6xl px-5 py-3">
        <ol className="flex flex-wrap items-center gap-1.5 text-sm text-kb-charcoal/70">
          {items.map((c, i) => (
            <li key={`${c.label}-${i}`} className="flex min-w-0 items-center gap-1.5">
              {i > 0 && <ChevronRight size={14} className="shrink-0 text-kb-charcoal/40" aria-hidden="true" />}
              {c.href && i < items.length - 1 ? (
                <Link href={c.href} className="hover:text-kb-green hover:underline underline-offset-4">
                  {c.label}
                </Link>
              ) : (
                <span aria-current="page" className="truncate font-semibold text-kb-charcoal">
                  {c.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
}
