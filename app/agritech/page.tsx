import { Cpu, Satellite, Droplets, BarChart3 } from "lucide-react";
import InquiryForm from "@/components/InquiryForm";
import { getPageContent, pick } from "@/lib/content";
import PageHeader from "@/components/PageHeader";

// Served from a saved copy and rebuilt at most every 300 seconds (and instantly after admin edits).
export const revalidate = 300;

export const metadata = { title: "Agritech — KingBoostFarms" };

const capabilityDefaults = [
  { key: "capability-1", icon: "Satellite", title: "Precision Farming", body: "Satellite and sensor-driven insights to plan planting, monitor crop health, and optimize yield." },
  { key: "capability-2", icon: "Droplets", title: "Smart Irrigation", body: "Automated irrigation systems that reduce water waste while keeping crops healthy." },
  { key: "capability-3", icon: "BarChart3", title: "Farm Data & Analytics", body: "Dashboards that turn field data into decisions — from input planning to harvest forecasting." },
  { key: "capability-4", icon: "Cpu", title: "Equipment & Automation", body: "Modern tools and automation that reduce labor costs and increase consistency." },
];

const iconMap = { Cpu, Satellite, Droplets, BarChart3 };

export default async function AgritechPage() {
  const rows = await getPageContent("agritech");
  const intro = pick(rows, "intro", "main");

  return (
    <>
      <PageHeader
        title="Agritech"
        description={
          intro?.body ??
          "We bring practical technology to Nigerian farms — helping growers make better decisions, use fewer resources, and produce more consistent yields."
        }
      />
      <div className="mx-auto max-w-6xl px-5 py-14">
        <h2 className="mb-8 text-2xl font-bold text-kb-forest sm:text-3xl">
          {intro?.title ?? "Technology for modern farming"}
        </h2>

      <div className="grid sm:grid-cols-2 gap-6 mb-16">
        {capabilityDefaults.map((c) => {
          const row = pick(rows, "capability", c.key);
          const iconName = (row?.icon ?? c.icon) as keyof typeof iconMap;
          const Icon = iconMap[iconName] ?? Cpu;
          return (
            <div key={c.key} className="card p-6">
              <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-kb-mist text-kb-green">
                <Icon size={24} aria-hidden="true" />
              </span>
              <p className="text-lg font-bold text-kb-forest mb-1">{row?.title ?? c.title}</p>
              <p className="text-sm text-kb-charcoal/60">{row?.body ?? c.body}</p>
            </div>
          );
        })}
      </div>

      <div className="max-w-xl">
        <InquiryForm source="agritech" title="Talk to our Agritech team" />
      </div>
      </div>
    </>
  );
}
