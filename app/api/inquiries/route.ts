import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { clean, isEmail, looksLikeBot } from "@/lib/validation";
import { notifyOwner } from "@/lib/email";

const SOURCES = ["agritech", "organics", "general"];

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Silently accept-and-drop bot submissions so they don't retry.
    if (looksLikeBot(body)) return NextResponse.json({ ok: true });

    const source = clean(body.source, 20);
    const full_name = clean(body.full_name, 200);
    const email = clean(body.email, 320);
    const phone = clean(body.phone, 40);
    const message = clean(body.message, 5000);

    if (!SOURCES.includes(source) || !full_name || !isEmail(email) || !message) {
      return NextResponse.json(
        { error: "Please fill in your name, a valid email and a message." },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { error } = await supabase.from("inquiries").insert({
      source,
      full_name,
      email,
      phone: phone || null,
      message,
      status: "new",
    });

    if (error) throw error;

    await notifyOwner(
      `New ${source} inquiry from ${full_name}`,
      "New website inquiry",
      [["Topic", source], ["Name", full_name], ["Email", email], ["Phone", phone], ["Message", message]],
      email,
      "/admin/messages",
      "Open messages in admin"
    );
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Inquiry submission error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
