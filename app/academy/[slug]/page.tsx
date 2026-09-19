import Image from "next/image";
import { notFound } from "next/navigation";
import { Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { Course } from "@/lib/types";
import EnrollForm from "@/components/EnrollForm";
import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("courses")
    .select("title, summary, image_url")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();
  if (!data) return {};
  const title = `${data.title} — KingBoostFarms Academy`;
  const description = data.summary ?? `Enroll in ${data.title} at KingBoostFarms Academy.`;
  const image = data.image_url;
  return {
    title,
    description,
    openGraph: { title, description, ...(image ? { images: [image] } : {}) },
  };
}


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
    <>
      <Breadcrumbs crumbs={[{ label: "Academy", href: "/academy" }, { label: c.title }]} />
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 lg:grid-cols-[1.2fr_1fr]">
      <div>
        <div className="aspect-video bg-kb-mist rounded-xl overflow-hidden relative mb-6">
          {c.image_url ? (
            <Image src={c.image_url} alt={c.title} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-kb-green/50">
              No image
            </div>
          )}
        </div>
        <h1 className="font-display text-3xl font-bold text-kb-forest sm:text-4xl">{c.title}</h1>
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

      <div className="card h-fit p-6 lg:sticky lg:top-28">
        <h2 className="font-display text-xl font-bold text-kb-forest mb-4">Enroll in this course</h2>
        <EnrollForm courseId={c.id} />
      </div>
      </div>
    </>
  );
}
