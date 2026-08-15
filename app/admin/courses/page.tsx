import Link from "next/link";
import Image from "next/image";
import { requireAdmin } from "@/lib/admin";
import type { Course } from "@/lib/types";
import ToggleActiveButton from "@/components/ToggleActiveButton";

export default async function AdminCoursesPage() {
  const { supabase } = await requireAdmin();

  const { data: courses } = await supabase
    .from("courses")
    .select("*")
    .order("created_at", { ascending: false });

  const list = (courses as Course[] | null) || [];

  return (
    <div className="max-w-4xl mx-auto px-5 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/admin" className="text-sm text-kb-gold-dark hover:underline">
            ← Dashboard
          </Link>
          <h1 className="font-display text-3xl font-bold text-kb-charcoal mt-2">
            Academy Courses
          </h1>
        </div>
        <Link
          href="/admin/courses/new"
          className="text-sm font-medium px-5 py-2.5 bg-kb-green text-white rounded-full hover:bg-kb-green-dark transition-colors"
        >
          + New Course
        </Link>
      </div>

      {list.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-kb-green/30 rounded-2xl">
          <p className="text-kb-charcoal/60">No courses yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {list.map((course) => (
            <div
              key={course.id}
              className="flex items-center gap-4 p-4 border border-kb-green/15 rounded-2xl"
            >
              <div className="w-16 h-16 bg-kb-cream rounded-xl overflow-hidden relative shrink-0">
                {course.image_url && (
                  <Image src={course.image_url} alt={course.title} fill className="object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-kb-charcoal truncate">{course.title}</p>
                <p className="text-sm text-kb-green font-semibold">
                  ₦{course.price.toLocaleString()}
                </p>
                <p className="text-xs text-kb-charcoal/50">
                  {course.is_active ? "Active" : "Hidden"}
                </p>
              </div>
              <ToggleActiveButton table="courses" id={course.id} isActive={course.is_active} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
