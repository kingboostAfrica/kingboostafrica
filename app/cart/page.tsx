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
        <h1 className="font-display text-3xl font-semibold text-ink mb-3">
          Your cart is empty
        </h1>
        <p className="text-ink/60 mb-8">
          Browse the marketplace to find fresh produce from verified farmers.
        </p>
        <Link
          href="/shop"
          className="inline-block bg-cassava text-millet px-6 py-3 rounded-full font-medium hover:bg-cassava-dark transition-colors"
        >
          Browse Marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-5 py-12">
      <h1 className="font-display text-3xl font-semibold text-ink mb-8">
        Your Cart
      </h1>

      <div className="space-y-4">
        {items.map(({ product, quantity }) => (
          <div
            key={product.id}
            className="flex gap-4 p-4 border border-sage/40 rounded-2xl items-center"
          >
            <div className="w-20 h-20 bg-sage-light rounded-xl overflow-hidden relative shrink-0">
              {product.images?.[0] && (
                <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-ink truncate">{product.name}</p>
              <p className="text-clay font-semibold text-sm">
                ₦{product.price.toLocaleString()} / {product.unit}
              </p>
            </div>
            <div className="flex items-center gap-2 border border-sage rounded-full px-2 py-1">
              <button
                onClick={() => updateQuantity(product.id, quantity - 1)}
                className="p-1 hover:text-clay"
                aria-label="Decrease quantity"
              >
                <Minus size={14} />
              </button>
              <span className="text-sm w-6 text-center">{quantity}</span>
              <button
                onClick={() => updateQuantity(product.id, quantity + 1)}
                className="p-1 hover:text-clay"
                aria-label="Increase quantity"
              >
                <Plus size={14} />
              </button>
            </div>
            <button
              onClick={() => removeItem(product.id)}
              className="p-2 text-ink/40 hover:text-clay"
              aria-label={`Remove ${product.name}`}
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-10 flex items-center justify-between border-t border-sage/40 pt-6">
        <p className="text-lg font-semibold text-ink">Total</p>
        <p className="text-2xl font-semibold text-clay">
          ₦{total.toLocaleString()}
        </p>
      </div>

      <Link
        href="/checkout"
        className="mt-6 block text-center bg-clay text-millet px-6 py-3 rounded-full font-medium hover:bg-clay-dark transition-colors"
      >
        Proceed to Checkout
      </Link>
    </div>
  );
}
