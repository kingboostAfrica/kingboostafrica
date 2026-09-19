import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import type { ConsultingService } from "@/lib/types";
import ServiceForm from "@/components/admin/ServiceForm";

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const { data: service } = await supabase
    .from("consulting_services")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!service) notFound();

  return (
    <div className="max-w-xl mx-auto px-5 py-12">
      <h1 className="font-display text-3xl font-bold text-kb-charcoal mb-8">Edit Consulting Service</h1>
      <ServiceForm initial={service as ConsultingService} />
    </div>
  );
}
