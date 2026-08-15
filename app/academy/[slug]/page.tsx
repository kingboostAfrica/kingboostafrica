import Image from "next/image";
import { notFound } from "next/navigation";
import { Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { Course } from "@/lib/types";
import EnrollForm from "@/components/EnrollForm";

export default async function CoursePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: course } = await supabase
    .from("courses")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!course) notFound();

  const c = course as Course;

  return (
    <div className="max-w-5xl mx-auto px-5 py-12 grid sm:grid-cols-2 gap-10">
      <div>
        <div className="aspect-video bg-kb-cream rounded-2xl overflow-hidden relative mb-6">
          {c.image_url ? (
            <Image src={c.image_url} alt={c.title} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-kb-green/50">
              No image
            </div>
          )}
        </div>
        <h1 className="font-display text-3xl font-bold text-kb-charcoal">{c.title}</h1>
        <div className="flex items-center gap-4 mt-3">
          <span className="text-2xl font-semibold text-kb-green">₦{c.price.toLocaleString()}</span>
          {c.duration && (
            <span className="flex items-center gap-1 text-sm text-kb-charcoal/50">
              <Clock size={14} /> {c.duration}
            </span>
          )}
        </div>
        {c.description && (
          <p className="text-kb-charcoal/70 mt-6 leading-relaxed">{c.description}</p>
        )}
      </div>

      <div className="p-6 border border-kb-green/15 rounded-2xl h-fit">
        <h2 className="font-display text-lg font-bold text-kb-charcoal mb-4">Enroll in this course</h2>
        <EnrollForm courseId={c.id} />
      </div>
    </div>
  );
}
