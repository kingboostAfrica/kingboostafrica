"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function DeleteButton({
  table,
  id,
  confirmText = "Delete this permanently? This cannot be undone.",
  inUseMessage = "In use elsewhere (e.g. it has orders). Hide it instead.",
}: {
  table: string;
  id: string;
  confirmText?: string;
  inUseMessage?: string;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleDelete() {
    if (!window.confirm(confirmText)) return;
    setError("");
    startTransition(async () => {
      const { error: delError } = await supabase.from(table).delete().eq("id", id);
      if (delError) {
        setError(
          delError.code === "23503" ? inUseMessage : delError.message
        );
        return;
      }
      router.refresh();
    });
  }

  return (
    <span className="inline-flex flex-col items-end">
      <button
        onClick={handleDelete}
        disabled={pending}
        className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full border border-red-200 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 whitespace-nowrap"
      >
        <Trash2 size={12} /> {pending ? "Deleting..." : "Delete"}
      </button>
      {error && <span className="text-[11px] text-red-600 mt-1 max-w-40 text-right">{error}</span>}
    </span>
  );
}
