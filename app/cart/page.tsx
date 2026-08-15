"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/lib/cart-context";
import { Minus, Plus, Trash2 } from "lucide-react";

export default function CartPage() {
  const { items, updateQuantity, removeItem, total } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-5 py-24 text-center">
        <h1 className="font-display text-3xl font-bold text-kb-charcoal mb-3">
          Your cart is empty
        </h1>
        <p className="text-kb-charcoal/60 mb-8">
          Browse Food Mart to find fresh, pure, natural produce.
        </p>
        <Link
          href="/food-mart"
          className="inline-block bg-kb-green text-white px-6 py-3 rounded-full font-medium hover:bg-kb-green-dark transition-colors"
        >
          Shop Food Mart
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-5 py-12">
      <h1 className="font-display text-3xl font-bold text-kb-charcoal mb-8">
        Your Cart
      </h1>

      <div className="space-y-4">
        {items.map(({ product, quantity }) => (
          <div
            key={product.id}
            className="flex gap-4 p-4 border border-kb-green/15 rounded-2xl items-center"
          >
            <div className="w-20 h-20 bg-kb-cream rounded-xl overflow-hidden relative shrink-0">
              {product.images?.[0] && (
                <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-kb-charcoal truncate">{product.name}</p>
              <p className="text-kb-green font-semibold text-sm">
                ₦{product.price.toLocaleString()} / {product.unit}
              </p>
            </div>
            <div className="flex items-center gap-2 border border-kb-green/30 rounded-full px-2 py-1">
              <button
                onClick={() => updateQuantity(product.id, quantity - 1)}
                className="p-1 hover:text-kb-green"
                aria-label="Decrease quantity"
              >
                <Minus size={14} />
              </button>
              <span className="text-sm w-6 text-center">{quantity}</span>
              <button
                onClick={() => updateQuantity(product.id, quantity + 1)}
                className="p-1 hover:text-kb-green"
                aria-label="Increase quantity"
              >
                <Plus size={14} />
              </button>
            </div>
            <button
              onClick={() => removeItem(product.id)}
              className="p-2 text-kb-charcoal/40 hover:text-kb-green"
              aria-label={`Remove ${product.name}`}
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-10 flex items-center justify-between border-t border-kb-green/15 pt-6">
        <p className="text-lg font-semibold text-kb-charcoal">Total</p>
        <p className="text-2xl font-semibold text-kb-green">
          ₦{total.toLocaleString()}
        </p>
      </div>

      <Link
        href="/checkout"
        className="mt-6 block text-center bg-kb-green text-white px-6 py-3 rounded-full font-medium hover:bg-kb-green-dark transition-colors"
      >
        Proceed to Checkout
      </Link>
    </div>
  );
}
