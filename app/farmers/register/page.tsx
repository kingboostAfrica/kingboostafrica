"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function FarmerRegisterPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    location: "",
    state: "",
    bio: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Signup failed. Please try again.");

      const { error: profileError } = await supabase.from("farmers").insert({
        id: authData.user.id,
        full_name: form.fullName,
        phone: form.phone || null,
        location: form.location || null,
        state: form.state || null,
        bio: form.bio || null,
      });

      if (profileError) throw profileError;

      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto px-5 py-12">
      <h1 className="font-display text-3xl font-semibold text-ink mb-2">
        Register as a Farmer
      </h1>
      <p className="text-ink/60 mb-8">
        Create your profile and start listing produce for sale.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-ink mb-1">
            Full name
          </label>
          <input
            required
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            className="w-full border border-sage rounded-xl px-4 py-2.5 bg-white/60"
          />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              Email
            </label>
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
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
              minLength={6}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full border border-sage rounded-xl px-4 py-2.5 bg-white/60"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-ink mb-1">
            Phone number
          </label>
          <input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full border border-sage rounded-xl px-4 py-2.5 bg-white/60"
          />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              Location / Town
            </label>
            <input
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="w-full border border-sage rounded-xl px-4 py-2.5 bg-white/60"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              State
            </label>
            <input
              value={form.state}
              onChange={(e) => setForm({ ...form, state: e.target.value })}
              className="w-full border border-sage rounded-xl px-4 py-2.5 bg-white/60"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-ink mb-1">
            Short bio
          </label>
          <textarea
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            rows={3}
            className="w-full border border-sage rounded-xl px-4 py-2.5 bg-white/60"
            placeholder="Tell buyers about your farm..."
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-clay text-millet px-6 py-3 rounded-full font-medium hover:bg-clay-dark transition-colors disabled:opacity-60"
        >
          {loading ? "Creating your profile..." : "Register"}
        </button>

        <p className="text-sm text-center text-ink/60">
          Already registered?{" "}
          <Link href="/login" className="text-clay underline">
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}
