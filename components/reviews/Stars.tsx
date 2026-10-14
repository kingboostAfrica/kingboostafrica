import { Star } from "lucide-react";

// Read-only row of stars. `rating` can be a decimal (4.5 shows as four and a half).
export default function Stars({ rating, size = 18 }: { rating: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" role="img" aria-label={`${rating.toFixed(1)} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => {
        const fill = Math.max(0, Math.min(1, rating - (n - 1)));
        return (
          <span key={n} className="relative inline-block" style={{ width: size, height: size }}>
            <Star size={size} className="absolute inset-0 text-kb-gold/40" aria-hidden="true" />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <Star size={size} className="fill-kb-gold text-kb-gold" aria-hidden="true" />
            </span>
          </span>
        );
      })}
    </span>
  );
}
