// Supabase client that bypasses Row Level Security. SERVER ONLY.
// It needs SUPABASE_SERVICE_ROLE_KEY (Supabase > Project Settings > API > service_role).
// Never give this key a NEXT_PUBLIC_ name and never import this file in a client component.
import { createClient } from "@supabase/supabase-js";

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
