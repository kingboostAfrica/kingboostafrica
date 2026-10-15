import Image from "next/image";
import PageHeader from "@/components/PageHeader";
import { createPublicClient } from "@/lib/supabase/public";
import { formatUpdateDate, type FarmUpdate } from "@/components/home/FarmUpdates";

// Served from a saved copy and rebuilt at most every 120 seconds.
export const revalidate = 120;

export const metadata = {
  title: "Farm updates — KingBoostFarms",
  description: "Harvest news, new products and what is happening at KingBoostFarms.",
};

export default async function UpdatesPage() {
  const { data } = await createPublicClient()
    .from("farm_updates")
    .select("id, title, body, image_url, published_at")
    .eq("is_published", true)
    .order("published_at", { ascending: false })
    .limit(50);
  const updates = (data as FarmUpdate[] | null) ?? [];

  return (
    <>
      <PageHeader title="Farm updates" description="Harvest news, new products and what is happening at KingBoostFarms." />
      <div className="mx-auto max-w-3xl px-5 py-14">
        {updates.length === 0 ? (
          <p className="rounded-xl border border-dashed border-kb-forest/25 py-20 text-center text-kb-charcoal/60">
            No updates yet. Check back soon.
          </p>
        ) : (
          <ul className="space-y-10">
            {updates.map((u) => (
              <li key={u.id}>
                <article className="card overflow-hidden">
                  {u.image_url && (
                    <div className="relative aspect-video bg-kb-mist">
                      <Image src={u.image_url} alt="" fill sizes="(min-width: 768px) 48rem, 100vw" className="object-cover" />
                    </div>
                  )}
                  <div className="p-6">
                    <p className="text-xs font-semibold text-kb-gold-dark">{formatUpdateDate(u.published_at)}</p>
                    <h2 className="mt-1 font-display text-2xl font-bold text-kb-forest">{u.title}</h2>
                    {u.body && (
                      <div className="mt-3 space-y-3 leading-relaxed text-kb-charcoal/80">
                        {u.body.split("\n\n").map((para, i) => (
                          <p key={i}>{para}</p>
                        ))}
                      </div>
                    )}
                  </div>
                </article>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
