import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AdminRole = "admin" | "staff";

async function loadAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, role: null as AdminRole | null };

  // select("*") so this also works before the `role` column exists (everyone is then a full admin)
  const { data: row } = await supabase.from("admins").select("*").eq("id", user.id).single();
  if (!row) return { supabase, user, role: null as AdminRole | null };
  return { supabase, user, role: (row.role === "staff" ? "staff" : "admin") as AdminRole };
}

// Use at the top of every admin page/API that only a FULL admin may see
// (products, settings, refunds, site content, team...). Staff are sent to Orders.
export async function requireAdmin() {
  const { supabase, user, role } = await loadAdmin();
  if (!user || !role) redirect("/admin/login");
  if (role !== "admin") redirect("/admin/orders");
  return { supabase, user, role };
}

// Use where staff are allowed too (Orders, Messages, Account).
export async function requireStaff() {
  const { supabase, user, role } = await loadAdmin();
  if (!user || !role) redirect("/admin/login");
  return { supabase, user, role };
}
