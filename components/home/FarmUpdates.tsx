import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export type FarmUpdate = {
  id: string;
  title: string;
  body: string | null;
  image_url: string | null;
  published_at: string;
};

export const formatUpdateDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" });

// Shows nothing until you post your first update in Admin > Farm updates.
export default function FarmUpdates({ updates }: { updates: FarmUpdate[] }) {
  if (updates.length === 0) return null;
  return (
    <section aria-labelledby="updates-heading" className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <h2 id="updates-heading" className="text-3xl font-bold text-kb-forest sm:text-4xl">Latest from the farm</h2>
          <p className="mt-3 text-lg text-kb-charcoal/70">Harvest news, new products and what is happening at KingBoostFarms.</p>
        </div>
        <Link href="/updates" className="btn btn-outline">
          All updates <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
      <ul className="grid gap-5 md:grid-cols-3">
        {updates.map((u) => (
          <li key={u.id} className="card overflow-hidden">
            {u.image_url && (
              <div className="relative aspect-video bg-kb-mist">
                <Image src={u.image_url} alt="" fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover" />
              </div>
            )}
            <div className="p-5">
              <p className="text-xs font-semibold text-kb-gold-dark">{formatUpdateDate(u.published_at)}</p>
              <h3 className="mt-1 font-display text-lg font-bold text-kb-forest">{u.title}</h3>
              {u.body && <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-kb-charcoal/70">{u.body}</p>}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
