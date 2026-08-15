import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import type { ConsultingService } from "@/lib/types";

export const metadata = { title: "Consulting — KingBoostFarms" };

export default async function ConsultingPage() {
  const supabase = await createClient();
  const { data: services } = await supabase
    .from("consulting_services")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  const list = (services as ConsultingService[] | null) || [];

  return (
    <div className="max-w-6xl mx-auto px-5 py-16">
      <p className="text-xs font-semibold uppercase tracking-wider text-kb-gold-dark mb-3">
        Expert agribusiness advisory
      </p>
      <h1 className="font-display text-4xl font-bold text-kb-charcoal mb-4">
        Consulting
      </h1>
      <p className="text-lg text-kb-charcoal/70 max-w-2xl mb-14">
        Hands-on advisory for farms, cooperatives, and agribusinesses — from
        setting up operations to scaling production and reaching new markets.
      </p>

      {list.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {list.map((service) => (
            <Link
              key={service.id}
              href={`/consulting/${service.slug}`}
              className="group block rounded-2xl overflow-hidden border border-kb-green/15 bg-white hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              <div className="aspect-video bg-kb-cream relative">
                {service.image_url ? (
                  <Image src={service.image_url} alt={service.title} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-kb-green/50 text-sm">
                    No image
                  </div>
                )}
              </div>
              <div className="p-5">
                <p className="font-display font-bold text-kb-charcoal group-hover:text-kb-green transition-colors">
                  {service.title}
                </p>
                {service.summary && (
                  <p className="text-sm text-kb-charcoal/60 mt-1 line-clamp-2">{service.summary}</p>
                )}
                {service.price_from != null && (
                  <p className="text-kb-green font-semibold text-sm mt-4">
                    From ₦{service.price_from.toLocaleString()}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 border border-dashed border-kb-green/30 rounded-2xl">
          <p className="text-kb-charcoal/60">No services published yet. Check back soon.</p>
        </div>
      )}
    </div>
  );
}
