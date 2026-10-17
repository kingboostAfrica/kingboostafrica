"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // Two-step login: set once the password is right and this person has an authenticator app set up.
  const [factorId, setFactorId] = useState<string | null>(null);
  const [code, setCode] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError("Incorrect email or password. Please try again.");
      setLoading(false);
      return;
    }

    // Does this person also need to give an authenticator code?
    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aal && aal.nextLevel === "aal2" && aal.currentLevel !== "aal2") {
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const totp = factors?.totp?.[0];
      if (!totp) {
        await supabase.auth.signOut();
        setError("Two-step login is on for this account but no authenticator was found. Ask a full admin for help.");
        setLoading(false);
        return;
      }
      setFactorId(totp.id);
      setLoading(false);
      return;
    }

    goToAdmin();
  }

  function goToAdmin() {
    // Hard navigation on purpose: guarantees the server sees the new auth cookie.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = "/admin";
  }

  async function handleCode(e: React.FormEvent) {
    e.preventDefault();
    if (!factorId) return;
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId, code: code.trim() });
    if (error) {
      setError("That code did not work. Check the code in your authenticator app and try again.");
      setLoading(false);
      return;
    }
    goToAdmin();
  }

  async function cancelCode() {
    await supabase.auth.signOut();
    setFactorId(null);
    setCode("");
    setPassword("");
    setError("");
  }

  return (
    <div className="flex min-h-screen items-center bg-kb-mist px-5 py-12">
     <div className="card mx-auto w-full max-w-md p-8">
      <Image src="/kingboost-icon.png" alt="" width={44} height={60} className="mb-5 h-14 w-auto" />
      <h1 className="font-display text-3xl font-bold text-kb-forest mb-2">
        {factorId ? "Enter your code" : "Admin login"}
      </h1>
      <p className="text-kb-charcoal/70 mb-8">
        {factorId
          ? "Open your authenticator app and type the 6-digit code for KingBoostFarms."
          : "Log in to manage KingBoostFarms content."}
      </p>
      {factorId ? (
        <form onSubmit={handleCode} className="space-y-4">
          <div>
            <label htmlFor="mfa-code" className="block text-sm font-medium text-kb-charcoal mb-1">6-digit code</label>
            <input
              id="mfa-code"
              required
              autoFocus
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              className="w-full border border-kb-forest/25 rounded-lg px-4 py-2.5 bg-white text-center text-2xl tracking-[0.4em]"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={loading || code.length !== 6} className="btn btn-primary w-full disabled:opacity-60">
            {loading ? "Checking..." : "Verify and log in"}
          </button>
          <button type="button" onClick={cancelCode} className="block w-full text-center text-sm font-semibold text-kb-green hover:underline">
            Use a different account
          </button>
        </form>
      ) : (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-kb-charcoal mb-1">Email</label>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-kb-forest/25 rounded-lg px-4 py-2.5 bg-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-kb-charcoal mb-1">Password</label>
          <input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-kb-forest/25 rounded-lg px-4 py-2.5 bg-white"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary w-full disabled:opacity-60"
        >
          {loading ? "Logging in..." : "Log In"}
        </button>
      </form>
      )}
      <Link href="/" className="mt-6 block text-center text-sm font-semibold text-kb-green hover:underline">
        ← Back to the website
      </Link>
     </div>
    </div>
  );
}
