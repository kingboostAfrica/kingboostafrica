import { requireAdmin } from "@/lib/admin";
import ReviewModeration, { type AdminReview } from "@/components/admin/ReviewModeration";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("reviews")
    .select("id, rating, title, body, reviewer_name, status, created_at, product:products(name, slug)")
    .order("created_at", { ascending: false })
    .limit(300);

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <h1 className="mb-2 font-display text-3xl font-bold text-kb-charcoal">Product reviews</h1>
      <p className="mb-8 text-kb-charcoal/60">
        Only customers who bought a product can review it. Reviews stay hidden until you approve them.
      </p>
      {error ? (
        <p className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
          Reviews are not set up yet. Run <code>supabase/013_accounts_wishlist_reviews.sql</code> in the Supabase SQL editor.
        </p>
      ) : (
        <ReviewModeration reviews={(data ?? []) as unknown as AdminReview[]} />
      )}
    </div>
  );
}
