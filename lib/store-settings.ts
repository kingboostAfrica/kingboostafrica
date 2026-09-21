import { createPublicClient } from "@/lib/supabase/public";
import { SOCIAL_PLATFORMS, isValidSocialUrl, type SocialLink } from "@/lib/social";

export type DeliveryZone = { id: string; name: string; fee: number };

export type CheckoutOptions = {
  vatPercent: number;
  pickup: { enabled: boolean; address: string; instructions: string };
  zones: DeliveryZone[];
};

// Everything checkout needs: VAT %, self-pickup details and the active delivery areas
// (all set in Admin > Settings). Falls back to "no VAT, no pickup, free delivery" if unreadable.
export async function getCheckoutOptions(): Promise<CheckoutOptions> {
  const empty: CheckoutOptions = {
    vatPercent: 0,
    pickup: { enabled: false, address: "", instructions: "" },
    zones: [],
  };
  try {
    const db = createPublicClient();
    const [{ data: s }, { data: z }] = await Promise.all([
      db
        .from("store_settings")
        .select("vat_percent, pickup_enabled, pickup_address, pickup_instructions")
        .eq("id", 1)
        .maybeSingle(),
      db.from("delivery_zones").select("id, name, fee").eq("is_active", true).order("name"),
    ]);
    return {
      vatPercent: Number(s?.vat_percent ?? 0) || 0,
      pickup: {
        enabled: Boolean(s?.pickup_enabled),
        address: s?.pickup_address ?? "",
        instructions: s?.pickup_instructions ?? "",
      },
      zones: ((z as { id: string; name: string; fee: number }[] | null) ?? []).map((r) => ({
        id: r.id,
        name: r.name,
        fee: Number(r.fee) || 0,
      })),
    };
  } catch {
    return empty;
  }
}

// The WhatsApp number shown across the site (set in Admin > Settings). null = none set / unreadable.
export async function getWhatsappNumber(): Promise<string | null> {
  try {
    const { data } = await createPublicClient()
      .from("store_settings")
      .select("whatsapp_number")
      .eq("id", 1)
      .maybeSingle();
    const n = String(data?.whatsapp_number ?? "").replace(/\D/g, "");
    return /^\d{10,15}$/.test(n) ? n : null;
  } catch {
    return null;
  }
}

// Social media links switched on in Admin > Social media, in a fixed, tidy order.
export async function getSocialLinks(): Promise<SocialLink[]> {
  try {
    const { data } = await createPublicClient().from("social_links").select("platform, url").eq("is_active", true);
    const rows = (data as SocialLink[] | null) ?? [];
    return SOCIAL_PLATFORMS.map((p) => rows.find((r) => r.platform === p.key))
      .filter((r): r is SocialLink => Boolean(r) && isValidSocialUrl(r!.url));
  } catch {
    return [];
  }
}
