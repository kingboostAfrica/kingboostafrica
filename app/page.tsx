import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Leaf,
  ShieldCheck,
  Sprout,
  ShoppingCart,
  GraduationCap,
  Briefcase,
  Cpu,
} from "lucide-react";
import { getPageContent, pick } from "@/lib/content";
import { createPublicClient } from "@/lib/supabase/public";
import type { Product } from "@/lib/types";
import ProductCard from "@/components/ProductCard";
import { FieldArt, FieldLines } from "@/components/FieldArt";

// Served from a saved copy and rebuilt at most every 60 seconds (and instantly after admin edits).
export const revalidate = 60;

const verticalDefaults = [
  { key: "food-mart", slug: "food-mart", name: "Food Mart", desc: "Pure, natural, nutritious produce", icon: ShoppingCart },
  { key: "academy", slug: "academy", name: "Academy", desc: "Training & courses in agribusiness", icon: GraduationCap },
  { key: "consulting", slug: "consulting", name: "Consulting", desc: "Expert agribusiness advisory", icon: Briefcase },
  { key: "agritech", slug: "agritech", name: "Agritech", desc: "Technology for modern farming", icon: Cpu },
  { key: "organics", slug: "organics", name: "Organics", desc: "Certified organic solutions", icon: Leaf },
];

const trustDefaults = [
  { key: "trust-1", icon: "ShieldCheck", title: "Quality you can trust", body: "Every product and service meets our brand standard for quality and integrity." },
  { key: "trust-2", icon: "Sprout", title: "Sustainable by design", body: "Our farming and consulting practices are built for long-term agricultural health." },
  { key: "trust-3", icon: "Leaf", title: "Five verticals, one mission", body: "From the mart to the classroom to the field — we support agriculture at every stage." },
];

const trustIconMap = { ShieldCheck, Sprout, Leaf };

