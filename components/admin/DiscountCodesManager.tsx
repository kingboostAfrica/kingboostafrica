"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { DiscountCode } from "@/lib/types";
import { Field, inputCls } from "@/components/admin/ui";
import DeleteButton from "@/components/admin/DeleteButton";

function toDateInput(v: string | null) {
  return v ? v.slice(0, 10) : "";
}

function CodeRow({ code, onChanged }: { code: DiscountCode; onChanged: () => void }) {
  const supabase = createClient();
  const [active, setActive] = useState(code.is_active);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function toggle() {
    setBusy(true);
    setError("");
    const { error: err } = await supabase.from("discount_codes").update({ is_active: !active }).eq("id", code.id);
    setBusy(false);
    if (err) return setError(err.message);
    setActive(!active);
    onChanged();
  }

  const expired = code.expires_at && new Date(code.expires_at) < new Date();
  const usedUp = code.max_uses != null && code.used_count >= code.max_uses;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-kb-forest/15 p-4">
      <div>
        <p className="flex items-center gap-2 font-mono text-base font-bold text-kb-forest">
          {code.code}
          {!active && <span className="rounded-full bg-kb-charcoal/10 px-2 py-0.5 text-[10px] font-sans font-semibold text-kb-charcoal/60">HIDDEN</span>}
          {expired && <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-sans font-semibold text-red-600">EXPIRED</span>}
          {usedUp && <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-sans font-semibold text-red-600">USED UP</span>}
        </p>
        <p className="text-sm text-kb-charcoal/60">
          {code.kind === "percent" ? `${code.amount}% off` : `₦${code.amount.toLocaleString()} off`}
          {code.min_subtotal > 0 ? ` · min order ₦${code.min_subtotal.toLocaleString()}` : ""}
          {code.max_uses != null ? ` · ${code.used_count}/${code.max_uses} used` : ` · used ${code.used_count} time${code.used_count === 1 ? "" : "s"}`}
        </p>
        {(code.starts_at || code.expires_at) && (
          <p className="text-xs text-kb-charcoal/50">
            {code.starts_at ? `From ${toDateInput(code.starts_at)}` : ""}
            {code.starts_at && code.expires_at ? " · " : ""}
            {code.expires_at ? `Until ${toDateInput(code.expires_at)}` : ""}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={toggle}
          disabled={busy}
          className="rounded-full border border-kb-forest/25 px-3 py-1.5 text-xs font-medium hover:bg-kb-mist disabled:opacity-50"
        >
          {active ? "Hide" : "Show"}
        </button>
        <DeleteButton table="discount_codes" id={code.id} confirmText={`Delete the code "${code.code}"? This cannot be undone.`} />
      </div>
      {error && <p className="w-full text-xs text-red-600">{error}</p>}
    </div>
  );
}

export default function DiscountCodesManager({ codes }: { codes: DiscountCode[] }) {
  const router = useRouter();
  const supabase = createClient();
  const [code, setCode] = useState("");
  const [kind, setKind] = useState<"percent" | "fixed">("percent");
  const [amount, setAmount] = useState("");
  const [minSubtotal, setMinSubtotal] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!code.trim() || !Number.isFinite(amt) || amt <= 0 || (kind === "percent" && amt > 100)) {
      setError("Enter a code and a valid amount (a percentage must be 100 or less).");
      return;
    }
    setSaving(true);
    setError("");
    const { error: err } = await supabase.from("discount_codes").insert({
      code: code.trim().toUpperCase(),
      kind,
      amount: amt,
      min_subtotal: parseFloat(minSubtotal || "0") || 0,
      max_uses: maxUses ? parseInt(maxUses, 10) : null,
      starts_at: startsAt || null,
      expires_at: expiresAt || null,
    });
    setSaving(false);
    if (err) {
      setError(err.code === "23505" ? "A code with that name already exists." : err.message);
      return;
    }
    setCode("");
    setAmount("");
    setMinSubtotal("");
    setMaxUses("");
    setStartsAt("");
    setExpiresAt("");
    router.refresh();
  }

  return (
    <div>
      {codes.length === 0 ? (
        <div className="rounded-xl border border-dashed border-kb-forest/25 py-16 text-center">
          <p className="text-kb-charcoal/60">No discount codes yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {codes.map((c) => (
            <CodeRow key={c.id} code={c} onChanged={() => router.refresh()} />
          ))}
        </div>
      )}

      <form onSubmit={add} className="mt-8 space-y-4 rounded-xl bg-kb-mist p-5">
        <h2 className="font-display text-lg font-bold text-kb-forest">Create a code</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Code (customers type this)">
            <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="WELCOME10" className={`${inputCls} uppercase`} />
          </Field>
          <Field label="Type">
            <select value={kind} onChange={(e) => setKind(e.target.value as "percent" | "fixed")} className={inputCls}>
              <option value="percent">Percentage off</option>
              <option value="fixed">Fixed amount off (₦)</option>
            </select>
          </Field>
          <Field label={kind === "percent" ? "Percent off (1–100)" : "Amount off (₦)"}>
            <input type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className={inputCls} />
          </Field>
          <Field label="Minimum order (₦, optional)">
            <input type="number" min="0" step="0.01" value={minSubtotal} onChange={(e) => setMinSubtotal(e.target.value)} className={inputCls} />
          </Field>
          <Field label="Maximum uses (optional)">
            <input type="number" min="1" step="1" value={maxUses} onChange={(e) => setMaxUses(e.target.value)} placeholder="Unlimited" className={inputCls} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Starts (optional)">
              <input type="date" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} className={inputCls} />
            </Field>
            <Field label="Expires (optional)">
              <input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} className={inputCls} />
            </Field>
          </div>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={saving} className="btn btn-primary disabled:opacity-60">
          {saving ? "Creating..." : "Create code"}
        </button>
      </form>
    </div>
  );
}
