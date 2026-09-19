import { requireAdmin } from "@/lib/admin";
import ServiceForm from "@/components/admin/ServiceForm";

export default async function NewServicePage() {
  await requireAdmin();
  return (
    <div className="max-w-xl mx-auto px-5 py-12">
      <h1 className="font-display text-3xl font-bold text-kb-charcoal mb-8">New Consulting Service</h1>
      <ServiceForm />
    </div>
  );
}
