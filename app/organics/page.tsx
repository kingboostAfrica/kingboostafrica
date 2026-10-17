import { Leaf, ShieldCheck, Sprout, Recycle } from "lucide-react";
import InquiryForm from "@/components/InquiryForm";
import { getPageContent, pick } from "@/lib/content";
import PageHeader from "@/components/PageHeader";

// Served from a saved copy and rebuilt at most every 300 seconds (and instantly after admin edits).
export const revalidate = 300;

export const metadata = {
  title: "Organics — KingBoostFarms",
  description: "Organic inputs, certification guidance and naturally grown produce sourcing from KingBoostFarms.",
};

const offeringDefaults = [
  { key: "offering-1", icon: "Leaf", title: "Organic Inputs", body: "Organic fertilizers, compost, and soil amendments free of synthetic chemicals." },
  { key: "offering-2", icon: "ShieldCheck", title: "Certification Support", body: "Guidance for farms pursuing organic certification and compliant practices." },
  { key: "offering-3", icon: "Sprout", title: "Organic Produce Sourcing", body: "Sourcing and supply of naturally grown crops for retail and food service." },
  { key: "offering-4", icon: "Recycle", title: "Sustainable Practices", body: "Composting, crop rotation, and natural pest management consulting." },
];

const iconMap = { Leaf, ShieldCheck, Sprout, Recycle };

export default async function OrganicsPage() {
  const rows = await getPageContent("organics");
  const intro = pick(rows, "intro", "main");

  return (
    <>
      <PageHeader
        title="Organics"
        description={
          intro?.body ??
          "KingBoostFarms Organics supports growers and buyers who want to farm and eat with fewer synthetic chemicals — from organic inputs and certification guidance to sourcing naturally grown produce."
        }
      />
      <div className="mx-auto max-w-6xl px-5 py-14">
        <h2 className="mb-8 text-2xl font-bold text-kb-forest sm:text-3xl">
          {intro?.title ?? "Organic and natural farming solutions"}
        </h2>

      <div className="grid sm:grid-cols-2 gap-6 mb-16">
        {offeringDefaults.map((o) => {
          const row = pick(rows, "offering", o.key);
          const iconName = (row?.icon ?? o.icon) as keyof typeof iconMap;
          const Icon = iconMap[iconName] ?? Leaf;
          return (
            <div key={o.key} className="card p-6">
              <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-kb-mist text-kb-green">
                <Icon size={24} aria-hidden="true" />
              </span>
              <p className="text-lg font-bold text-kb-forest mb-1">{row?.title ?? o.title}</p>
              <p className="text-sm text-kb-charcoal/60">{row?.body ?? o.body}</p>
            </div>
          );
        })}
      </div>

      <div className="max-w-xl">
        <InquiryForm source="organics" title="Talk to our Organics team" />
      </div>
      </div>
    </>
  );
}
