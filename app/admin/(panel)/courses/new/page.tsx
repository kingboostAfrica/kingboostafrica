import { requireAdmin } from "@/lib/admin";
import CourseForm from "@/components/admin/CourseForm";

export default async function NewCoursePage() {
  await requireAdmin();
  return (
    <div className="max-w-xl mx-auto px-5 py-12">
      <h1 className="font-display text-3xl font-bold text-kb-charcoal mb-8">New Course</h1>
      <CourseForm />
    </div>
  );
}
