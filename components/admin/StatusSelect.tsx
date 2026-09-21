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
  endpoint,
}: {
  table: string;
  id: string;
  value: string;
  options: string[];
  // Ask before setting this status, e.g. { value: "cancelled", message: "..." }
  confirmOn?: { value: string; message: string } | { value: string; message: string }[];
  // When set, the change goes through this server endpoint (which can also send emails)
  endpoint?: string;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState(value);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");

  function handleChange(next: string) {
    if (next === status) return;
    const rules = confirmOn ? (Array.isArray(confirmOn) ? confirmOn : [confirmOn]) : [];
    const rule = rules.find((r) => r.value === next);
    if (rule && !window.confirm(rule.message)) return;
    setError("");
    setNote("");
    startTransition(async () => {
      if (endpoint) {
        try {
          const res = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderId: id, status: next }),
          });
          const json = await res.json().catch(() => ({}));
          if (!res.ok) {
            setError(json.error ?? "Could not update the order.");
            return;
          }
          if (json.emailed) setNote("Customer notified by email.");
        } catch {
          setError("Could not reach the server.");
          return;
        }
        setStatus(next);
        router.refresh();
        return;
      }

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
      {note && <p className="text-[11px] text-kb-green mt-1 max-w-48">{note}</p>}
    </div>
  );
}
