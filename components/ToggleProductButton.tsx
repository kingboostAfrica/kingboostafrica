"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ToggleProductButton({
  productId,
  isActive,
}: {
  productId: string;
  isActive: boolean;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [pending, startTransition] = useTransition();
  const [active, setActive] = useState(isActive);

  function handleToggle() {
    startTransition(async () => {
      const { error } = await supabase
        .from("products")
        .update({ is_active: !active })
        .eq("id", productId);

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
      className="text-xs font-medium px-3 py-1.5 rounded-full border border-sage text-ink hover:bg-sage-light transition-colors disabled:opacity-50 whitespace-nowrap"
    >
      {active ? "Hide" : "Show"}
    </button>
  );
}
