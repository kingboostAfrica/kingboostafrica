import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";

// Full admins only. Adds or removes people who can log in to the admin.
//   role "admin": full access.   role "staff": Orders and Messages only.

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function guard() {
  try {
    const { user } = await requireAdmin();
    return { user };
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const who = await guard();
  if (!who) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const service = createAdminClient();
  if (!service) {
    return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY is not set on the server." }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const email = String(body?.email ?? "").trim().toLowerCase();
  const password = String(body?.password ?? "");
  const role = body?.role === "admin" ? "admin" : "staff";

  if (!EMAIL.test(email)) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  if (password.length < 8) {
    return NextResponse.json({ error: "The temporary password must be at least 8 characters." }, { status: 400 });
  }

  // Create the login (no confirmation email needed: you give them the password yourself).
  let userId: string | undefined;
  const created = await service.auth.admin.createUser({ email, password, email_confirm: true });
  if (created.data?.user) {
    userId = created.data.user.id;
  } else if (/already|registered|exists/i.test(created.error?.message ?? "")) {
    // The person already has a login: just give them access (their password is unchanged).
    const { data: list } = await service.auth.admin.listUsers({ page: 1, perPage: 1000 });
    userId = list?.users?.find((u) => u.email?.toLowerCase() === email)?.id;
  }
  if (!userId) {
    return NextResponse.json({ error: created.error?.message ?? "Could not create that login." }, { status: 400 });
  }

  const { error } = await service.from("admins").upsert({ id: userId, role });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, role });
}

export async function DELETE(request: Request) {
  const who = await guard();
  if (!who) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const service = createAdminClient();
  if (!service) {
    return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY is not set on the server." }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const userId = typeof body?.userId === "string" ? body.userId : "";
  if (!userId) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  if (userId === who.user.id) {
    return NextResponse.json({ error: "You cannot remove your own access." }, { status: 409 });
  }

  const { data: target } = await service.from("admins").select("*").eq("id", userId).maybeSingle();
  if (!target) return NextResponse.json({ error: "That person is not on the team." }, { status: 404 });

  if ((target.role ?? "admin") === "admin") {
    const { data: admins } = await service.from("admins").select("*");
    const adminCount = (admins ?? []).filter((a: { role?: string }) => (a.role ?? "admin") === "admin").length;
    if (adminCount <= 1) {
      return NextResponse.json({ error: "You cannot remove the last full admin." }, { status: 409 });
    }
  }

  const { error } = await service.from("admins").delete().eq("id", userId);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  // Also remove the login itself so it cannot be used for anything.
  await service.auth.admin.deleteUser(userId).catch(() => {});
  return NextResponse.json({ ok: true });
}
