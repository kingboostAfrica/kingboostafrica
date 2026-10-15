import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import type { ConsultingService, Course } from "@/lib/types";

function Thumb({ src, alt }: { src: string | null; alt: string }) {
  return (
    <div className="relative aspect-video bg-kb-mist">
      {src ? (
        <Image src={src} alt={alt} fill sizes="(min-width: 1024px) 20vw, 50vw" className="object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-sm text-kb-green/50">No image</div>
      )}
    </div>
  );
}

// Shows nothing when there are no published courses or services yet.
export default function LearnAndAdvise({ courses, services }: { courses: Course[]; services: ConsultingService[] }) {
  if (courses.length === 0 && services.length === 0) return null;
  return (
    <section aria-labelledby="learn-heading" className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
      <div className="mb-10 max-w-2xl">
        <h2 id="learn-heading" className="text-3xl font-bold text-kb-forest sm:text-4xl">Learn and get expert advice</h2>
        <p className="mt-3 text-lg text-kb-charcoal/70">Courses for people starting out, and advisory for farms and agribusinesses ready to grow.</p>
      </div>

      <div className="grid gap-12 lg:grid-cols-2">
        {courses.length > 0 && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-kb-forest">Academy courses</h3>
              <Link href="/academy" className="inline-flex items-center gap-1 text-sm font-semibold text-kb-green hover:underline">
                All courses <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </div>
            <ul className="grid gap-4 sm:grid-cols-2">
              {courses.map((c) => (
                <li key={c.id}>
                  <Link href={`/academy/${c.slug}`} className="card group block h-full">
                    <Thumb src={c.image_url} alt={c.title} />
                    <div className="p-4">
                      <p className="font-display font-bold text-kb-forest group-hover:text-kb-green">{c.title}</p>
                      <div className="mt-2 flex items-center justify-between text-sm">
                        {c.duration ? (
                          <span className="flex items-center gap-1 text-xs text-kb-charcoal/50"><Clock size={12} aria-hidden="true" /> {c.duration}</span>
                        ) : <span />}
                        <span className="font-semibold text-kb-green">₦{c.price.toLocaleString()}</span>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {services.length > 0 && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-kb-forest">Consulting services</h3>
              <Link href="/consulting" className="inline-flex items-center gap-1 text-sm font-semibold text-kb-green hover:underline">
                All services <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </div>
            <ul className="grid gap-4 sm:grid-cols-2">
              {services.map((s) => (
                <li key={s.id}>
                  <Link href={`/consulting/${s.slug}`} className="card group block h-full">
                    <Thumb src={s.image_url} alt={s.title} />
                    <div className="p-4">
                      <p className="font-display font-bold text-kb-forest group-hover:text-kb-green">{s.title}</p>
                      {s.summary && <p className="mt-1 line-clamp-2 text-sm text-kb-charcoal/60">{s.summary}</p>}
                      {s.price_from != null && (
                        <p className="mt-2 text-sm font-semibold text-kb-green">From ₦{Number(s.price_from).toLocaleString()}</p>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
