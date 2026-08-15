import Image from "next/image";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ConsultingService } from "@/lib/types";
import BookingForm from "@/components/BookingForm";

export default async function ConsultingServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: service } = await supabase
    .from("consulting_services")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!service) notFound();

  const s = service as ConsultingService;

  return (
    <div className="max-w-5xl mx-auto px-5 py-12 grid sm:grid-cols-2 gap-10">
      <div>
        <div className="aspect-video bg-kb-cream rounded-2xl overflow-hidden relative mb-6">
          {s.image_url ? (
            <Image src={s.image_url} alt={s.title} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-kb-green/50">
              No image
            </div>
          )}
        </div>
        <h1 className="font-display text-3xl font-bold text-kb-charcoal">{s.title}</h1>
        {s.price_from != null && (
          <p className="text-2xl font-semibold text-kb-green mt-3">
            From ₦{s.price_from.toLocaleString()}
          </p>
        )}
        {s.description && (
          <p className="text-kb-charcoal/70 mt-6 leading-relaxed">{s.description}</p>
        )}
      </div>

      <div className="p-6 border border-kb-green/15 rounded-2xl h-fit">
        <h2 className="font-display text-lg font-bold text-kb-charcoal mb-4">Book this service</h2>
        <BookingForm serviceId={s.id} />
      </div>
    </div>
  );
}
