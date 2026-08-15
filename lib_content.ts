// Adjust this import if your Supabase server client lives at a different path.
import { createClient } from "@/lib/supabase/server";

export type ContentRow = {
  id: string;
  page: string;
  section: string;
  key: string;
  sort_order: number;
  title: string | null;
  body: string | null;
  icon: string | null;
  image_url: string | null;
};

export async function getPageContent(page: string): Promise<ContentRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("page_content")
    .select("*")
    .eq("page", page)
    .order("section", { ascending: true })
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("getPageContent error:", error.message);
    return [];
  }
  return (data ?? []) as ContentRow[];
}

export function pick(
  rows: ContentRow[],
  section: string,
  key: string
): ContentRow | undefined {
  return rows.find((r) => r.section === section && r.key === key);
}
