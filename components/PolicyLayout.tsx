import Link from "next/link";
import type { ReactNode } from "react";
import PageHeader from "@/components/PageHeader";

export type PolicySection = { id: string; title: string; body: ReactNode };

export const P = ({ children }: { children: ReactNode }) => (
  <p className="leading-relaxed text-kb-charcoal/80">{children}</p>
);

export const UL = ({ children }: { children: ReactNode }) => (
  <ul className="list-disc space-y-2 pl-5 leading-relaxed text-kb-charcoal/80 marker:text-kb-gold">{children}</ul>
);

export const Note = ({ children }: { children: ReactNode }) => (
  <div className="rounded-lg border border-kb-forest/15 bg-kb-mist p-4 text-sm leading-relaxed text-kb-charcoal/80">
    {children}
  </div>
);

// Shared layout for the policy pages: banner, a contents list that jumps to each section, and the text.
export default function PolicyLayout({
  title,
  description,
  updated,
  sections,
}: {
  title: string;
  description: string;
  updated: string;
  sections: PolicySection[];
}) {
  return (
    <>
      <PageHeader title={title} description={description} />
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 lg:grid-cols-[16rem_1fr]">
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <p className="mb-3 text-sm font-semibold text-kb-forest">On this page</p>
          <ol className="space-y-1.5 border-l border-kb-forest/15 text-sm">
            {sections.map((s, i) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="-ml-px block border-l-2 border-transparent py-0.5 pl-3 text-kb-charcoal/70 hover:border-kb-gold hover:text-kb-green"
                >
                  {i + 1}. {s.title}
                </a>
              </li>
            ))}
          </ol>
          <p className="mt-6 text-xs text-kb-charcoal/50">Last updated: {updated}</p>
        </aside>

        <div className="max-w-3xl space-y-10">
          {sections.map((s, i) => (
            <section key={s.id} id={s.id} className="scroll-mt-28 space-y-3">
              <h2 className="font-display text-2xl font-bold text-kb-forest">
                {i + 1}. {s.title}
              </h2>
              {s.body}
            </section>
          ))}

          <div className="rounded-xl border border-kb-forest/15 p-6">
            <p className="font-display text-lg font-bold text-kb-forest">Questions about this page?</p>
            <p className="mt-2 text-sm leading-relaxed text-kb-charcoal/70">
              KingBoost Farms Ltd., 8 Ibudo Oloja Street, Igbanko, Badagry, Lagos State, Nigeria.
              <br />
              Email:{" "}
              <a className="font-semibold text-kb-green hover:underline" href="mailto:kingboost.africa@gmail.com">
                kingboost.africa@gmail.com
              </a>{" "}
              · or use our{" "}
              <Link href="/contact" className="font-semibold text-kb-green hover:underline">
                contact form
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
