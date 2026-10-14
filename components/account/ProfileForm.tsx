"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const cls = "w-full rounded-lg border border-kb-forest/25 bg-white px-4 py-2.5";

export default function ProfileForm({
  userId,
  email,
  initial,
}: {
  userId: string;
  email: string;
  initial: { full_name: string; phone: string; address: string };
}) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    const { error: err } = await createClient()
      .from("customer_profiles")
      .upsert({
        user_id: userId,
        full_name: form.full_name.trim().slice(0, 200),
        phone: form.phone.trim().slice(0, 40),
        address: form.address.trim().slice(0, 1000),
        updated_at: new Date().toISOString(),
      });
    setSaving(false);
    if (err) return setError("We could not save your details. Please try again.");
    setMessage("Saved. We'll fill these in for you at checkout.");
  }

  return (
    <form onSubmit={save} className="card space-y-4 p-6">
      <div>
        <label className="mb-1 block text-sm font-medium">Email</label>
        <input value={email} readOnly className={`${cls} bg-kb-mist text-kb-charcoal/70`} />
      </div>
      <div>
        <label htmlFor="pf-name" className="mb-1 block text-sm font-medium">Full name</label>
        <input id="pf-name" value={form.full_name} autoComplete="name" onChange={(e) => setForm({ ...form, full_name: e.target.value })} className={cls} />
      </div>
      <div>
        <label htmlFor="pf-phone" className="mb-1 block text-sm font-medium">Phone</label>
        <input id="pf-phone" value={form.phone} autoComplete="tel" onChange={(e) => setForm({ ...form, phone: e.target.value })} className={cls} />
      </div>
      <div>
        <label htmlFor="pf-address" className="mb-1 block text-sm font-medium">Delivery address</label>
        <textarea id="pf-address" rows={3} value={form.address} autoComplete="street-address" onChange={(e) => setForm({ ...form, address: e.target.value })} className={cls} />
      </div>
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      {message && <p role="status" className="text-sm text-kb-green">{message}</p>}
      <button type="submit" disabled={saving} className="btn btn-primary disabled:opacity-60">
        {saving ? "Saving..." : "Save details"}
      </button>
    </form>
  );
}
