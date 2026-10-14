import { createPublicClient } from "@/lib/supabase/public";
import Stars from "@/components/reviews/Stars";
import ReviewForm from "@/components/reviews/ReviewForm";

type Review = {
  id: string;
  reviewer_name: string;
  rating: number;
  title: string | null;
  body: string | null;
  created_at: string;
};

export async function getReviewSummary(productId: string) {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("public_reviews")
    .select("id, reviewer_name, rating, title, body, created_at")
    .eq("product_id", productId)
    .order("created_at", { ascending: false })
    .limit(100);
  // If migration 013 has not been run yet the view does not exist: just show no reviews.
  const reviews = (data ?? []) as Review[];
  const count = reviews.length;
  const average = count ? reviews.reduce((s, r) => s + r.rating, 0) / count : 0;
  return { reviews, count, average };
}

export default function ProductReviews({
  productId,
  summary,
}: {
  productId: string;
  summary: { reviews: Review[]; count: number; average: number };
}) {
  const { reviews, count, average } = summary;
  return (
    <section aria-labelledby="reviews-heading" className="mx-auto max-w-6xl border-t border-kb-forest/10 px-5 py-12">
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <h2 id="reviews-heading" className="font-display text-2xl font-bold text-kb-forest">Customer reviews</h2>
        {count > 0 && (
          <p className="flex items-center gap-2 text-sm text-kb-charcoal/70">
            <Stars rating={average} />
            <span>
              {average.toFixed(1)} from {count} review{count === 1 ? "" : "s"}
            </span>
          </p>
        )}
      </div>

      <div className="grid gap-10 lg:grid-cols-[1fr_24rem]">
        <div>
          {count === 0 ? (
            <p className="text-kb-charcoal/60">No reviews yet. Bought this? Be the first to share what you think.</p>
          ) : (
            <ul className="space-y-6">
              {reviews.map((r) => (
                <li key={r.id} className="border-b border-kb-forest/10 pb-6 last:border-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <Stars rating={r.rating} size={16} />
                    {r.title && <p className="font-semibold text-kb-charcoal">{r.title}</p>}
                  </div>
                  {r.body && <p className="mt-2 leading-relaxed text-kb-charcoal/80">{r.body}</p>}
                  <p className="mt-2 text-xs text-kb-charcoal/50">
                    {r.reviewer_name} · Verified purchase ·{" "}
                    {new Date(r.created_at).toLocaleDateString("en-NG", { month: "long", year: "numeric" })}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
        <ReviewForm productId={productId} />
      </div>
    </section>
  );
}
