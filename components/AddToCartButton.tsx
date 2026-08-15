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
        className="inline-flex items-center gap-2 bg-kb-charcoal/10 text-kb-charcoal/40 px-6 py-3 rounded-full font-medium cursor-not-allowed"
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
      className="inline-flex items-center gap-2 bg-kb-green text-white px-6 py-3 rounded-full font-medium hover:bg-kb-green-dark transition-colors"
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
