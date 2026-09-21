"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { computeTotals, formatNaira } from "@/lib/pricing";
import { Field, inputCls } from "@/components/admin/ui";
import { isValidWhatsapp, normalizeWhatsapp } from "@/lib/whatsapp";
import { revalidateSite } from "@/lib/revalidate-client";

export default function StoreSettingsForm({
  vatPercent,
  pickupEnabled,
  pickupAddress,
  pickupInstructions,
  whatsappNumber,
}: {
  vatPercent: number;
  pickupEnabled: boolean;
  pickupAddress: string;
  pickupInstructions: string;
  whatsappNumber: string;
}) {
  const supabase = createClient();
  const [vat, setVat] = useState(String(vatPercent));
  const [pickupOn, setPickupOn] = useState(pickupEnabled);
  const [address, setAddress] = useState(pickupAddress);
  const [instructions, setInstructions] = useState(pickupInstructions);
  const [whatsapp, setWhatsapp] = useState(whatsappNumber);
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
    const wa = normalizeWhatsapp(whatsapp);
    if (whatsapp.trim() && !isValidWhatsapp(wa)) {
      setMessage({ ok: false, text: "That WhatsApp number does not look right. Example: 0803 123 4567." });
      return;
    }
    setSaving(true);
    setMessage(null);
    const { error } = await supabase.from("store_settings").upsert({
      whatsapp_number: wa || null,
      id: 1,
      vat_percent: vatNum,
      pickup_enabled: pickupOn,
      pickup_address: address.trim() || null,
      pickup_instructions: instructions.trim() || null,
      updated_at: new Date().toISOString(),
    });
    setSaving(false);
    if (!error) {
      setWhatsapp(wa);
      revalidateSite(); // so the WhatsApp buttons appear/disappear on the public pages right away
    }
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

      <section>
        <h2 className="font-display text-xl font-bold text-kb-forest mb-1">WhatsApp</h2>
        <p className="text-sm text-kb-charcoal/60 mb-4">
          Shows a &ldquo;Chat with us&rdquo; button on every page, an &ldquo;Ask on WhatsApp&rdquo; button on each product, and a link in the
          footer. Leave empty to hide them.
        </p>
        <div className="max-w-xs">
          <Field label="WhatsApp number">
            <input
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="0803 123 4567"
              className={inputCls}
            />
          </Field>
        </div>
      </section>

      {message && (
        <p className={`text-sm font-semibold ${message.ok ? "text-kb-green" : "text-red-600"}`}>{message.text}</p>
      )}

      <button type="submit" disabled={saving} className="btn btn-primary disabled:opacity-60">
        {saving ? "Saving..." : "Save settings"}
      </button>
    </form>
  );
}
