"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Field, inputCls } from "@/components/admin/ui";

export type Member = { id: string; email: string; role: "admin" | "staff"; isYou: boolean };

export default function TeamManager({ members }: { members: Member[] }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"staff" | "admin">("staff");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    const res = await fetch("/api/admin/team", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role }),
    });
    const json = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setMessage({ ok: false, text: json.error ?? "Something went wrong." });
    setMessage({
      ok: true,
      text: `Added. Give ${email} the temporary password so they can log in at /admin/login. They can change it under Account.`,
    });
    setEmail("");
    setPassword("");
    router.refresh();
  }

  async function remove(m: Member) {
    if (!window.confirm(`Remove ${m.email}? They will no longer be able to log in.`)) return;
    setBusy(true);
    setMessage(null);
    const res = await fetch("/api/admin/team", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: m.id }),
    });
    const json = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setMessage({ ok: false, text: json.error ?? "Something went wrong." });
    router.refresh();
  }

  return (
    <div>
      <div className="space-y-3">
        {members.map((m) => (
          <div key={m.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-kb-forest/15 p-4">
            <div>
              <p className="font-semibold text-kb-charcoal">
                {m.email} {m.isYou && <span className="text-xs font-normal text-kb-charcoal/50">(you)</span>}
              </p>
              <p className="text-xs text-kb-charcoal/60">
                {m.role === "admin" ? "Full admin: everything" : "Staff: Orders and Messages only"}
              </p>
            </div>
            {!m.isYou && (
              <button
                disabled={busy}
                onClick={() => remove(m)}
                className="rounded-full border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                Remove
              </button>
            )}
          </div>
        ))}
      </div>

      <h2 className="font-display text-xl font-bold text-kb-forest mt-10 mb-1">Add a team member</h2>
      <p className="text-sm text-kb-charcoal/60 mb-4">
        They log in at <span className="font-mono">/admin/login</span> with the email and temporary password you set here.
      </p>
      <form onSubmit={add} className="space-y-4 rounded-xl bg-kb-mist p-5">
        <Field label="Email">
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
        </Field>
        <Field label="Temporary password (at least 8 characters)">
          <input required type="text" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} />
        </Field>
        <Field label="Access level">
          <select value={role} onChange={(e) => setRole(e.target.value as "staff" | "admin")} className={inputCls}>
            <option value="staff">Staff — Orders and Messages only</option>
            <option value="admin">Full admin — everything, including refunds and settings</option>
          </select>
        </Field>
        <button type="submit" disabled={busy} className="btn btn-primary disabled:opacity-60">
          {busy ? "Adding..." : "Add team member"}
        </button>
      </form>
      {message && (
        <p className={`mt-4 text-sm font-semibold ${message.ok ? "text-kb-green" : "text-red-600"}`}>{message.text}</p>
      )}
    </div>
  );
}
