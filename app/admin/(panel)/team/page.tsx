import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import TeamManager, { type Member } from "@/components/admin/TeamManager";

export default async function AdminTeamPage() {
  const { user } = await requireAdmin();
  const service = createAdminClient();

  let members: Member[] = [];
  if (service) {
    const { data: rows } = await service.from("admins").select("*");
    members = await Promise.all(
      ((rows as { id: string; role?: string }[] | null) ?? []).map(async (r) => {
        const { data } = await service.auth.admin.getUserById(r.id);
        return {
          id: r.id,
          email: data?.user?.email ?? r.id,
          role: r.role === "staff" ? ("staff" as const) : ("admin" as const),
          isYou: r.id === user.id,
        };
      })
    );
    members.sort((a, b) => (a.role === b.role ? a.email.localeCompare(b.email) : a.role === "admin" ? -1 : 1));
  }

  return (
    <div className="max-w-2xl mx-auto px-5 py-12">
      <Link href="/admin" className="text-sm text-kb-gold-dark hover:underline">
        ← Dashboard
      </Link>
      <h1 className="font-display text-3xl font-bold text-kb-charcoal mt-2 mb-2">Team</h1>
      <p className="text-kb-charcoal/60 mb-8">
        Who can log in to the admin. <strong>Staff</strong> can only handle Orders and Messages (for example someone
        who packs and ships). Only <strong>full admins</strong> can change products, settings, refunds and the team.
      </p>
      {service ? (
        <TeamManager members={members} />
      ) : (
        <p className="rounded-lg border border-kb-gold/40 bg-kb-gold/10 p-4 text-sm">
          The server needs <span className="font-mono">SUPABASE_SERVICE_ROLE_KEY</span> (the same key used for Paystack) to
          manage the team.
        </p>
      )}
    </div>
  );
}
