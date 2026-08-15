import { Leaf, ShieldCheck, Sprout, Recycle } from "lucide-react";
import InquiryForm from "@/components/InquiryForm";

export const metadata = { title: "Organics — KingBoostFarms" };

const offerings = [
  { icon: Leaf, title: "Certified Organic Inputs", desc: "Organic fertilizers, compost, and soil amendments free of synthetic chemicals." },
  { icon: ShieldCheck, title: "Certification Support", desc: "Guidance for farms pursuing organic certification and compliant practices." },
  { icon: Sprout, title: "Organic Produce Sourcing", desc: "Sourcing and supply of certified organic crops for retail and food service." },
  { icon: Recycle, title: "Sustainable Practices", desc: "Composting, crop rotation, and natural pest management consulting." },
];

export default function OrganicsPage() {
  return (
    <div className="max-w-5xl mx-auto px-5 py-16">
      <p className="text-xs font-semibold uppercase tracking-wider text-kb-gold-dark mb-3">
        Certified organic solutions
      </p>
      <h1 className="font-display text-4xl font-bold text-kb-charcoal mb-4">
        Organics
      </h1>
      <p className="text-lg text-kb-charcoal/70 max-w-2xl mb-14">
        KingBoostFarms Organics supports growers and buyers who want food and
        farming free of synthetic chemicals — from inputs and certification
        to sourcing certified organic produce.
      </p>

      <div className="grid sm:grid-cols-2 gap-6 mb-16">
        {offerings.map((o) => (
          <div key={o.title} className="p-6 border border-kb-green/15 rounded-2xl">
            <o.icon className="text-kb-green mb-3" size={28} />
            <p className="font-semibold text-kb-charcoal mb-1">{o.title}</p>
            <p className="text-sm text-kb-charcoal/60">{o.desc}</p>
          </div>
        ))}
      </div>

      <div className="max-w-xl">
        <InquiryForm source="organics" title="Talk to our Organics team" />
      </div>
    </div>
  );
}
