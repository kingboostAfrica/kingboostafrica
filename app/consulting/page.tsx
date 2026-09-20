import Link from "next/link";
import Image from "next/image";
import PageHeader from "@/components/PageHeader";
import { createPublicClient } from "@/lib/supabase/public";
import type { ConsultingService } from "@/lib/types";

// Served from a saved copy and rebuilt at most every 300 seconds (and instantly after admin edits).
export const revalidate = 300;

export const metadata = { title: "Consulting — KingBoostFarms" };

export default async function ConsultingPage() {
  const supabase = createPublicClient();
  const { data: services } = await supabase
    .from("consulting_services")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  const list = (services as ConsultingService[] | null) || [];

  return (
    <>
      <PageHeader
        title="Consulting"
        description="Hands-on advisory for farms, cooperatives, and agribusinesses — from setting up operations to scaling production and reaching new markets."
      />
      <div className="mx-auto max-w-6xl px-5 py-14">
      {list.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {list.map((service) => (
            <Link
              key={service.id}
              href={`/consulting/${service.slug}`}
              className="card group block"
            >
              <div className="aspect-video bg-kb-mist relative">
                {service.image_url ? (
                  <Image src={service.image_url} alt={service.title} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-kb-green/50 text-sm">
                    No image
                  </div>
                )}
              </div>
              <div className="p-5">
                <p className="font-display text-lg font-bold text-kb-forest group-hover:text-kb-green transition-colors">
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
        <div className="text-center py-24 border border-dashed border-kb-forest/25 rounded-xl">
          <p className="text-kb-charcoal/60">No services published yet. Check back soon.</p>
        </div>
      )}
      </div>
    </>
  );
}
