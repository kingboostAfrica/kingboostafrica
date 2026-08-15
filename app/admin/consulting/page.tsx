import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ConsultingService } from "@/lib/types";
import ToggleActiveButton from "@/components/ToggleActiveButton";

export default async function AdminConsultingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  const { data: services } = await supabase
    .from("consulting_services")
    .select("*")
    .order("created_at", { ascending: false });

  const list = (services as ConsultingService[] | null) || [];

  return (
    <div className="max-w-4xl mx-auto px-5 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/admin" className="text-sm text-kb-gold-dark hover:underline">
            ← Dashboard
          </Link>
          <h1 className="font-display text-3xl font-bold text-kb-charcoal mt-2">
            Consulting Services
          </h1>
        </div>
        <Link
          href="/admin/consulting/new"
          className="text-sm font-medium px-5 py-2.5 bg-kb-green text-white rounded-full hover:bg-kb-green-dark transition-colors"
        >
          + New Service
        </Link>
      </div>

      {list.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-kb-green/30 rounded-2xl">
          <p className="text-kb-charcoal/60">No services yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {list.map((service) => (
            <div
              key={service.id}
              className="flex items-center gap-4 p-4 border border-kb-green/15 rounded-2xl"
            >
              <div className="w-16 h-16 bg-kb-cream rounded-xl overflow-hidden relative shrink-0">
                {service.image_url && (
                  <Image src={service.image_url} alt={service.title} fill className="object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-kb-charcoal truncate">{service.title}</p>
                {service.price_from != null && (
                  <p className="text-sm text-kb-green font-semibold">
                    From ₦{service.price_from.toLocaleString()}
                  </p>
                )}
                <p className="text-xs text-kb-charcoal/50">
                  {service.is_active ? "Active" : "Hidden"}
                </p>
              </div>
              <ToggleActiveButton table="consulting_services" id={service.id} isActive={service.is_active} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