export default async function Home() {
  const supabase = createPublicClient();
  const [rows, { data: featured }] = await Promise.all([
    getPageContent("home"),
    supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .gt("stock", 0)
      .order("created_at", { ascending: false })
      .limit(4),
  ]);

  const hero = pick(rows, "hero", "main");
  const products = (featured as Product[] | null) ?? [];

  const [foodMart, ...others] = verticalDefaults;
  const vertical = (v: (typeof verticalDefaults)[number]) => {
    const row = pick(rows, "vertical", v.key);
    return { title: row?.title ?? v.name, body: row?.body ?? v.desc };
  };

  return (
    <div>
      {/* ───────── Hero ───────── */}
      <section className="relative overflow-hidden bg-kb-forest text-white">
        <div
          className="pointer-events-none absolute -left-32 -top-40 h-[34rem] w-[34rem] rounded-full bg-kb-forest-2 opacity-70 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 sm:py-20 lg:grid-cols-[1.15fr_0.85fr] lg:py-28">
          <div>
            <h1 className="text-4xl font-bold leading-[1.08] sm:text-5xl lg:text-[3.5rem]">
              {hero?.title ?? "Cultivating growth, nourishing nations."}
            </h1>
            <div className="mt-6 h-1 w-14 rounded-full bg-kb-gold" aria-hidden="true" />
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/75">
              {hero?.body ??
                "KingBoostFarms is a Nigerian agribusiness spanning food retail, education, consulting, technology, and organics — built to strengthen agriculture from farm to table."}
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Link href="/food-mart" className="btn btn-gold">
                Shop Food Mart <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <Link href="/about" className="btn btn-outline-light">
                About KingBoostFarms
              </Link>
            </div>
          </div>

          {/* Hero visual: uploaded photo if one is set in Site Content, else the field artwork */}
          <div className="relative mx-auto hidden aspect-[4/5] w-full max-w-md overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/15 lg:block">
            {hero?.image_url ? (
              <>
                <Image
                  src={hero.image_url}
                  alt=""
                  fill
                  priority
                  sizes="(min-width: 1024px) 28rem, 0px"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-kb-forest/60 via-transparent to-transparent" />
              </>
            ) : (
              <FieldArt className="absolute inset-0 h-full w-full" />
            )}
            <div className="absolute inset-x-5 bottom-5 rounded-lg bg-kb-forest/85 px-4 py-3 backdrop-blur">
              <p className="font-display text-base italic text-white">
                Cultivating Growth, Nourishing Nations
              </p>
            </div>
          </div>
        </div>
        <div className="h-1 bg-kb-gold" aria-hidden="true" />
      </section>

      {/* ───────── Verticals ───────── */}
      <section className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
        <div className="mb-10 max-w-2xl">
          <h2 className="text-3xl font-bold text-kb-forest sm:text-4xl">
            How we serve agriculture
          </h2>
          <p className="mt-3 text-lg text-kb-charcoal/70">
            Each part of KingBoostFarms supports a different stage of the agricultural value chain.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-3 lg:grid-rows-2">
          {/* Food Mart: the flagship, given more room */}
          {(() => {
            const v = vertical(foodMart);
            return (
              <Link
                href={`/${foodMart.slug}`}
                className="group relative flex flex-col justify-between overflow-hidden rounded-xl bg-kb-forest p-8 text-white lg:row-span-2"
              >
                <FieldLines className="pointer-events-none absolute inset-0 h-full w-full opacity-70" />
                <div className="relative">
                  <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-kb-gold text-kb-forest">
                    <foodMart.icon size={28} aria-hidden="true" />
                  </span>
                  <h3 className="mt-8 text-3xl font-bold">{v.title}</h3>
                  <p className="mt-3 max-w-xs text-white/75">{v.body}</p>
                </div>
                <span className="relative mt-12 inline-flex items-center gap-2 font-semibold text-kb-gold">
                  Shop now
                  <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </span>
              </Link>
            );
          })()}

          {others.map((o) => {
            const v = vertical(o);
            return (
              <Link
                key={o.slug}
                href={`/${o.slug}`}
                className="card group flex flex-col p-7 lg:col-span-1"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-kb-mist text-kb-green">
                  <o.icon size={24} aria-hidden="true" />
                </span>
                <h3 className="mt-5 text-xl font-bold text-kb-forest">{v.title}</h3>
                <p className="mt-2 flex-1 text-kb-charcoal/70">{v.body}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-kb-green">
                  Learn more
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ───────── Featured products (only when there are some) ───────── */}
      {products.length > 0 && (
        <section className="bg-kb-mist">
          <div className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
            <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold text-kb-forest sm:text-4xl">Fresh from the Food Mart</h2>
                <p className="mt-2 text-kb-charcoal/70">The latest produce and staples, ready to order.</p>
              </div>
              <Link href="/food-mart" className="btn btn-outline">
                View all products
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ───────── What we stand for ───────── */}
      <section className="mx-auto grid max-w-6xl gap-12 px-5 py-16 sm:py-24 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <h2 className="text-3xl font-bold text-kb-forest sm:text-4xl">What we stand for</h2>
          <p className="mt-4 max-w-md text-lg text-kb-charcoal/70">
            Growing value for farmers, families and businesses, without compromising the land that
            feeds us.
          </p>
        </div>
        <ul className="divide-y divide-kb-forest/10 border-y border-kb-forest/10">
          {trustDefaults.map((t) => {
            const row = pick(rows, "trust", t.key);
            const iconName = (row?.icon ?? t.icon) as keyof typeof trustIconMap;
            const Icon = trustIconMap[iconName] ?? Leaf;
            return (
              <li key={t.key} className="flex gap-5 py-7">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-kb-forest text-kb-gold">
                  <Icon size={24} aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-xl font-bold text-kb-forest">{row?.title ?? t.title}</h3>
                  <p className="mt-1.5 text-kb-charcoal/70">{row?.body ?? t.body}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {/* ───────── Closing call to action ───────── */}
      <section className="mx-auto max-w-6xl px-5 pb-20">
        <div className="relative overflow-hidden rounded-2xl bg-kb-forest px-8 py-14 text-white sm:px-14">
          <FieldLines className="pointer-events-none absolute inset-y-0 right-0 h-full w-full opacity-80 md:w-3/5" />
          <div className="relative max-w-xl">
            <h2 className="text-3xl font-bold sm:text-4xl">Talk to the KingBoostFarms team</h2>
            <p className="mt-4 text-lg text-white/75">
              Questions about produce, training or advisory? Send us a message and we will get back
              to you by email.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/contact" className="btn btn-gold">
                Contact us
              </Link>
              <Link href="/food-mart" className="btn btn-outline-light">
                Browse Food Mart
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
