import Link from "next/link";
import {
  ArrowRight,
  Leaf,
  ShieldCheck,
  Sprout,
  ShoppingCart,
  GraduationCap,
  Briefcase,
  Cpu,
  ShoppingBasket,
  Truck,
} from "lucide-react";
import { getPageContent, pick } from "@/lib/content";
import { createPublicClient } from "@/lib/supabase/public";
import type { Category, ConsultingService, Course, Product } from "@/lib/types";
import ProductCard from "@/components/ProductCard";
import { getCheckoutOptions, getContactInfo, getDefaultLowStockThreshold, getUsdRate, getWhatsappNumber } from "@/lib/store-settings";
import { FieldArt, FieldLines } from "@/components/FieldArt";
import HeroSlider, { type Slide } from "@/components/HeroSlider";
import WhyChoose from "@/components/home/WhyChoose";
import ProcessSection from "@/components/home/ProcessSection";
import LearnAndAdvise from "@/components/home/LearnAndAdvise";
import HomeReviews, { type HomeReview } from "@/components/home/HomeReviews";
import FarmUpdates, { type FarmUpdate } from "@/components/home/FarmUpdates";
import QuickContactBar from "@/components/home/QuickContactBar";

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

// Up to this many photos play in the homepage slider (plus the main hero photo). Raise it if you
// want more of the gallery to show, but a very long slider gets slow and tedious to click through.
const MAX_GALLERY_SLIDES = 20;

async function loadGallerySlides(): Promise<Slide[]> {
  const db = createPublicClient();
  const toSlide = (r: { image_url: string; caption: string | null }): Slide => ({
    src: r.image_url,
    alt: r.caption || "KingBoostFarms photo",
    caption: r.caption,
  });
  // Every gallery photo goes in, with photos ticked "Show in homepage slider" first, then the rest
  // by newest first — so the slider isn't limited to only the ones you happened to feature.
  const [featured, rest] = await Promise.all([
    db
      .from("gallery_items")
      .select("image_url, caption")
      .eq("featured", true)
      .order("created_at", { ascending: false })
      .limit(MAX_GALLERY_SLIDES),
    db
      .from("gallery_items")
      .select("image_url, caption")
      .eq("featured", false)
      .order("created_at", { ascending: false })
      .limit(MAX_GALLERY_SLIDES),
  ]);
  const combined = [...(featured.data ?? []), ...(rest.data ?? [])].slice(0, MAX_GALLERY_SLIDES);
  return combined.map(toSlide);
}

// Best sellers when customers have bought enough, otherwise the newest products. Never throws:
// if the database pieces from supabase/014 are not installed yet, it simply shows the newest.
async function loadShopProducts(): Promise<{ products: Product[]; bestSellers: boolean }> {
  const db = createPublicClient();
  const newest = async () => {
    const { data } = await db
      .from("products")
      .select("*")
      .eq("is_active", true)
      .gt("stock", 0)
      .order("created_at", { ascending: false })
      .limit(8);
    return (data as Product[] | null) ?? [];
  };

  try {
    const { data: ranked } = await db.from("top_selling_products").select("product_id, rank").order("rank").limit(8);
    const ids = (ranked ?? []).map((r: { product_id: string }) => r.product_id);
    if (ids.length >= 4) {
      const { data } = await db.from("products").select("*").in("id", ids).eq("is_active", true).gt("stock", 0);
      const byId = new Map(((data as Product[] | null) ?? []).map((p) => [p.id, p]));
      const ordered = ids.map((id: string) => byId.get(id)).filter((p): p is Product => Boolean(p));
      if (ordered.length >= 4) return { products: ordered, bestSellers: true };
    }
  } catch {
    // fall through to the newest products
  }
  return { products: await newest(), bestSellers: false };
}

