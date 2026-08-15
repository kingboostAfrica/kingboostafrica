import { Leaf, Users, MapPin } from "lucide-react";

export const metadata = { title: "About — KingBoostAfrica" };

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-5 py-16">
      <h1 className="font-display text-4xl font-semibold text-ink mb-6">
        About KingBoostAfrica
      </h1>
      <p className="text-lg text-ink/70 leading-relaxed mb-6">
        KingBoostAfrica is a marketplace and directory built to connect
        Nigerian farmers directly with buyers — no middlemen, fair prices,
        and full visibility into who grew what you&apos;re buying.
      </p>
      <p className="text-ink/70 leading-relaxed mb-12">
        Farmers register, build a public profile, and list their crops,
        livestock, and equipment for sale. Buyers browse the marketplace,
        discover verified farmers near them, and order directly.
      </p>

      <div className="grid sm:grid-cols-3 gap-8">
        <div className="flex flex-col items-start gap-3">
          <Leaf className="text-clay" size={28} />
          <p className="font-semibold text-ink">Our Mission</p>
          <p className="text-sm text-ink/60">
            Give Nigerian farmers direct access to buyers and fair prices for
            their produce.
          </p>
        </div>
        <div className="flex flex-col items-start gap-3">
          <Users className="text-clay" size={28} />
          <p className="font-semibold text-ink">Our Community</p>
          <p className="text-sm text-ink/60">
            A growing cooperative of verified farmers across Nigeria.
          </p>
        </div>
        <div className="flex flex-col items-start gap-3">
          <MapPin className="text-clay" size={28} />
          <p className="font-semibold text-ink">Rooted Locally</p>
          <p className="text-sm text-ink/60">
            Every listing is tied to a real farm, farmer, and location.
          </p>
        </div>
      </div>
    </div>
  );
}
