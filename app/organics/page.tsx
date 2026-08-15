import { Leaf, ShieldCheck, Sprout, Recycle } from "lucide-react";
import InquiryForm from "@/components/InquiryForm";
import { getPageContent, pick } from "@/lib/content";

export const metadata = { title: "Organics — KingBoostFarms" };

const offeringDefaults = [
  { key: "offering-1", icon: "Leaf", title: "Certified Organic Inputs", body: "Organic fertilizers, compost, and soil amendments free of synthetic chemicals." },
  { key: "offering-2", icon: "ShieldCheck", title: "Certification Support", body: "Guidance for farms pursuing organic certification and compliant practices." },
  { key: "offering-3", icon: "Sprout", title: "Organic Produce Sourcing", body: "Sourcing and supply of certified organic crops for retail and food service." },
  { key: "offering-4", icon: "Recycle", title: "Sustainable Practices", body: "Composting, crop rotation, and natural pest management consulting." },
];

const iconMap = { Leaf, ShieldCheck, Sprout, Recycle };

export default async function OrganicsPage() {
  const rows = await getPageContent("organics");
  const intro = pick(rows, "intro", "main");

  return (
    <div className="max-w-5xl mx-auto px-5 py-16">
      <p className="text-xs font-semibold uppercase tracking-wider text-kb-gold-dark mb-3">
        {intro?.title ?? "Certified organic solutions"}
      </p>
      <h1 className="font-display text-4xl font-bold text-kb-charcoal mb-4">
        Organics
      </h1>
      <p className="text-lg text-kb-charcoal/70 max-w-2xl mb-14">
        {intro?.body ??
          "KingBoostFarms Organics supports growers and buyers who want food and farming free of synthetic chemicals — from inputs and certification to sourcing certified organic produce."}
      </p>

      <div className="grid sm:grid-cols-2 gap-6 mb-16">
        {offeringDefaults.map((o) => {
          const row = pick(rows, "offering", o.key);
          const iconName = (row?.icon ?? o.icon) as keyof typeof iconMap;
          const Icon = iconMap[iconName] ?? Leaf;
          return (
            <div key={o.key} className="p-6 border border-kb-green/15 rounded-2xl">
              <Icon className="text-kb-green mb-3" size={28} />
              <p className="font-semibold text-kb-charcoal mb-1">{row?.title ?? o.title}</p>
              <p className="text-sm text-kb-charcoal/60">{row?.body ?? o.body}</p>
            </div>
          );
        })}
      </div>

      <div className="max-w-xl">
        <InquiryForm source="organics" title="Talk to our Organics team" />
      </div>
    </div>
  );
}
