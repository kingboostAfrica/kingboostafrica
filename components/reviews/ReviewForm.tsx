"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type State =
  | { kind: "loading" }
  | { kind: "anonymous" }
  | { kind: "not-buyer" }
  | { kind: "existing"; status: string }
  | { kind: "form" }
  | { kind: "sent" };

const cls = "w-full rounded-lg border border-kb-forest/25 bg-white px-4 py-2.5";

export default function ReviewForm({ productId }: { productId: string }) {
  const pathname = usePathname();
  const [state, setState] = useState<State>({ kind: "loading" });
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;
      if (!data.session) return setState({ kind: "anonymous" });

      const [{ data: mine }, { data: bought }] = await Promise.all([
        supabase.from("reviews").select("status").eq("product_id", productId).eq("user_id", data.session.user.id).maybeSingle(),
        supabase.rpc("has_purchased", { p_product: productId }),
      ]);
      if (cancelled) return;
      if (mine) return setState({ kind: "existing", status: mine.status });
      setState(bought === true ? { kind: "form" } : { kind: "not-buyer" });
    })();
    return () => {
      cancelled = true;
    };
  }, [productId]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (rating < 1) return setError("Please choose a star rating.");
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, rating, title, body }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not send your review.");
      setState({ kind: "sent" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send your review.");
    } finally {
      setBusy(false);
    }
  }

  const box = "card h-fit p-6";

  if (state.kind === "loading") return <div className={box} aria-busy="true"><p className="text-sm text-kb-charcoal/50">Loading...</p></div>;

  if (state.kind === "anonymous")
    return (
      <div className={box}>
        <h3 className="mb-2 font-semibold text-kb-forest">Write a review</h3>
        <p className="mb-4 text-sm text-kb-charcoal/70">Log in to review products you have bought.</p>
        <Link href={`/account/login?next=${encodeURIComponent(pathname || "/")}`} className="btn btn-primary">Log in</Link>
      </div>
    );

  if (state.kind === "not-buyer")
    return (
      <div className={box}>
        <h3 className="mb-2 font-semibold text-kb-forest">Write a review</h3>
        <p className="text-sm text-kb-charcoal/70">
          Only customers who have bought this product can review it. We match your orders using your account email, and the order must be paid or on its way.
        </p>
      </div>
    );

  if (state.kind === "existing" || state.kind === "sent") {
    const status = state.kind === "sent" ? "pending" : state.status;
    return (
      <div className={box} role="status">
        <h3 className="mb-2 font-semibold text-kb-forest">Thank you!</h3>
        <p className="text-sm text-kb-charcoal/70">
          {status === "approved"
            ? "Your review is published on this page."
            : status === "rejected"
              ? "Your review was not published. Contact us if you'd like to know why."
              : "Your review has been received and will appear here once we have approved it."}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className={`${box} space-y-4`}>
      <h3 className="font-semibold text-kb-forest">Write a review</h3>
      <fieldset>
        <legend className="mb-1 block text-sm font-medium">Your rating</legend>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              aria-label={`${n} star${n === 1 ? "" : "s"}`}
              aria-pressed={rating === n}
              className="p-0.5"
            >
              <Star size={28} className={n <= rating ? "fill-kb-gold text-kb-gold" : "text-kb-gold/40"} aria-hidden="true" />
            </button>
          ))}
        </div>
      </fieldset>
      <div>
        <label htmlFor="rv-title" className="mb-1 block text-sm font-medium">Headline (optional)</label>
        <input id="rv-title" maxLength={120} value={title} onChange={(e) => setTitle(e.target.value)} className={cls} />
      </div>
      <div>
        <label htmlFor="rv-body" className="mb-1 block text-sm font-medium">Your review</label>
        <textarea id="rv-body" rows={4} maxLength={2000} value={body} onChange={(e) => setBody(e.target.value)} className={cls} />
      </div>
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={busy} className="btn btn-primary w-full disabled:opacity-60">
        {busy ? "Sending..." : "Submit review"}
      </button>
      <p className="text-xs text-kb-charcoal/50">Reviews are checked by our team before they appear.</p>
    </form>
  );
}
