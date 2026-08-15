import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { course_id, full_name, email, phone } = body as {
      course_id: string;
      full_name: string;
      email: string;
      phone?: string;
    };

    if (!course_id || !full_name || !email) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { error } = await supabase.from("enrollments").insert({
      course_id,
      full_name,
      email,
      phone: phone || null,
      status: "pending",
    });

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Enrollment error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
