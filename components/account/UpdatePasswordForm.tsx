"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function UpdatePasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) return setError("Please choose a password of at least 8 characters.");
    if (password !== confirm) return setError("The two passwords do not match.");
    setLoading(true);
    const { error: err } = await createClient().auth.updateUser({ password });
    setLoading(false);
    if (err) {
      setError(/session/i.test(err.message) ? "Your reset link has expired. Please request a new one." : err.message);
      return;
    }
    router.push("/account");
    router.refresh();
  }

  const cls = "w-full rounded-lg border border-kb-forest/25 bg-white px-4 py-2.5";
  return (
    <form onSubmit={handleSubmit} className="card mx-auto w-full max-w-md space-y-4 p-8">
      <h2 className="font-display text-2xl font-bold text-kb-forest">Choose a new password</h2>
      <div>
        <label htmlFor="pw" className="mb-1 block text-sm font-medium">New password</label>
        <input id="pw" type="password" required minLength={8} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className={cls} />
      </div>
      <div>
        <label htmlFor="pw2" className="mb-1 block text-sm font-medium">Confirm new password</label>
        <input id="pw2" type="password" required autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={cls} />
      </div>
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={loading} className="btn btn-primary w-full disabled:opacity-60">
        {loading ? "Saving..." : "Save password"}
      </button>
    </form>
  );
}
