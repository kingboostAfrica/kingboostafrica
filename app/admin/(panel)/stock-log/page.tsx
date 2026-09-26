import { requireAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import type { StockLogEntry } from "@/lib/types";

export default async function AdminStockLogPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase
    .from("stock_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  const entries = (data as StockLogEntry[] | null) ?? [];

  // Look up team member emails for entries changed by a person (not by an order).
  const service = createAdminClient();
  const userIds = Array.from(new Set(entries.map((e) => e.changed_by).filter((v): v is string => Boolean(v))));
  const emailById = new Map<string, string>();
  if (service && userIds.length > 0) {
    await Promise.all(
      userIds.map(async (id) => {
        const { data: u } = await service.auth.admin.getUserById(id);
        if (u?.user?.email) emailById.set(id, u.user.email);
      })
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-5 py-12">
      <h1 className="font-display text-3xl font-bold text-kb-charcoal mb-2">Stock log</h1>
      <p className="text-kb-charcoal/60 mb-8">
        Every change to a product&apos;s stock — from an order, a cancellation, or someone on the team editing it by
        hand. The most recent 200 changes.
      </p>

      {entries.length === 0 ? (
        <div className="rounded-xl border border-dashed border-kb-forest/25 py-24 text-center">
          <p className="text-kb-charcoal/60">No stock changes yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-kb-forest/15">
          <table className="w-full text-sm">
            <thead className="bg-kb-mist text-left text-xs uppercase tracking-wide text-kb-charcoal/50">
              <tr>
                <th className="px-4 py-3 font-semibold">When</th>
                <th className="px-4 py-3 font-semibold">Product</th>
                <th className="px-4 py-3 text-right font-semibold">Before</th>
                <th className="px-4 py-3 text-right font-semibold">After</th>
                <th className="px-4 py-3 text-right font-semibold">Change</th>
                <th className="px-4 py-3 font-semibold">By</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.id} className="border-t border-kb-forest/10">
                  <td className="whitespace-nowrap px-4 py-2.5 text-kb-charcoal/60">{new Date(e.created_at).toLocaleString()}</td>
                  <td className="px-4 py-2.5 font-medium text-kb-charcoal">{e.product_name}</td>
                  <td className="px-4 py-2.5 text-right text-kb-charcoal/60">{e.previous_stock}</td>
                  <td className="px-4 py-2.5 text-right text-kb-charcoal/60">{e.new_stock}</td>
                  <td className={`px-4 py-2.5 text-right font-semibold ${e.change < 0 ? "text-red-600" : "text-kb-green"}`}>
                    {e.change > 0 ? `+${e.change}` : e.change}
                  </td>
                  <td className="px-4 py-2.5 text-kb-charcoal/60">
                    {e.changed_by ? emailById.get(e.changed_by) ?? "Team member" : "Order / system"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
