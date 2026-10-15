import Link from "next/link";
import Stars from "@/components/reviews/Stars";

export type HomeReview = {
  id: string;
  reviewer_name: string;
  rating: number;
  title: string | null;
  body: string | null;
  product: { name: string; slug: string } | null;
};

// Only real, approved reviews from verified buyers. Shows nothing until there are some.
export default function HomeReviews({ reviews }: { reviews: HomeReview[] }) {
  if (reviews.length === 0) return null;
  return (
    <section aria-labelledby="reviews-home-heading" className="bg-kb-forest text-white">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
        <h2 id="reviews-home-heading" className="text-3xl font-bold sm:text-4xl">What our customers say</h2>
        <p className="mt-3 text-lg text-white/70">Reviews from people who have bought from the Food Mart.</p>
        <ul className="mt-10 grid gap-5 md:grid-cols-3">
          {reviews.map((r) => (
            <li key={r.id} className="rounded-xl bg-white/[0.07] p-6 ring-1 ring-white/10">
              <Stars rating={r.rating} size={18} />
              {r.title && <p className="mt-3 font-semibold">{r.title}</p>}
              {r.body && <p className="mt-2 line-clamp-5 leading-relaxed text-white/80">{r.body}</p>}
              <p className="mt-4 text-sm text-white/60">
                {r.reviewer_name} · Verified purchase
                {r.product && (
                  <>
                    {" · "}
                    <Link href={`/products/${r.product.slug}`} className="text-kb-gold hover:underline">{r.product.name}</Link>
                  </>
                )}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
