"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError(
        updateError.message.includes("session")
          ? "Your reset link has expired. Please request a new one and try again."
          : updateError.message
      );
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push("/admin/login"), 2000);
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto px-5 py-24 text-center">
        <h1 className="font-display text-2xl font-bold text-kb-charcoal mb-2">
          Password updated
        </h1>
        <p className="text-kb-charcoal/60">Redirecting you to login...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-5 py-24">
      <h1 className="font-display text-3xl font-bold text-kb-charcoal mb-2">
        Set a New Password
      </h1>
      <p className="text-kb-charcoal/60 mb-8">
        Enter a new password for your admin account.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-kb-charcoal mb-1">
            New password
          </label>
          <input
            required
            type="password"
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-kb-green/30 rounded-xl px-4 py-2.5 bg-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-kb-charcoal mb-1">
            Confirm password
          </label>
          <input
            required
            type="password"
            minLength={6}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full border border-kb-green/30 rounded-xl px-4 py-2.5 bg-white"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-kb-green text-white px-6 py-3 rounded-full font-medium hover:bg-kb-green-dark transition-colors disabled:opacity-60"
        >
          {loading ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
}
