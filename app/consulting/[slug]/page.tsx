import Image from "next/image";
import { notFound } from "next/navigation";
import { createPublicClient } from "@/lib/supabase/public";
import type { ConsultingService } from "@/lib/types";
import BookingForm from "@/components/BookingForm";
import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";

// Served from a saved copy and rebuilt at most every 300 seconds (and instantly after admin edits).
export const revalidate = 300;

// No pages are built ahead of time; each one is built on first visit, then reused.
export function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("consulting_services")
    .select("title, summary, image_url")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();
  if (!data) return {};
  const title = `${data.title} — KingBoostFarms Consulting`;
  const description = data.summary ?? `Book ${data.title} with KingBoostFarms Consulting.`;
  const image = data.image_url;
  return {
    title,
    description,
    openGraph: { title, description, ...(image ? { images: [image] } : {}) },
  };
}


export default async function ConsultingServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = createPublicClient();

  const { data: service } = await supabase
    .from("consulting_services")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!service) notFound();

  const s = service as ConsultingService;

  return (
    <>
      <Breadcrumbs crumbs={[{ label: "Consulting", href: "/consulting" }, { label: s.title }]} />
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 lg:grid-cols-[1.2fr_1fr]">
      <div>
        <div className="aspect-video bg-kb-mist rounded-xl overflow-hidden relative mb-6">
          {s.image_url ? (
            <Image src={s.image_url} alt={s.title} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-kb-green/50">
              No image
            </div>
          )}
        </div>
        <h1 className="font-display text-3xl font-bold text-kb-forest sm:text-4xl">{s.title}</h1>
        {s.price_from != null && (
          <p className="text-2xl font-semibold text-kb-green mt-3">
            From ₦{s.price_from.toLocaleString()}
          </p>
        )}
        {s.description && (
          <p className="text-kb-charcoal/70 mt-6 leading-relaxed">{s.description}</p>
        )}
      </div>

      <div className="card h-fit p-6 lg:sticky lg:top-28">
        <h2 className="font-display text-xl font-bold text-kb-forest mb-4">Book this service</h2>
        <BookingForm serviceId={s.id} />
      </div>
      </div>
    </>
  );
}
