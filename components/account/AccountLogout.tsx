"use client";

import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AccountLogout() {
  async function logout() {
    await createClient().auth.signOut();
    // Hard navigation so every page forgets the old login.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = "/";
  }
  return (
    <button type="button" onClick={logout} className="inline-flex items-center gap-2 text-sm font-semibold text-kb-charcoal/70 hover:text-kb-green">
      <LogOut size={16} aria-hidden="true" /> Log out
    </button>
  );
}
