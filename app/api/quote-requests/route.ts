import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { clean, isEmail, looksLikeBot } from "@/lib/validation";
import { notifyOwner } from "@/lib/email";
import { sendQuoteRequestReceivedEmail } from "@/lib/order-emails";

type RawLine = { name?: unknown; quantity?: unknown; unit?: unknown };

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (looksLikeBot(body)) return NextResponse.json({ ok: true });

    const company_name = clean(body.company_name, 200);
    const contact_name = clean(body.contact_name, 200);
    const email = clean(body.email, 320);
    const phone = clean(body.phone, 40);
    const message = clean(body.message, 3000);

    const rawItems: unknown = body.items;
    if (!contact_name || !isEmail(email)) {
      return NextResponse.json(
        { error: "Please fill in your name and a valid email." },
        { status: 400 }
      );
    }
    if (!Array.isArray(rawItems) || rawItems.length === 0) {
      return NextResponse.json({ error: "Please list at least one item you need." }, { status: 400 });
    }

    const items = rawItems
      .slice(0, 100)
      .map((i: RawLine) => ({
        name: clean(i?.name, 200),
        unit: clean(i?.unit, 40),
        quantity: Number(i?.quantity),
      }))
      .filter((i) => i.name && Number.isFinite(i.quantity) && i.quantity > 0 && i.quantity <= 1_000_000);

    if (items.length === 0) {
      return NextResponse.json({ error: "Please list at least one valid item and quantity." }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: inserted, error } = await supabase
      .from("quote_requests")
      .insert({
        company_name: company_name || null,
        contact_name,
        email,
        phone: phone || null,
        items,
        message: message || null,
        status: "new",
      })
      .select("id")
      .single();

    if (error) throw error;

    await notifyOwner(
      `New bulk quote request from ${contact_name}${company_name ? ` (${company_name})` : ""}`,
      "New bulk quote request",
      [
        ["Contact", contact_name],
        ["Company", company_name],
        ["Email", email],
        ["Phone", phone],
        ["Items", items.map((i) => `${i.quantity}${i.unit ? ` ${i.unit}` : ""} × ${i.name}`).join("; ")],
        ["Message", message],
      ],
      email,
      "/admin/messages",
      "Open quote requests in admin"
    );

    try {
      await sendQuoteRequestReceivedEmail({ contactName: contact_name, email, items });
    } catch (err) {
      console.error("Quote confirmation email error:", err);
    }

    return NextResponse.json({ ok: true, id: inserted?.id });
  } catch (err) {
    console.error("Quote request error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
