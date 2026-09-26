import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { clean, isEmail, looksLikeBot } from "@/lib/validation";
import { notifyOwner } from "@/lib/email";
import { sendEnrollmentReceivedEmail } from "@/lib/order-emails";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (looksLikeBot(body)) return NextResponse.json({ ok: true });

    const course_id = clean(body.course_id, 64);
    const full_name = clean(body.full_name, 200);
    const email = clean(body.email, 320);
    const phone = clean(body.phone, 40);

    if (!course_id || !full_name || !isEmail(email)) {
      return NextResponse.json(
        { error: "Please fill in your name and a valid email." },
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

    const { data: course } = await supabase
      .from("courses")
      .select("title")
      .eq("id", course_id)
      .maybeSingle();
    await notifyOwner(
      `New course enrollment: ${course?.title ?? "Academy"} (${full_name})`,
      "New course enrollment",
      [["Course", course?.title], ["Name", full_name], ["Email", email], ["Phone", phone]],
      email,
      "/admin/messages",
      "Open sign-ups in admin"
    );
    try {
      await sendEnrollmentReceivedEmail({ name: full_name, email, courseTitle: course?.title ?? "your course" });
    } catch (err) {
      console.error("Enrollment confirmation email error:", err);
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Enrollment error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
