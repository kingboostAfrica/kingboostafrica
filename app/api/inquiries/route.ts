import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { InquirySource } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { source, full_name, email, phone, message } = body as {
      source: InquirySource;
      full_name: string;
      email: string;
      phone?: string;
      message: string;
    };

    if (!source || !full_name || !email || !message) {
      return NextResponse.json(
        { error: "Missing required fields." },
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

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Inquiry submission error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
