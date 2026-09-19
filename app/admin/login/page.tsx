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

    // Hard navigation on purpose: guarantees the server sees the new auth cookie.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = "/admin";
  }

  return (
    <div className="flex min-h-screen items-center bg-kb-mist px-5 py-12">
     <div className="card mx-auto w-full max-w-md p-8">
      <Image src="/kingboost-icon.png" alt="" width={44} height={60} className="mb-5 h-14 w-auto" />
      <h1 className="font-display text-3xl font-bold text-kb-forest mb-2">
        Admin login
      </h1>
      <p className="text-kb-charcoal/70 mb-8">
        Log in to manage KingBoostFarms content.
      </p>
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
      <Link href="/" className="mt-6 block text-center text-sm font-semibold text-kb-green hover:underline">
        ← Back to the website
      </Link>
     </div>
    </div>
  );
}
