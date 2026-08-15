"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ToggleActiveButton({
  table,
  id,
  isActive,
}: {
  table: string;
  id: string;
  isActive: boolean;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [pending, startTransition] = useTransition();
  const [active, setActive] = useState(isActive);

  function handleToggle() {
    startTransition(async () => {
      const { error } = await supabase
        .from(table)
        .update({ is_active: !active })
        .eq("id", id);

      if (!error) {
        setActive(!active);
        router.refresh();
      }
    });
  }

  return (
    <button
      onClick={handleToggle}
      disabled={pending}
      className="text-xs font-medium px-3 py-1.5 rounded-full border border-kb-green/30 text-kb-charcoal hover:bg-kb-green/10 transition-colors disabled:opacity-50 whitespace-nowrap"
    >
      {active ? "Hide" : "Show"}
    </button>
  );
}
