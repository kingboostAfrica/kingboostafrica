"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// A small dropdown that updates the `status` column of any row.
export default function StatusSelect({
  table,
  id,
  value,
  options,
  confirmOn,
}: {
  table: string;
  id: string;
  value: string;
  options: string[];
  // Ask before setting this status, e.g. { value: "cancelled", message: "..." }
  confirmOn?: { value: string; message: string };
}) {
  const router = useRouter();
  const supabase = createClient();
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState(value);
  const [error, setError] = useState("");

  function handleChange(next: string) {
    if (next === status) return;
    if (confirmOn && next === confirmOn.value && !window.confirm(confirmOn.message)) return;
    setError("");
    startTransition(async () => {
      const { error: updError } = await supabase
        .from(table)
        .update({ status: next })
        .eq("id", id);
      if (updError) {
        setError(updError.message);
        return;
      }
      setStatus(next);
      router.refresh();
    });
  }

  return (
    <div>
      <select
        value={status}
        disabled={pending}
        onChange={(e) => handleChange(e.target.value)}
        className="text-xs font-medium border border-kb-green/30 rounded-full px-3 py-1.5 bg-white capitalize disabled:opacity-50"
      >
        {options.map((o) => (
          <option key={o} value={o} className="capitalize">
            {o}
          </option>
        ))}
      </select>
      {error && <p className="text-[11px] text-red-600 mt-1 max-w-48">{error}</p>}
    </div>
  );
}
