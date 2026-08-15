import Link from "next/link";
import { ArrowRight, Leaf, MapPin, ShieldCheck } from "lucide-react";

const categories = [
  { name: "Crops", slug: "crops", desc: "Grains, tubers, vegetables" },
  { name: "Livestock", slug: "livestock", desc: "Cattle, goats, sheep" },
  { name: "Poultry", slug: "poultry", desc: "Chicken, eggs, turkey" },
  { name: "Equipment", slug: "equipment", desc: "Tools & machinery" },
  { name: "Fertilizers & Inputs", slug: "fertilizers-inputs", desc: "Seeds, feed, supplies" },
];

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-5 pt-16 pb-10 sm:pt-24 sm:pb-14">
        <div className="max-w-2xl">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-clay bg-clay/10 px-3 py-1 rounded-full mb-6">
            <Leaf size={14} /> Farm to market, direct
          </p>
          <h1 className="font-display text-4xl sm:text-6xl font-semibold leading-[1.05] text-ink">
            Nigeria&apos;s produce,
            <br />
            <span className="text-cassava">sold farmer to table.</span>
          </h1>
          <p className="mt-6 text-lg text-ink/70 max-w-lg">
            Browse crops, livestock, and equipment listed directly by verified
            farmers across Nigeria — no middlemen, fair prices, real people.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 bg-cassava text-millet px-6 py-3 rounded-full font-medium hover:bg-cassava-dark transition-colors"
            >
              Browse Marketplace <ArrowRight size={16} />
            </Link>
            <Link
              href="/farmers/register"
              className="inline-flex items-center gap-2 border border-clay text-clay px-6 py-3 rounded-full font-medium hover:bg-clay hover:text-millet transition-colors"
            >
              Register as a Farmer
            </Link>
          </div>
        </div>
      </section>

      {/* Market stall directory strip — signature element */}
      <section className="border-y border-ink/10 bg-cassava">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-5">
            {categories.map((cat, i) => (
              <Link
                key={cat.slug}
                href={`/shop/${cat.slug}`}
                className={`group relative px-5 py-8 border-sage/20 hover:bg-cassava-dark transition-colors ${
                  i !== 0 ? "border-l" : ""
                } ${i === 2 ? "border-t sm:border-t-0" : ""} ${
                  i >= 3 ? "border-t sm:border-t-0" : ""
                }`}
              >
                <span className="block text-xs font-mono text-sage-light/70 mb-2">
                  STALL {String(i + 1).padStart(2, "0")}
                </span>
                <span className="block font-display text-lg font-semibold text-millet group-hover:text-clay transition-colors">
                  {cat.name}
                </span>
                <span className="block text-xs text-sage-light/80 mt-1">
                  {cat.desc}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="max-w-6xl mx-auto px-5 py-16 grid sm:grid-cols-3 gap-8">
        <div className="flex gap-4">
          <ShieldCheck className="text-clay shrink-0" size={28} />
          <div>
            <p className="font-semibold text-ink">Verified farmers</p>
            <p className="text-sm text-ink/60 mt-1">
              Every seller is a registered farmer with a public profile.
            </p>
          </div>
        </div>
        <div className="flex gap-4">
          <MapPin className="text-clay shrink-0" size={28} />
          <div>
            <p className="font-semibold text-ink">Know where it&apos;s from</p>
            <p className="text-sm text-ink/60 mt-1">
              Every listing is tied to a real farm and location.
            </p>
          </div>
        </div>
        <div className="flex gap-4">
          <Leaf className="text-clay shrink-0" size={28} />
          <div>
            <p className="font-semibold text-ink">Support local agriculture</p>
            <p className="text-sm text-ink/60 mt-1">
              Buy directly — more of what you pay reaches the farmer.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
