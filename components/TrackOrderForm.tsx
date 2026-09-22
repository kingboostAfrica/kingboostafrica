"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export default function TrackOrderForm() {
  const router = useRouter();
  const [ref, setRef] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/orders/find-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ref, email }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.token) {
        setError(json.error ?? "We could not find that order.");
        setLoading(false);
        return;
      }
      router.push(`/order/track/${json.token}`);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="card space-y-4 p-6 sm:p-8">
      <div>
        <label className="mb-1 block text-sm font-medium text-kb-charcoal">Order reference</label>
        <input
          required
          value={ref}
          onChange={(e) => setRef(e.target.value)}
          placeholder="e.g. ABC00001"
          className="w-full rounded-lg border border-kb-forest/25 bg-white px-4 py-2.5"
        />
        <p className="mt-1 text-xs text-kb-charcoal/50">
          Found at the top of your order confirmation email, after the # sign.
        </p>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-kb-charcoal">Email address</label>
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="The email you used to order"
          className="w-full rounded-lg border border-kb-forest/25 bg-white px-4 py-2.5"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={loading} className="btn btn-primary w-full disabled:opacity-60">
        <Search size={16} aria-hidden="true" /> {loading ? "Looking..." : "Track my order"}
      </button>
    </form>
  );
}
