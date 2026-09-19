"use client";

import { useEffect } from "react";
import { useCart } from "@/lib/cart-context";

// Empties the cart once an online payment has been confirmed.
export default function ClearCart() {
  const { clearCart } = useCart();
  useEffect(() => {
    clearCart();
  }, [clearCart]);
  return null;
}
