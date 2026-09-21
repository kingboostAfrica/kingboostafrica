import { requireAdmin } from "@/lib/admin";
import StoreSettingsForm from "@/components/admin/StoreSettingsForm";
import DeliveryZonesManager, { type ZoneRow } from "@/components/admin/DeliveryZonesManager";

export default async function AdminSettingsPage() {
  const { supabase } = await requireAdmin();
  const [{ data: settings }, { data: zones }] = await Promise.all([
    supabase
      .from("store_settings")
      .select("vat_percent, pickup_enabled, pickup_address, pickup_instructions, whatsapp_number")
      .eq("id", 1)
      .maybeSingle(),
    supabase.from("delivery_zones").select("id, name, fee, is_active").order("name"),
  ]);

  return (
    <div className="max-w-2xl mx-auto px-5 py-12">
      <h1 className="font-display text-3xl font-bold text-kb-charcoal mt-2 mb-2">Store settings</h1>
      <p className="text-kb-charcoal/60 mb-8">
        VAT, self pickup and delivery fees are added to every new order at checkout, and are included in what
        Paystack charges. Orders already placed keep the amounts they were charged.
      </p>

      <div className="space-y-12">
        <StoreSettingsForm
          vatPercent={Number(settings?.vat_percent ?? 0)}
          pickupEnabled={Boolean(settings?.pickup_enabled)}
          pickupAddress={settings?.pickup_address ?? ""}
          pickupInstructions={settings?.pickup_instructions ?? ""}
          whatsappNumber={settings?.whatsapp_number ?? ""}
        />
        <DeliveryZonesManager
          zones={((zones as { id: string; name: string; fee: number; is_active: boolean }[] | null) ?? []).map(
            (z): ZoneRow => ({ id: z.id, name: z.name, fee: Number(z.fee), is_active: z.is_active })
          )}
        />
      </div>
    </div>
  );
}
