"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { revalidateSite } from "@/lib/revalidate-client";
import DeleteButton from "@/components/admin/DeleteButton";
import Stars from "@/components/reviews/Stars";

export type AdminReview = {
  id: string;
  rating: number;
  title: string | null;
  body: string | null;
  reviewer_name: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  product: { name: string; slug: string } | null;
};

function Row({ review }: { review: AdminReview }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function setStatus(status: "approved" | "rejected") {
    setBusy(true);
    setError("");
    const { error: err } = await createClient().from("reviews").update({ status }).eq("id", review.id);
    setBusy(false);
    if (err) return setError(err.message);
    revalidateSite();
    router.refresh();
  }

  return (
    <li className="rounded-xl border border-kb-forest/15 bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <Stars rating={review.rating} size={16} />
            {review.title && <p className="font-semibold text-kb-charcoal">{review.title}</p>}
          </div>
          {review.body && <p className="mt-2 text-sm leading-relaxed text-kb-charcoal/80">{review.body}</p>}
          <p className="mt-2 text-xs text-kb-charcoal/50">
            {review.reviewer_name} ·{" "}
            {review.product ? (
              <Link href={`/products/${review.product.slug}`} target="_blank" className="text-kb-green hover:underline">
                {review.product.name}
              </Link>
            ) : (
              "Deleted product"
            )}{" "}
            · {new Date(review.created_at).toLocaleDateString("en-NG")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {review.status !== "approved" && (
            <button type="button" disabled={busy} onClick={() => setStatus("approved")} className="rounded-full bg-kb-green px-3 py-1.5 text-xs font-semibold text-white hover:bg-kb-green-dark disabled:opacity-50">
              Approve
            </button>
          )}
          {review.status !== "rejected" && (
            <button type="button" disabled={busy} onClick={() => setStatus("rejected")} className="rounded-full border border-kb-forest/25 px-3 py-1.5 text-xs font-medium hover:bg-kb-mist disabled:opacity-50">
              {review.status === "approved" ? "Hide" : "Reject"}
            </button>
          )}
          <DeleteButton table="reviews" id={review.id} confirmText="Delete this review permanently?" />
        </div>
      </div>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </li>
  );
}

export default function ReviewModeration({ reviews }: { reviews: AdminReview[] }) {
  const groups: { key: AdminReview["status"]; title: string }[] = [
    { key: "pending", title: "Waiting for your decision" },
    { key: "approved", title: "Published" },
    { key: "rejected", title: "Rejected" },
  ];
  return (
    <div className="space-y-10">
      {groups.map((g) => {
        const rows = reviews.filter((r) => r.status === g.key);
        return (
          <section key={g.key}>
            <h2 className="mb-3 font-display text-xl font-bold text-kb-forest">
              {g.title} <span className="text-base font-normal text-kb-charcoal/50">({rows.length})</span>
            </h2>
            {rows.length === 0 ? (
              <p className="text-sm text-kb-charcoal/50">Nothing here.</p>
            ) : (
              <ul className="space-y-3">
                {rows.map((r) => (
                  <Row key={r.id} review={r} />
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}
