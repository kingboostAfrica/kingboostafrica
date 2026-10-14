"use client";

import { useRouter } from "next/navigation";
import { RotateCw } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import type { Product } from "@/lib/types";

// Puts everything from a past order that is still on sale back into the cart.
export default function ReorderButton({ lines }: { lines: { product: Product; quantity: number }[] }) {
  const { addItem } = useCart();
  const router = useRouter();
  if (lines.length === 0) return null;

  return (
    <button
      type="button"
      onClick={() => {
        lines.forEach((l) => addItem(l.product, l.quantity));
        router.push("/cart");
      }}
      className="btn btn-outline !px-4 !py-2 text-sm"
    >
      <RotateCw size={15} aria-hidden="true" /> Order again
    </button>
  );
}
