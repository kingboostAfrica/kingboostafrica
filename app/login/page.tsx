"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
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

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="max-w-md mx-auto px-5 py-24">
      <h1 className="font-display text-3xl font-semibold text-ink mb-2">
        Farmer Login
      </h1>
      <p className="text-ink/60 mb-8">
        Log in to manage your listings and profile.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-ink mb-1">
            Email
          </label>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-sage rounded-xl px-4 py-2.5 bg-white/60"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink mb-1">
            Password
          </label>
          <input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-sage rounded-xl px-4 py-2.5 bg-white/60"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-cassava text-millet px-6 py-3 rounded-full font-medium hover:bg-cassava-dark transition-colors disabled:opacity-60"
        >
          {loading ? "Logging in..." : "Log In"}
        </button>

        <p className="text-sm text-center text-ink/60">
          Not registered yet?{" "}
          <Link href="/farmers/register" className="text-clay underline">
            Register as a farmer
          </Link>
        </p>
      </form>
    </div>
  );
}
