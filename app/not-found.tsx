import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-xl mx-auto px-5 py-28 text-center">
      <p className="text-xs font-semibold uppercase tracking-wider text-kb-gold-dark mb-3">
        404
      </p>
      <h1 className="font-display text-4xl font-bold text-kb-charcoal mb-3">
        We couldn&apos;t find that page
      </h1>
      <p className="text-kb-charcoal/60 mb-8">
        The page may have moved, or the product or course is no longer available.
      </p>
      <div className="flex flex-wrap justify-center gap-4">
        <Link
          href="/"
          className="btn btn-primary"
        >
          Back to home
        </Link>
        <Link
          href="/food-mart"
          className="btn btn-outline"
        >
          Visit Food Mart
        </Link>
      </div>
    </div>
  );
}
