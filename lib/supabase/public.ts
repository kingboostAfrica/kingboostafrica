// Read-only Supabase client for PUBLIC pages (shop, courses, gallery, ...).
// It does not touch cookies, so Next.js can build these pages once and serve the saved copy
// to every visitor (see the `revalidate` setting at the top of each page).
// Row Level Security still applies: it can only read what the public is allowed to see.
import { createClient } from "@supabase/supabase-js";

export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } }
  );
}
