"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Field, inputCls } from "@/components/admin/ui";

export default function PasswordForm() {
  const supabase = createClient();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    if (password.length < 8) return setMessage({ ok: false, text: "Use at least 8 characters." });
    if (password !== confirm) return setMessage({ ok: false, text: "The two passwords do not match." });
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) return setMessage({ ok: false, text: error.message });
    setPassword("");
    setConfirm("");
    setMessage({ ok: true, text: "Password changed." });
  }

  return (
    <form onSubmit={save} className="space-y-4">
      <Field label="New password">
        <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} />
      </Field>
      <Field label="Repeat new password">
        <input required type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={inputCls} />
      </Field>
      {message && (
        <p className={`text-sm font-semibold ${message.ok ? "text-kb-green" : "text-red-600"}`}>{message.text}</p>
      )}
      <button type="submit" disabled={busy} className="btn btn-primary disabled:opacity-60">
        {busy ? "Saving..." : "Change password"}
      </button>
    </form>
  );
}