async function loadHomeReviews(): Promise<HomeReview[]> {
  try {
    const db = createPublicClient();
    const { data } = await db
      .from("public_reviews")
      .select("id, product_id, reviewer_name, rating, title, body")
      .gte("rating", 4)
      .order("created_at", { ascending: false })
      .limit(3);
    const rows = (data ?? []) as { id: string; product_id: string; reviewer_name: string; rating: number; title: string | null; body: string | null }[];
    if (rows.length === 0) return [];
    const { data: prods } = await db.from("products").select("id, name, slug").in("id", rows.map((r) => r.product_id));
    const byId = new Map(((prods ?? []) as { id: string; name: string; slug: string }[]).map((p) => [p.id, p]));
    return rows.map((r) => ({
      id: r.id,
      reviewer_name: r.reviewer_name,
      rating: r.rating,
      title: r.title,
      body: r.body,
      product: byId.get(r.product_id) ? { name: byId.get(r.product_id)!.name, slug: byId.get(r.product_id)!.slug } : null,
    }));
  } catch {
    return [];
  }
}

async function loadFarmUpdates(): Promise<FarmUpdate[]> {
  try {
    const { data } = await createPublicClient()
      .from("farm_updates")
      .select("id, title, body, image_url, published_at")
      .eq("is_published", true)
      .order("published_at", { ascending: false })
      .limit(3);
    return (data as FarmUpdate[] | null) ?? [];
  } catch {
    return [];
  }
}

