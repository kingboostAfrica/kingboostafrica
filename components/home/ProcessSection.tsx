import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Factory, Package, Sprout, Truck } from "lucide-react";
import { getIcon } from "@/lib/icons";
import { pick, type ContentRow } from "@/lib/content";

// Edit the words (and add a photo for each step) in Admin > Site content > Home Page > "process".
const defaults = [
  { key: "step-1", icon: Sprout, title: "We grow", body: "Crops such as cassava, plantain, maize, tomato and okra grow on our farm in Igbanko, Badagry." },
  { key: "step-2", icon: Factory, title: "We process", body: "Harvests are prepared, dried or milled into flours, garri, dried fish and more." },
  { key: "step-3", icon: Package, title: "We package", body: "Every product is sealed in a labelled Kingboost Foodmart pack." },
  { key: "step-4", icon: Truck, title: "We deliver", body: "Delivered to your area, or ready to collect where pickup is offered." },
];

export default function ProcessSection({ rows }: { rows: ContentRow[] }) {
  return (
    <section aria-labelledby="process-heading" className="bg-kb-mist">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <h2 id="process-heading" className="text-3xl font-bold text-kb-forest sm:text-4xl">From our farm to your table</h2>
            <p className="mt-3 text-lg text-kb-charcoal/70">See how your food is grown, prepared and brought to you.</p>
          </div>
          <Link href="/gallery" className="btn btn-outline">
            See our gallery <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
        <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {defaults.map((d, i) => {
            const row = pick(rows, "process", d.key);
            const Icon = getIcon(row?.icon, d.icon);
            return (
              <li key={d.key} className="card overflow-hidden">
                {row?.image_url && (
                  <div className="relative aspect-[4/3] bg-kb-mist">
                    <Image src={row.image_url} alt="" fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover" />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-kb-forest text-kb-gold">
                      <Icon size={20} aria-hidden="true" />
                    </span>
                    <span className="text-sm font-semibold text-kb-gold-dark">Step {i + 1}</span>
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-kb-forest">{row?.title ?? d.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-kb-charcoal/70">{row?.body ?? d.body}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
