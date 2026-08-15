import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Enrollment, ConsultingBooking, Inquiry } from "@/lib/types";
import { GraduationCap, Briefcase, Mail } from "lucide-react";

export default async function AdminMessagesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  const [{ data: enrollments }, { data: bookings }, { data: inquiries }] = await Promise.all([
    supabase
      .from("enrollments")
      .select("*, course:courses(title)")
      .order("created_at", { ascending: false }),
    supabase
      .from("consulting_bookings")
      .select("*, service:consulting_services(title)")
      .order("created_at", { ascending: false }),
    supabase.from("inquiries").select("*").order("created_at", { ascending: false }),
  ]);

  const enrollList = (enrollments as Enrollment[] | null) || [];
  const bookingList = (bookings as ConsultingBooking[] | null) || [];
  const inquiryList = (inquiries as Inquiry[] | null) || [];

  return (
    <div className="max-w-4xl mx-auto px-5 py-12">
      <Link href="/admin" className="text-sm text-kb-gold-dark hover:underline">
        ← Dashboard
      </Link>
      <h1 className="font-display text-3xl font-bold text-kb-charcoal mt-2 mb-10">
        Messages
      </h1>

      <section className="mb-12">
        <h2 className="flex items-center gap-2 font-display text-lg font-bold text-kb-charcoal mb-4">
          <GraduationCap size={20} className="text-kb-green" /> Academy Enrollments
        </h2>
        {enrollList.length === 0 ? (
          <p className="text-sm text-kb-charcoal/50">No enrollments yet.</p>
        ) : (
          <div className="space-y-3">
            {enrollList.map((e) => (
              <div key={e.id} className="p-4 border border-kb-green/15 rounded-xl">
                <p className="font-medium text-kb-charcoal">
                  {e.full_name} <span className="text-kb-charcoal/40 font-normal">— {e.course?.title}</span>
                </p>
                <p className="text-sm text-kb-charcoal/60">{e.email} {e.phone ? `· ${e.phone}` : ""}</p>
                <p className="text-xs text-kb-charcoal/40 mt-1">{new Date(e.created_at).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mb-12">
        <h2 className="flex items-center gap-2 font-display text-lg font-bold text-kb-charcoal mb-4">
          <Briefcase size={20} className="text-kb-green" /> Consulting Bookings
        </h2>
        {bookingList.length === 0 ? (
          <p className="text-sm text-kb-charcoal/50">No bookings yet.</p>
        ) : (
          <div className="space-y-3">
            {bookingList.map((b) => (
              <div key={b.id} className="p-4 border border-kb-green/15 rounded-xl">
                <p className="font-medium text-kb-charcoal">
                  {b.full_name} <span className="text-kb-charcoal/40 font-normal">— {b.service?.title}</span>
                </p>
                <p className="text-sm text-kb-charcoal/60">{b.email} {b.phone ? `· ${b.phone}` : ""}</p>
                {b.message && <p className="text-sm text-kb-charcoal/70 mt-1">{b.message}</p>}
                <p className="text-xs text-kb-charcoal/40 mt-1">{new Date(b.created_at).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="flex items-center gap-2 font-display text-lg font-bold text-kb-charcoal mb-4">
          <Mail size={20} className="text-kb-green" /> Inquiries (Contact, Agritech, Organics)
        </h2>
        {inquiryList.length === 0 ? (
          <p className="text-sm text-kb-charcoal/50">No inquiries yet.</p>
        ) : (
          <div className="space-y-3">
            {inquiryList.map((i) => (
              <div key={i.id} className="p-4 border border-kb-green/15 rounded-xl">
                <p className="font-medium text-kb-charcoal flex items-center gap-2">
                  {i.full_name}
                  <span className="text-[10px] uppercase font-semibold text-kb-gold-dark bg-kb-gold/10 px-2 py-0.5 rounded-full">
                    {i.source}
                  </span>
                </p>
                <p className="text-sm text-kb-charcoal/60">{i.email} {i.phone ? `· ${i.phone}` : ""}</p>
                <p className="text-sm text-kb-charcoal/70 mt-1">{i.message}</p>
                <p className="text-xs text-kb-charcoal/40 mt-1">{new Date(i.created_at).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
