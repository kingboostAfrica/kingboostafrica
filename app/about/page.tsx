import { Leaf, Users, MapPin, Target } from "lucide-react";

export const metadata = { title: "About Us — KingBoostFarms" };

const verticals = [
  { name: "Food Mart", desc: "Pure, natural, nutritious produce sold direct to households and businesses." },
  { name: "Academy", desc: "Training and courses that build agribusiness skills across Nigeria." },
  { name: "Consulting", desc: "Expert advisory for farms, cooperatives, and agribusinesses." },
  { name: "Agritech", desc: "Practical technology that makes modern farming more productive." },
  { name: "Organics", desc: "Certified organic inputs and produce for a healthier food system." },
];

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-5 py-16">
      <p className="text-xs font-semibold uppercase tracking-wider text-kb-gold-dark mb-3">
        Growing Value. Nourishing Lives.
      </p>
      <h1 className="font-display text-4xl font-bold text-kb-charcoal mb-6">
        About KingBoostFarms
      </h1>
      <p className="text-lg text-kb-charcoal/70 leading-relaxed mb-6">
        KingBoostFarms is a Nigerian agribusiness built to strengthen
        agriculture from the ground up — from the food on the table, to the
        knowledge that grows a farm, to the technology and organic practices
        that make it all sustainable.
      </p>
      <p className="text-kb-charcoal/70 leading-relaxed mb-12">
        We operate across five verticals — Food Mart, Academy, Consulting,
        Agritech, and Organics — each dedicated to a different part of the
        agricultural value chain, united by one mission: cultivating growth
        and nourishing nations.
      </p>

      <div className="grid sm:grid-cols-2 gap-6 mb-14">
        {verticals.map((v) => (
          <div key={v.name} className="p-5 border border-kb-green/15 rounded-2xl">
            <p className="font-display font-bold text-kb-green mb-1">{v.name}</p>
            <p className="text-sm text-kb-charcoal/60">{v.desc}</p>
          </div>
        ))}
      </div>

      <div className="grid sm:grid-cols-3 gap-8">
        <div className="flex flex-col items-start gap-3">
          <Target className="text-kb-gold-dark" size={28} />
          <p className="font-semibold text-kb-charcoal">Our Mission</p>
          <p className="text-sm text-kb-charcoal/60">
            Deliver pure, natural, nutritious food and dependable agribusiness
            services across Nigeria.
          </p>
        </div>
        <div className="flex flex-col items-start gap-3">
          <Users className="text-kb-gold-dark" size={28} />
          <p className="font-semibold text-kb-charcoal">Our Community</p>
          <p className="text-sm text-kb-charcoal/60">
            Customers, learners, farms, and partners we serve across our five
            verticals.
          </p>
        </div>
        <div className="flex flex-col items-start gap-3">
          <Leaf className="text-kb-gold-dark" size={28} />
          <p className="font-semibold text-kb-charcoal">Sustainability</p>
          <p className="text-sm text-kb-charcoal/60">
            Every product and service is built with long-term agricultural
            health in mind.
          </p>
        </div>
      </div>

      <div className="mt-14 flex items-start gap-3 p-5 bg-kb-cream rounded-2xl">
        <MapPin className="text-kb-green shrink-0 mt-0.5" size={20} />
        <p className="text-sm text-kb-charcoal/70">
          8 Ibudo Oloja Street, Igbanko, Badagry, Lagos State, Nigeria
        </p>
      </div>
    </div>
  );
}
