"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { computeTotals, formatNaira } from "@/lib/pricing";
import { Field, inputCls } from "@/components/admin/ui";

export default function StoreSettingsForm({
  vatPercent,
  pickupEnabled,
  pickupAddress,
  pickupInstructions,
}: {
  vatPercent: number;
  pickupEnabled: boolean;
  pickupAddress: string;
  pickupInstructions: string;
}) {
  const supabase = createClient();
  const [vat, setVat] = useState(String(vatPercent));
  const [pickupOn, setPickupOn] = useState(pickupEnabled);
  const [address, setAddress] = useState(pickupAddress);
  const [instructions, setInstructions] = useState(pickupInstructions);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const vatNum = parseFloat(vat);
  const valid = Number.isFinite(vatNum) && vatNum >= 0 && vatNum <= 100;
  const example = valid ? computeTotals(10000, vatNum, 0) : null;

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) {
      setMessage({ ok: false, text: "VAT must be a number between 0 and 100." });
      return;
    }
    if (pickupOn && !address.trim()) {
      setMessage({ ok: false, text: "Enter the pickup address so customers know where to collect." });
      return;
    }
    setSaving(true);
    setMessage(null);
    const { error } = await supabase.from("store_settings").upsert({
      id: 1,
      vat_percent: vatNum,
      pickup_enabled: pickupOn,
      pickup_address: address.trim() || null,
      pickup_instructions: instructions.trim() || null,
      updated_at: new Date().toISOString(),
    });
    setSaving(false);
    setMessage(
      error
        ? { ok: false, text: error.message }
        : { ok: true, text: "Saved. New orders will use these settings straight away." }
    );
  }

  return (
    <form onSubmit={save} className="space-y-8">
      <section>
        <h2 className="font-display text-xl font-bold text-kb-forest mb-1">VAT</h2>
        <p className="text-sm text-kb-charcoal/60 mb-4">
          Added to the product subtotal at checkout (not to the delivery fee). Enter 0 for no VAT.
        </p>
        <div className="max-w-xs">
          <Field label="VAT (%)">
            <input
              required
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={vat}
              onChange={(e) => setVat(e.target.value)}
              className={inputCls}
            />
          </Field>
        </div>
        {example && (
          <p className="mt-3 text-sm text-kb-charcoal/70">
            Example: ₦10,000 of products + {vatNum}% VAT = <strong>{formatNaira(example.total)}</strong>
          </p>
        )}
      </section>

      <section>
        <h2 className="font-display text-xl font-bold text-kb-forest mb-1">Self pickup</h2>
        <p className="text-sm text-kb-charcoal/60 mb-4">
          Lets customers collect their order themselves, with no delivery fee.
        </p>
        <label className="mb-4 flex items-center gap-3 text-sm font-semibold text-kb-charcoal">
          <input
            type="checkbox"
            checked={pickupOn}
            onChange={(e) => setPickupOn(e.target.checked)}
            className="h-4 w-4 accent-[#2E7D32]"
          />
          Offer self pickup at checkout
        </label>
        {pickupOn && (
          <div className="space-y-4">
            <Field label="Pickup address">
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={2}
                placeholder="8 Ibudo Oloja Street, Igbanko, Badagry, Lagos"
                className={inputCls}
              />
            </Field>
            <Field label="Pickup instructions (optional)">
              <input
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="e.g. Mon–Sat, 9am–5pm. Bring your order number."
                className={inputCls}
              />
            </Field>
          </div>
        )}
      </section>

      {message && (
        <p className={`text-sm font-semibold ${message.ok ? "text-kb-green" : "text-red-600"}`}>{message.text}</p>
      )}

      <button type="submit" disabled={saving} className="btn btn-primary disabled:opacity-60">
        {saving ? "Saving..." : "Save VAT and pickup settings"}
      </button>
    </form>
  );
}
