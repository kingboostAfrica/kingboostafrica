import Link from "next/link";
import { ArrowRight, Leaf, ShieldCheck, Sprout } from "lucide-react";
import { getPageContent, pick } from "@/lib/content";

const verticalDefaults = [
  { key: "food-mart", slug: "food-mart", name: "Food Mart", desc: "Pure, natural, nutritious produce" },
  { key: "academy", slug: "academy", name: "Academy", desc: "Training & courses in agribusiness" },
  { key: "consulting", slug: "consulting", name: "Consulting", desc: "Expert agribusiness advisory" },
  { key: "agritech", slug: "agritech", name: "Agritech", desc: "Technology for modern farming" },
  { key: "organics", slug: "organics", name: "Organics", desc: "Certified organic solutions" },
];

const trustDefaults = [
  { key: "trust-1", icon: "ShieldCheck", title: "Quality you can trust", body: "Every product and service meets our brand standard for quality and integrity." },
  { key: "trust-2", icon: "Sprout", title: "Sustainable by design", body: "Our farming and consulting practices are built for long-term agricultural health." },
  { key: "trust-3", icon: "Leaf", title: "Five verticals, one mission", body: "From the mart to the classroom to the field — we support agriculture at every stage." },
];

const trustIconMap = { ShieldCheck, Sprout, Leaf };

export default async function Home() {
  const rows = await getPageContent("home");
  const hero = pick(rows, "hero", "main");

  return (
    <div>
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-5 pt-16 pb-10 sm:pt-24 sm:pb-14">
        <div className="max-w-2xl">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-kb-gold-dark bg-kb-gold/10 px-3 py-1 rounded-full mb-6">
            <Leaf size={14} /> Growing Value. Nourishing Lives.
          </p>
          <h1 className="font-display text-4xl sm:text-6xl font-bold leading-[1.05] text-kb-charcoal">
            {hero?.title ?? "Cultivating growth, nourishing nations."}
          </h1>
          <p className="mt-6 text-lg text-kb-charcoal/70 max-w-lg">
            {hero?.body ??
              "KingBoostFarms is a Nigerian agribusiness spanning food retail, education, consulting, technology, and organics — built to strengthen agriculture from farm to table."}
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/food-mart"
              className="inline-flex items-center gap-2 bg-kb-green text-white px-6 py-3 rounded-full font-medium hover:bg-kb-green-dark transition-colors"
            >
              Shop Food Mart <ArrowRight size={16} />
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 border border-kb-gold text-kb-gold-dark px-6 py-3 rounded-full font-medium hover:bg-kb-gold hover:text-white transition-colors"
            >
              About KingBoostFarms
            </Link>
          </div>
        </div>
      </section>

      {/* Verticals strip — signature element (grouped as "Services" in the nav) */}
      <section className="border-y border-kb-charcoal/10 bg-kb-green">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-5">
            {verticalDefaults.map((v, i) => {
              const row = pick(rows, "vertical", v.key);
              return (
                <Link
                  key={v.slug}
                  href={`/${v.slug}`}
                  className={`group relative px-5 py-8 border-white/10 hover:bg-kb-green-dark transition-colors ${
                    i !== 0 ? "border-l" : ""
                  } ${i === 2 ? "border-t sm:border-t-0" : ""} ${
                    i >= 3 ? "border-t sm:border-t-0" : ""
                  }`}
                >
                  <span className="block text-xs font-mono text-white/60 mb-2">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="block font-display text-lg font-bold text-white group-hover:text-kb-gold transition-colors">
                    {row?.title ?? v.name}
                  </span>
                  <span className="block text-xs text-white/70 mt-1">
                    {row?.body ?? v.desc}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="max-w-6xl mx-auto px-5 py-16 grid sm:grid-cols-3 gap-8">
        {trustDefaults.map((t) => {
          const row = pick(rows, "trust", t.key);
          const iconName = (row?.icon ?? t.icon) as keyof typeof trustIconMap;
          const Icon = trustIconMap[iconName] ?? Leaf;
          return (
            <div key={t.key} className="flex gap-4">
              <Icon className="text-kb-gold-dark shrink-0" size={28} />
              <div>
                <p className="font-semibold text-kb-charcoal">{row?.title ?? t.title}</p>
                <p className="text-sm text-kb-charcoal/60 mt-1">{row?.body ?? t.body}</p>
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
