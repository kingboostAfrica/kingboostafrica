import { Cpu, Satellite, Droplets, BarChart3 } from "lucide-react";
import InquiryForm from "@/components/InquiryForm";

export const metadata = { title: "Agritech — KingBoostFarms" };

const capabilities = [
  { icon: Satellite, title: "Precision Farming", desc: "Satellite and sensor-driven insights to plan planting, monitor crop health, and optimize yield." },
  { icon: Droplets, title: "Smart Irrigation", desc: "Automated irrigation systems that reduce water waste while keeping crops healthy." },
  { icon: BarChart3, title: "Farm Data & Analytics", desc: "Dashboards that turn field data into decisions — from input planning to harvest forecasting." },
  { icon: Cpu, title: "Equipment & Automation", desc: "Modern tools and automation that reduce labor costs and increase consistency." },
];

export default function AgritechPage() {
  return (
    <div className="max-w-5xl mx-auto px-5 py-16">
      <p className="text-xs font-semibold uppercase tracking-wider text-kb-gold-dark mb-3">
        Technology for modern farming
      </p>
      <h1 className="font-display text-4xl font-bold text-kb-charcoal mb-4">
        Agritech
      </h1>
      <p className="text-lg text-kb-charcoal/70 max-w-2xl mb-14">
        We bring practical technology to Nigerian farms — helping growers make
        better decisions, use fewer resources, and produce more consistent
        yields.
      </p>

      <div className="grid sm:grid-cols-2 gap-6 mb-16">
        {capabilities.map((c) => (
          <div key={c.title} className="p-6 border border-kb-green/15 rounded-2xl">
            <c.icon className="text-kb-green mb-3" size={28} />
            <p className="font-semibold text-kb-charcoal mb-1">{c.title}</p>
            <p className="text-sm text-kb-charcoal/60">{c.desc}</p>
          </div>
        ))}
      </div>

      <div className="max-w-xl">
        <InquiryForm source="agritech" title="Talk to our Agritech team" />
      </div>
    </div>
  );
}
