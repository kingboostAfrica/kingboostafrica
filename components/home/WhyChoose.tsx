import { getIcon } from "@/lib/icons";
import { pick, type ContentRow } from "@/lib/content";
import { Award, Leaf, ShieldCheck, Sparkles } from "lucide-react";

// Edit these words in Admin > Site content > Home Page > "why". The defaults below are used until then.
const defaults = [
  { key: "why-1", icon: Leaf, title: "Natural ingredients", body: "Simple, natural food made from the crops we grow and source." },
  { key: "why-2", icon: ShieldCheck, title: "No added preservatives", body: "Our Food Mart packs are made without added preservatives." },
  { key: "why-3", icon: Sparkles, title: "Hygienically processed", body: "Prepared and packed with care, in clean conditions." },
  { key: "why-4", icon: Award, title: "Premium quality", body: "Carefully selected and packed to a standard we are proud to put our name on." },
];

export default function WhyChoose({ rows }: { rows: ContentRow[] }) {
  return (
    <section aria-labelledby="why-heading" className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
      <div className="mb-10 max-w-2xl">
        <h2 id="why-heading" className="text-3xl font-bold text-kb-forest sm:text-4xl">Why choose KingBoost Foodmart</h2>
        <p className="mt-3 text-lg text-kb-charcoal/70">Pure. Natural. Nutritious. Here is what is inside every pack.</p>
      </div>
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {defaults.map((d) => {
          const row = pick(rows, "why", d.key);
          const Icon = getIcon(row?.icon, d.icon);
          return (
            <li key={d.key} className="card p-6">
              <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-kb-forest text-kb-gold">
                <Icon size={24} aria-hidden="true" />
              </span>
              <h3 className="mt-5 text-lg font-bold text-kb-forest">{row?.title ?? d.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-kb-charcoal/70">{row?.body ?? d.body}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
