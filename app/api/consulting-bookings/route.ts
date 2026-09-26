import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { clean, isEmail, looksLikeBot } from "@/lib/validation";
import { notifyOwner } from "@/lib/email";
import { sendBookingReceivedEmail } from "@/lib/order-emails";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (looksLikeBot(body)) return NextResponse.json({ ok: true });

    const service_id = clean(body.service_id, 64);
    const full_name = clean(body.full_name, 200);
    const email = clean(body.email, 320);
    const phone = clean(body.phone, 40);
    const company = clean(body.company, 200);
    const preferred_date = clean(body.preferred_date, 10);
    const message = clean(body.message, 5000);

    if (!service_id || !full_name || !isEmail(email) || !message) {
      return NextResponse.json(
        { error: "Please fill in your name, a valid email and a message." },
        { status: 400 }
      );
    }
    if (preferred_date && !/^\d{4}-\d{2}-\d{2}$/.test(preferred_date)) {
      return NextResponse.json({ error: "Invalid date." }, { status: 400 });
    }

    const supabase = await createClient();
    const { error } = await supabase.from("consulting_bookings").insert({
      service_id,
      full_name,
      email,
      phone: phone || null,
      company: company || null,
      preferred_date: preferred_date || null,
      message,
      status: "pending",
    });

    if (error) throw error;

    const { data: service } = await supabase
      .from("consulting_services")
      .select("title")
      .eq("id", service_id)
      .maybeSingle();
    await notifyOwner(
      `New consulting request: ${service?.title ?? "Consulting"} (${full_name})`,
      "New consulting request",
      [
        ["Service", service?.title],
        ["Name", full_name],
        ["Company", company],
        ["Email", email],
        ["Phone", phone],
        ["Preferred date", preferred_date],
        ["Message", message],
      ],
      email,
      "/admin/messages",
      "Open requests in admin"
    );
    try {
      await sendBookingReceivedEmail({ name: full_name, email, serviceTitle: service?.title ?? "your request" });
    } catch (err) {
      console.error("Booking confirmation email error:", err);
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Consulting booking error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
