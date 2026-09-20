import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/session";

// Next.js 16 renamed the `middleware` file convention to `proxy`.
// It refreshes the admin's login cookie. Public pages do not need it, and skipping it
// lets them be served straight from the saved copy (fast).
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/reset-password"],
};