export default async function Home() {
  const supabase = createPublicClient();
  const [
    rows,
    shop,
    gallerySlides,
    lowStockDefault,
    usdRate,
    { data: categoryRows },
    { data: courseRows },
    { data: serviceRows },
    homeReviews,
    farmUpdates,
    checkout,
    whatsapp,
    contact,
  ] = await Promise.all([
    getPageContent("home"),
    loadShopProducts(),
    loadGallerySlides(),
    getDefaultLowStockThreshold(),
    getUsdRate(),
    supabase.from("categories").select("*").in("type", ["product", "both"]).order("name").limit(10),
    supabase.from("courses").select("*").eq("is_active", true).order("created_at", { ascending: false }).limit(2),
    supabase.from("consulting_services").select("*").eq("is_active", true).order("created_at", { ascending: false }).limit(2),
    loadHomeReviews(),
    loadFarmUpdates(),
    getCheckoutOptions(),
    getWhatsappNumber(),
    getContactInfo(),
  ]);
  const categories = (categoryRows as Category[] | null) ?? [];
  const courses = (courseRows as Course[] | null) ?? [];
  const services = (serviceRows as ConsultingService[] | null) ?? [];

  const hero = pick(rows, "hero", "main");
  const products = shop.products;

  // Slides: the hero photo from Site Content first, then the gallery photos marked for the slider
  // (or, until any are marked, the latest ones). No duplicates, at most six.
  const slides: Slide[] = [
    ...(hero?.image_url ? [{ src: hero.image_url, alt: "KingBoostFarms" }] : []),
    ...gallerySlides,
  ]
    .filter((sl, i, all) => all.findIndex((o) => o.src === sl.src) === i)
    .slice(0, MAX_GALLERY_SLIDES + 1); // +1 for the hero photo

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
        <FieldLines className="pointer-events-none absolute inset-y-0 right-0 h-full w-full opacity-70 lg:w-3/5" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 py-12 sm:py-16 lg:grid-cols-2 lg:gap-14 lg:py-20">
          <div>
            <h1 className="text-4xl font-bold leading-[1.08] sm:text-5xl lg:text-[3.5rem]">
              {hero?.title ?? "Cultivating growth, nourishing nations."}
            </h1>
            <div className="mt-6 h-1 w-14 rounded-full bg-kb-gold" aria-hidden="true" />
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/75">
              {hero?.body ??
                "KingBoostFarms is a Nigerian agribusiness spanning food retail, education, consulting, technology, and organics — built to strengthen agriculture from farm to table."}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/food-mart" className="btn btn-gold">
                Shop Food Mart <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <Link href="/about" className="btn btn-outline-light">
                About KingBoostFarms
              </Link>
            </div>

            <div className="mt-10">
              <p className="mb-3 text-sm font-semibold text-white/60">Explore what we do</p>
              <ul className="flex flex-wrap gap-2">
                {verticalDefaults.map((v) => (
                  <li key={v.slug}>
                    <Link
                      href={`/${v.slug}`}
                      className="inline-flex items-center rounded-full border border-white/25 px-3 py-1.5 text-sm font-medium text-white/90 transition-colors hover:border-kb-gold hover:bg-kb-gold hover:text-kb-forest"
                    >
                      {v.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Hero visual: the photo set in Site Content, or the field artwork until one is uploaded */}
          <div className="relative mx-auto w-full max-w-sm sm:max-w-md lg:max-w-lg">
            <div
              className="absolute -bottom-4 -right-4 hidden h-full w-full rounded-2xl border-2 border-kb-gold/60 sm:block"
              aria-hidden="true"
            />
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/15">
              {slides.length > 0 ? (
                <HeroSlider slides={slides} />
              ) : (
                <>
                  <FieldArt className="absolute inset-0 h-full w-full" />
                  <div className="absolute inset-x-5 bottom-5 rounded-lg bg-kb-forest/85 px-4 py-3 backdrop-blur">
                    <p className="font-display text-base italic text-white">
                      Cultivating Growth, Nourishing Nations
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Benefits strip */}
        <div className="relative border-t border-white/10 bg-kb-forest-2/70">
          <ul className="mx-auto grid max-w-6xl gap-x-8 gap-y-6 px-5 py-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: ShoppingBasket, title: "Fresh, natural produce", text: "Pure, nutritious food you can order online." },
              { icon: ShieldCheck, title: "Secure payment", text: "Pay online with Paystack, or on delivery." },
              { icon: Truck, title: "Delivery or pickup", text: "We deliver to your area, or you collect it where offered." },
              { icon: GraduationCap, title: "Learn and grow", text: "Courses and expert advice for farms and agribusinesses." },
            ].map((b) => (
              <li key={b.title} className="flex gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-kb-gold/15 text-kb-gold">
                  <b.icon size={22} aria-hidden="true" />
                </span>
                <span>
                  <span className="block font-semibold text-white">{b.title}</span>
                  <span className="mt-0.5 block text-sm leading-snug text-white/65">{b.text}</span>
                </span>
              </li>
            ))}
          </ul>
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

      {/* ───────── Shop: best sellers, or the newest products ───────── */}
      {products.length > 0 && (
        <section aria-labelledby="shop-heading" className="bg-kb-mist">
          <div className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 id="shop-heading" className="text-3xl font-bold text-kb-forest sm:text-4xl">
                  {shop.bestSellers ? "Our best sellers" : "Fresh from the Food Mart"}
                </h2>
                <p className="mt-2 text-kb-charcoal/70">
                  {shop.bestSellers ? "The products our customers order most." : "The latest produce and staples, ready to order."}
                </p>
              </div>
              <Link href="/food-mart" className="btn btn-outline">
                View all products
              </Link>
            </div>
            {categories.length > 0 && (
              <ul className="mb-8 flex flex-wrap gap-2" aria-label="Shop by category">
                {categories.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`/food-mart/${c.slug}`}
                      className="inline-flex rounded-full border border-kb-forest/20 bg-white px-3.5 py-1.5 text-sm font-medium text-kb-charcoal transition-colors hover:border-kb-green hover:text-kb-green"
                    >
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} lowStockDefault={lowStockDefault} usdRate={usdRate} showAdd />
              ))}
            </div>
          </div>
        </section>
      )}

      <WhyChoose rows={rows} />
      <ProcessSection rows={rows} />
      <LearnAndAdvise courses={courses} services={services} />
      <HomeReviews reviews={homeReviews} />
      <FarmUpdates updates={farmUpdates} />
      <QuickContactBar
        whatsapp={whatsapp}
        phone={contact.phone}
        zones={checkout.zones.map((z) => z.name)}
        pickupEnabled={checkout.pickup.enabled}
      />

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
