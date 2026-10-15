import { requireAdmin } from "@/lib/admin";
import FarmUpdatesManager, { type AdminUpdate } from "@/components/admin/FarmUpdatesManager";

export const dynamic = "force-dynamic";

export default async function AdminUpdatesPage() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("farm_updates")
    .select("id, title, body, image_url, is_published, published_at")
    .order("published_at", { ascending: false })
    .limit(200);

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <h1 className="mb-2 font-display text-3xl font-bold text-kb-charcoal">Farm updates</h1>
      <p className="mb-8 text-kb-charcoal/60">
        Short news posts shown in &ldquo;Latest from the farm&rdquo; on the home page and at /updates.
      </p>
      {error ? (
        <p className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
          Farm updates are not set up yet. Run <code>supabase/014_home_page_sections.sql</code> in the Supabase SQL editor.
        </p>
      ) : (
        <FarmUpdatesManager updates={(data ?? []) as AdminUpdate[]} />
      )}
    </div>
  );
}
