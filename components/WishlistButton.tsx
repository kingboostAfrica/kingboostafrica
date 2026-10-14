"use client";

import { Heart } from "lucide-react";
import { useWishlist } from "@/lib/wishlist-context";

// A heart that saves / removes a product from the customer's wishlist.
// variant "icon" is the round button on product cards; "full" is the labelled button on the product page.
export default function WishlistButton({
  productId,
  productName,
  variant = "icon",
}: {
  productId: string;
  productName: string;
  variant?: "icon" | "full";
}) {
  const { has, toggle } = useWishlist();
  const saved = has(productId);
  const label = saved ? `Remove ${productName} from wishlist` : `Save ${productName} to wishlist`;

  if (variant === "full") {
    return (
      <button type="button" onClick={() => toggle(productId)} aria-pressed={saved} className="btn btn-outline">
        <Heart size={16} aria-hidden="true" className={saved ? "fill-current" : ""} />
        {saved ? "Saved" : "Save for later"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => toggle(productId)}
      aria-pressed={saved}
      aria-label={label}
      title={label}
      className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-kb-green shadow transition hover:bg-white hover:scale-105"
    >
      <Heart size={18} aria-hidden="true" className={saved ? "fill-kb-green" : ""} />
    </button>
  );
}
