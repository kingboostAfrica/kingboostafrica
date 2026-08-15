import Link from "next/link";
import { ArrowRight, Leaf, ShieldCheck, Sprout } from "lucide-react";

const verticals = [
  { name: "Food Mart", slug: "food-mart", desc: "Pure, natural, nutritious produce" },
  { name: "Academy", slug: "academy", desc: "Training & courses in agribusiness" },
  { name: "Consulting", slug: "consulting", desc: "Expert agribusiness advisory" },
  { name: "Agritech", slug: "agritech", desc: "Technology for modern farming" },
  { name: "Organics", slug: "organics", desc: "Certified organic solutions" },
];

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-5 pt-16 pb-10 sm:pt-24 sm:pb-14">
        <div className="max-w-2xl">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-kb-gold-dark bg-kb-gold/10 px-3 py-1 rounded-full mb-6">
            <Leaf size={14} /> Growing Value. Nourishing Lives.
          </p>
          <h1 className="font-display text-4xl sm:text-6xl font-bold leading-[1.05] text-kb-charcoal">
            Cultivating growth,
            <br />
            <span className="text-kb-green">nourishing nations.</span>
          </h1>
          <p className="mt-6 text-lg text-kb-charcoal/70 max-w-lg">
            KingBoostFarms is a Nigerian agribusiness spanning food retail,
            education, consulting, technology, and organics — built to
            strengthen agriculture from farm to table.
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

      {/* Verticals strip — signature element */}
      <section className="border-y border-kb-charcoal/10 bg-kb-green">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-5">
            {verticals.map((v, i) => (
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
                  {v.name}
                </span>
                <span className="block text-xs text-white/70 mt-1">
                  {v.desc}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="max-w-6xl mx-auto px-5 py-16 grid sm:grid-cols-3 gap-8">
        <div className="flex gap-4">
          <ShieldCheck className="text-kb-gold-dark shrink-0" size={28} />
          <div>
            <p className="font-semibold text-kb-charcoal">Quality you can trust</p>
            <p className="text-sm text-kb-charcoal/60 mt-1">
              Every product and service meets our brand standard for quality
              and integrity.
            </p>
          </div>
        </div>
        <div className="flex gap-4">
          <Sprout className="text-kb-gold-dark shrink-0" size={28} />
          <div>
            <p className="font-semibold text-kb-charcoal">Sustainable by design</p>
            <p className="text-sm text-kb-charcoal/60 mt-1">
              Our farming and consulting practices are built for long-term
              agricultural health.
            </p>
          </div>
        </div>
        <div className="flex gap-4">
          <Leaf className="text-kb-gold-dark shrink-0" size={28} />
          <div>
            <p className="font-semibold text-kb-charcoal">Five verticals, one mission</p>
            <p className="text-sm text-kb-charcoal/60 mt-1">
              From the mart to the classroom to the field — we support
              agriculture at every stage.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
