"use client";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="max-w-xl mx-auto px-5 py-28 text-center">
      <h1 className="font-display text-3xl font-bold text-kb-charcoal mb-3">
        Something went wrong
      </h1>
      <p className="text-kb-charcoal/60 mb-8">
        We hit a problem loading this page. Please try again in a moment.
      </p>
      <button
        onClick={() => reset()}
        className="btn btn-primary"
      >
        Try again
      </button>
    </div>
  );
}
