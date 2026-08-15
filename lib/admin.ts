import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Use this at the top of every /admin/* server page instead of just
// checking `if (!user) redirect("/admin/login")`.
// It confirms the logged-in user is actually listed in the `admins` table,
// not just any logged-in Supabase user (e.g. a farmer account).
export async function requireAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  const { data: adminRow } = await supabase
    .from("admins")
    .select("id")
    .eq("id", user.id)
    .single();

  if (!adminRow) redirect("/admin/login");

  return { supabase, user };
}
