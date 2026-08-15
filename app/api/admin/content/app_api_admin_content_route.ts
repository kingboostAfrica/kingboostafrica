import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";

export async function PATCH(req: NextRequest) {
  let supabase;
  try {
    ({ supabase } = await requireAdmin());
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const rows = body?.rows;

  if (!Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json({ error: "No rows provided" }, { status: 400 });
  }

  const payload = rows.map((r) => ({
    page: r.page,
    section: r.section,
    key: r.key,
    sort_order: r.sort_order ?? 0,
    title: r.title ?? null,
    body: r.body ?? null,
    icon: r.icon ?? null,
    image_url: r.image_url ?? null,
    updated_at: new Date().toISOString(),
  }));

  const { error } = await supabase
    .from("page_content")
    .upsert(payload, { onConflict: "page,section,key" });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
