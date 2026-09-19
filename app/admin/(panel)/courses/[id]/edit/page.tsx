import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import type { Course } from "@/lib/types";
import CourseForm from "@/components/admin/CourseForm";

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const { data: course } = await supabase.from("courses").select("*").eq("id", id).maybeSingle();
  if (!course) notFound();

  return (
    <div className="max-w-xl mx-auto px-5 py-12">
      <h1 className="font-display text-3xl font-bold text-kb-charcoal mb-8">Edit Course</h1>
      <CourseForm initial={course as Course} />
    </div>
  );
}
