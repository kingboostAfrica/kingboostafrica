import { requireAdmin } from "@/lib/admin";
import SocialLinksManager, { type SocialRow } from "@/components/admin/SocialLinksManager";

export default async function AdminSocialPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("social_links").select("platform, url, is_active");

  return (
    <div className="max-w-3xl mx-auto px-5 py-12">
      <h1 className="font-display text-3xl font-bold text-kb-charcoal mb-2">Social media</h1>
      <p className="text-kb-charcoal/60 mb-8">
        Paste the full web address of each page you want to show. Icons appear in the website footer and the top bar.
        Leave a box empty to remove that icon, or untick Show to hide it for now. Your WhatsApp icon comes from
        Settings, and is added automatically.
      </p>
      <SocialLinksManager rows={(data as SocialRow[] | null) ?? []} />
    </div>
  );
}
