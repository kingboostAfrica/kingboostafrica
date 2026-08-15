import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      service_id,
      full_name,
      email,
      phone,
      company,
      preferred_date,
      message,
    } = body as {
      service_id: string;
      full_name: string;
      email: string;
      phone?: string;
      company?: string;
      preferred_date?: string | null;
      message: string;
    };

    if (!service_id || !full_name || !email || !message) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
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

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Consulting booking error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
