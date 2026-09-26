import { requireAdmin } from "@/lib/admin";
import type { DiscountCode } from "@/lib/types";
import DiscountCodesManager from "@/components/admin/DiscountCodesManager";

export default async function AdminDiscountsPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("discount_codes").select("*").order("created_at", { ascending: false });

  return (
    <div className="max-w-3xl mx-auto px-5 py-12">
      <h1 className="font-display text-3xl font-bold text-kb-charcoal mb-2">Discount codes</h1>
      <p className="text-kb-charcoal/60 mb-8">
        Codes customers can enter at checkout. Discounts apply to the product subtotal, before VAT and delivery. Each
        code is checked and redeemed on the server, so it can never be faked from the browser.
      </p>
      <DiscountCodesManager codes={(data as DiscountCode[] | null) ?? []} />
    </div>
  );
}
