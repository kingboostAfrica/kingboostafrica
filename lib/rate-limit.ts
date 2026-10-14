// Simple abuse protection for the public forms and checkout. SERVER ONLY.
//
// Counts requests per visitor (by IP address) inside a time window. When the database function
// `rate_limit_hit` exists (supabase/013_...sql) and SUPABASE_SERVICE_ROLE_KEY is set, the counts are
// shared across every server instance. If that is not available it falls back to a per-instance
// counter, which is weaker but still slows a single attacker down. It never blocks real customers
// because of a technical fault: on any error it lets the request through.
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const memory = new Map<string, { count: number; resetAt: number }>();

export function clientIp(request: Request): string {
  const h = request.headers;
  const ip =
    h.get("x-nf-client-connection-ip") || // Netlify's own, trustworthy header
    h.get("cf-connecting-ip") ||
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "unknown";
  return ip.slice(0, 64);
}

function memoryHit(key: string, max: number, windowSeconds: number): boolean {
  const now = Date.now();
  if (memory.size > 5000) {
    for (const [k, v] of memory) if (v.resetAt < now) memory.delete(k);
  }
  const entry = memory.get(key);
  if (!entry || entry.resetAt < now) {
    memory.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return true;
  }
  entry.count += 1;
  return entry.count <= max;
}

/** Returns true when the request is allowed, false when this visitor has made too many. */
export async function rateLimit(
  request: Request,
  name: string,
  max: number,
  windowSeconds: number
): Promise<boolean> {
  const key = `${name}:${clientIp(request)}`;

  try {
    const admin = createAdminClient();
    if (admin) {
      const { data, error } = await admin.rpc("rate_limit_hit", {
        p_key: key,
        p_max: max,
        p_window_seconds: windowSeconds,
      });
      if (!error && typeof data === "boolean") return data;
    }
  } catch {
    // fall through to the in-memory counter
  }
  return memoryHit(key, max, windowSeconds);
}

export function tooManyRequests() {
  return NextResponse.json(
    { error: "Too many attempts from your connection. Please wait a few minutes and try again." },
    { status: 429, headers: { "Retry-After": "300" } }
  );
}
