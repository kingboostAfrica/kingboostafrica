"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import type { Product } from "@/lib/types";
import { Check, ShoppingBasket } from "lucide-react";

export default function AddToCartButton({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  if (product.stock <= 0) {
    return (
      <button
        disabled
        className="inline-flex items-center gap-2 bg-sage/50 text-ink/50 px-6 py-3 rounded-full font-medium cursor-not-allowed"
      >
        Out of stock
      </button>
    );
  }

  return (
    <button
      onClick={() => {
        addItem(product);
        setAdded(true);
        setTimeout(() => setAdded(false), 1500);
      }}
      className="inline-flex items-center gap-2 bg-clay text-millet px-6 py-3 rounded-full font-medium hover:bg-clay-dark transition-colors"
    >
      {added ? (
        <>
          <Check size={16} /> Added to cart
        </>
      ) : (
        <>
          <ShoppingBasket size={16} /> Add to cart
        </>
      )}
    </button>
  );
}
