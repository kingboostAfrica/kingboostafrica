import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { FieldLines } from "@/components/FieldArt";

export type Crumb = { label: string; href?: string };

export default function PageHeader({
  title,
  description,
  crumbs = [],
}: {
  title: string;
  description?: string;
  crumbs?: Crumb[];
}) {
  const items: Crumb[] = [{ label: "Home", href: "/" }, ...crumbs, { label: title }];

  return (
    <section className="relative overflow-hidden bg-kb-forest text-white">
      <FieldLines className="pointer-events-none absolute inset-y-0 right-0 h-full w-full sm:w-3/5" />
      <div className="relative mx-auto max-w-6xl px-5 py-12 sm:py-16">
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-1.5 text-sm text-white/70">
            {items.map((c, i) => (
              <li key={`${c.label}-${i}`} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRight size={14} className="text-white/40" aria-hidden="true" />}
                {c.href && i < items.length - 1 ? (
                  <Link href={c.href} className="hover:text-white hover:underline underline-offset-4">
                    {c.label}
                  </Link>
                ) : (
                  <span aria-current="page" className="text-white">
                    {c.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>

        <h1 className="mt-5 max-w-3xl text-4xl font-bold leading-[1.1] sm:text-5xl">{title}</h1>
        <div className="mt-5 h-1 w-14 rounded-full bg-kb-gold" aria-hidden="true" />
        {description && (
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/75">{description}</p>
        )}
      </div>
    </section>
  );
}
