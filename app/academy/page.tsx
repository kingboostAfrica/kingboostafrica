import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import type { Course } from "@/lib/types";
import { Clock } from "lucide-react";

export const metadata = { title: "Academy — KingBoostFarms" };

export default async function AcademyPage() {
  const supabase = await createClient();
  const { data: courses } = await supabase
    .from("courses")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  const list = (courses as Course[] | null) || [];

  return (
    <div className="max-w-6xl mx-auto px-5 py-16">
      <p className="text-xs font-semibold uppercase tracking-wider text-kb-gold-dark mb-3">
        Training & courses in agribusiness
      </p>
      <h1 className="font-display text-4xl font-bold text-kb-charcoal mb-4">
        Academy
      </h1>
      <p className="text-lg text-kb-charcoal/70 max-w-2xl mb-14">
        Practical courses that build skills across farming, food processing,
        and agribusiness management — taught by people who work the land.
      </p>

      {list.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {list.map((course) => (
            <Link
              key={course.id}
              href={`/academy/${course.slug}`}
              className="group block rounded-2xl overflow-hidden border border-kb-green/15 bg-white hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              <div className="aspect-video bg-kb-cream relative">
                {course.image_url ? (
                  <Image src={course.image_url} alt={course.title} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-kb-green/50 text-sm">
                    No image
                  </div>
                )}
              </div>
              <div className="p-5">
                <p className="font-display font-bold text-kb-charcoal group-hover:text-kb-green transition-colors">
                  {course.title}
                </p>
                {course.summary && (
                  <p className="text-sm text-kb-charcoal/60 mt-1 line-clamp-2">{course.summary}</p>
                )}
                <div className="flex items-center justify-between mt-4">
                  {course.duration && (
                    <span className="flex items-center gap-1 text-xs text-kb-charcoal/50">
                      <Clock size={12} /> {course.duration}
                    </span>
                  )}
                  <span className="text-kb-green font-semibold text-sm">
                    ₦{course.price.toLocaleString()}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 border border-dashed border-kb-green/30 rounded-2xl">
          <p className="text-kb-charcoal/60">No courses published yet. Check back soon.</p>
        </div>
      )}
    </div>
  );
}
