"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Field, inputCls } from "@/components/admin/ui";

export type ZoneRow = { id: string; name: string; fee: number; is_active: boolean };

function ZoneItem({ zone, onChanged }: { zone: ZoneRow; onChanged: () => void }) {
  const supabase = createClient();
  const [name, setName] = useState(zone.name);
  const [fee, setFee] = useState(String(zone.fee));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const feeNum = parseFloat(fee);
  const changed = name.trim() !== zone.name || feeNum !== zone.fee;

  async function save(patch: Partial<ZoneRow>) {
    setBusy(true);
    setError("");
    const { error: err } = await supabase.from("delivery_zones").update(patch).eq("id", zone.id);
    setBusy(false);
    if (err) return setError(err.message);
    onChanged();
  }

  async function remove() {
    if (!window.confirm(`Delete the delivery area "${zone.name}"? Past orders keep their fee.`)) return;
    setBusy(true);
    const { error: err } = await supabase.from("delivery_zones").delete().eq("id", zone.id);
    setBusy(false);
    if (err) return setError(err.message);
    onChanged();
  }

  return (
    <div className="rounded-xl border border-kb-forest/15 p-4">
      <div className="grid gap-3 sm:grid-cols-[1fr_9rem_auto] sm:items-end">
        <Field label="Area">
          <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
        </Field>
        <Field label="Fee (₦)">
          <input
            type="number"
            min="0"
            step="0.01"
            value={fee}
            onChange={(e) => setFee(e.target.value)}
            className={inputCls}
          />
        </Field>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={busy || !changed || !name.trim() || !Number.isFinite(feeNum) || feeNum < 0}
            onClick={() => save({ name: name.trim(), fee: feeNum })}
            className="btn btn-primary !px-4 !py-2 text-sm disabled:opacity-40"
          >
            Save
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => save({ is_active: !zone.is_active })}
            className="rounded-full border border-kb-forest/25 px-3 py-2 text-xs font-medium hover:bg-kb-mist disabled:opacity-50"
          >
            {zone.is_active ? "Hide" : "Show"}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={remove}
            className="rounded-full border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      </div>
      {!zone.is_active && (
        <p className="mt-2 text-xs text-kb-gold-dark">Hidden: customers cannot choose this area.</p>
      )}
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export default function DeliveryZonesManager({ zones }: { zones: ZoneRow[] }) {
  const router = useRouter();
  const supabase = createClient();
  const [name, setName] = useState("");
  const [fee, setFee] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  const refresh = () => router.refresh();
  const activeCount = zones.filter((z) => z.is_active).length;

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const feeNum = parseFloat(fee);
    if (!name.trim() || !Number.isFinite(feeNum) || feeNum < 0) {
      setError("Enter an area name and a fee of 0 or more.");
      return;
    }
    setAdding(true);
    setError("");
    const { error: err } = await supabase.from("delivery_zones").insert({ name: name.trim(), fee: feeNum });
    setAdding(false);
    if (err) return setError(err.message);
    setName("");
    setFee("");
    refresh();
  }

  return (
    <section>
      <h2 className="font-display text-xl font-bold text-kb-forest mb-1">Delivery areas and fees</h2>
      <p className="text-sm text-kb-charcoal/60 mb-4">
        Set a fee for each area you deliver to (for example by town or distance). Customers choose their
        area at checkout and pay that fee.
      </p>

      {activeCount === 0 && (
        <p className="mb-4 rounded-lg border border-kb-gold/40 bg-kb-gold/10 p-3 text-sm text-kb-charcoal">
          No delivery areas yet, so delivery is currently <strong>free</strong> for every customer. Add at least one
          area below to start charging for delivery.
        </p>
      )}

      <div className="space-y-3">
        {zones.map((z) => (
          <ZoneItem key={`${z.id}-${z.name}-${z.fee}-${z.is_active}`} zone={z} onChanged={refresh} />
        ))}
      </div>

      <form onSubmit={add} className="mt-5 grid gap-3 rounded-xl bg-kb-mist p-4 sm:grid-cols-[1fr_9rem_auto] sm:items-end">
        <Field label="New area">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Ikeja"
            className={inputCls}
          />
        </Field>
        <Field label="Fee (₦)">
          <input
            type="number"
            min="0"
            step="0.01"
            value={fee}
            onChange={(e) => setFee(e.target.value)}
            className={inputCls}
          />
        </Field>
        <button type="submit" disabled={adding} className="btn btn-primary disabled:opacity-60">
          {adding ? "Adding..." : "Add area"}
        </button>
      </form>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </section>
  );
}
