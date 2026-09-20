import { Leaf, Users, MapPin, Target } from "lucide-react";
import { getPageContent, pick } from "@/lib/content";
import PageHeader from "@/components/PageHeader";

// Served from a saved copy and rebuilt at most every 300 seconds (and instantly after admin edits).
export const revalidate = 300;

export const metadata = { title: "About Us — KingBoostFarms" };

const verticalDefaults = [
  { key: "food-mart", name: "Food Mart", desc: "Pure, natural, nutritious produce sold direct to households and businesses." },
  { key: "academy", name: "Academy", desc: "Training and courses that build agribusiness skills across Nigeria." },
  { key: "consulting", name: "Consulting", desc: "Expert advisory for farms, cooperatives, and agribusinesses." },
  { key: "agritech", name: "Agritech", desc: "Practical technology that makes modern farming more productive." },
  { key: "organics", name: "Organics", desc: "Certified organic inputs and produce for a healthier food system." },
];

const pillarDefaults = [
  { key: "mission", icon: "Target", title: "Our Mission", body: "Deliver pure, natural, nutritious food and dependable agribusiness services across Nigeria." },
  { key: "community", icon: "Users", title: "Our Community", body: "Customers, learners, farms, and partners we serve across our five verticals." },
  { key: "sustainability", icon: "Leaf", title: "Sustainability", body: "Every product and service is built with long-term agricultural health in mind." },
];

const pillarIconMap = { Target, Users, Leaf };

const introDefault =
  "KingBoostFarms is a Nigerian agribusiness built to strengthen agriculture from the ground up — from the food on the table, to the knowledge that grows a farm, to the technology and organic practices that make it all sustainable.\n\nWe operate across five verticals — Food Mart, Academy, Consulting, Agritech, and Organics — each dedicated to a different part of the agricultural value chain, united by one mission: cultivating growth and nourishing nations.";

export default async function AboutPage() {
  const rows = await getPageContent("about");
  const intro = pick(rows, "intro", "main");
  const paragraphs = (intro?.body ?? introDefault).split("\n\n");

  return (
    <>
      <PageHeader
        title="About KingBoostFarms"
        description={intro?.title ?? "Growing Value. Nourishing Lives."}
      />
      <div className="mx-auto max-w-6xl px-5 py-14">
      {paragraphs.map((p, i) => (
        <p
          key={i}
          className={`max-w-3xl text-kb-charcoal/75 leading-relaxed ${
            i === 0 ? "text-lg mb-6" : "mb-12"
          }`}
        >
          {p}
        </p>
      ))}

      <div className="grid sm:grid-cols-2 gap-6 mb-14">
        {verticalDefaults.map((v) => {
          const row = pick(rows, "vertical", v.key);
          return (
            <div key={v.key} className="card p-6">
              <p className="font-display text-lg font-bold text-kb-forest mb-1">{row?.title ?? v.name}</p>
              <p className="text-sm text-kb-charcoal/60">{row?.body ?? v.desc}</p>
            </div>
          );
        })}
      </div>

      <div className="grid sm:grid-cols-3 gap-8">
        {pillarDefaults.map((p) => {
          const row = pick(rows, "pillar", p.key);
          const iconName = (row?.icon ?? p.icon) as keyof typeof pillarIconMap;
          const Icon = pillarIconMap[iconName] ?? Leaf;
          return (
            <div key={p.key} className="flex flex-col items-start gap-3">
              <Icon className="text-kb-gold-dark" size={28} />
              <p className="font-semibold text-kb-charcoal">{row?.title ?? p.title}</p>
              <p className="text-sm text-kb-charcoal/60">{row?.body ?? p.body}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-14 flex items-start gap-3 p-5 bg-kb-cream rounded-xl">
        <MapPin className="text-kb-green shrink-0 mt-0.5" size={20} />
        <p className="text-sm text-kb-charcoal/70">
          8 Ibudo Oloja Street, Igbanko, Badagry, Lagos State, Nigeria
        </p>
      </div>
      </div>
    </>
  );
}
