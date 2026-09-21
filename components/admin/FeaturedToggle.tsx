"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { revalidateSite } from "@/lib/revalidate-client";

// Switches a gallery photo on/off in the homepage slider.
export default function FeaturedToggle({ id, featured }: { id: string; featured: boolean }) {
  const router = useRouter();
  const supabase = createClient();
  const [on, setOn] = useState(featured);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function toggle() {
    setBusy(true);
    setError("");
    const { error: err } = await supabase.from("gallery_items").update({ featured: !on }).eq("id", id);
    setBusy(false);
    if (err) return setError(err.message);
    setOn(!on);
    revalidateSite();
    router.refresh();
  }

  return (
    <div>
      <button
        type="button"
        onClick={toggle}
        disabled={busy}
        aria-pressed={on}
        className={`flex w-full items-center justify-center gap-1.5 rounded-lg border px-2 py-1.5 text-xs font-semibold transition-colors disabled:opacity-60 ${
          on
            ? "border-kb-gold bg-kb-gold/20 text-kb-forest"
            : "border-kb-forest/20 text-kb-charcoal/70 hover:bg-kb-mist"
        }`}
      >
        <Star size={13} className={on ? "fill-kb-gold text-kb-gold" : ""} aria-hidden="true" />
        {on ? "In homepage slider" : "Show in homepage slider"}
      </button>
      {error && <p className="mt-1 text-[11px] text-red-600">{error}</p>}
    </div>
  );
}
