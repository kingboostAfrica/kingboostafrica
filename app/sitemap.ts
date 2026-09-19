import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { SITE_URL } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

  const [{ data: products }, { data: courses }, { data: services }] = await Promise.all([
    supabase.from("products").select("slug, updated_at").eq("is_active", true),
    supabase.from("courses").select("slug, updated_at").eq("is_active", true),
    supabase.from("consulting_services").select("slug, updated_at").eq("is_active", true),
  ]);

  const staticPaths = [
    "",
    "/food-mart",
    "/academy",
    "/consulting",
    "/agritech",
    "/organics",
    "/gallery",
    "/about",
    "/contact",
    "/privacy-policy",
    "/disclaimer",
  ];

  const entries = (
    rows: { slug: string; updated_at: string }[] | null,
    prefix: string
  ): MetadataRoute.Sitemap =>
    (rows ?? []).map((r) => ({
      url: `${SITE_URL}${prefix}/${r.slug}`,
      lastModified: new Date(r.updated_at),
    }));

  return [
    ...staticPaths.map((p) => ({ url: `${SITE_URL}${p}` })),
    ...entries(products, "/products"),
    ...entries(courses, "/academy"),
    ...entries(services, "/consulting"),
  ];
}
