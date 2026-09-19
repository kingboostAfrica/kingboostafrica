"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/lib/cart-context";
import { Minus, Plus, Trash2 } from "lucide-react";
import PageHeader from "@/components/PageHeader";

export default function CartPage() {
  const { items, updateQuantity, removeItem, total } = useCart();

  if (items.length === 0) {
    return (
      <>
        <PageHeader title="Your cart" />
        <div className="mx-auto max-w-3xl px-5 py-20 text-center">
          <h2 className="mb-3 text-2xl font-bold text-kb-forest">Your cart is empty</h2>
          <p className="mb-8 text-kb-charcoal/70">
            Browse Food Mart to find fresh, pure, natural produce.
          </p>
          <Link href="/food-mart" className="btn btn-primary">
            Shop Food Mart
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Your cart" description={`${items.length} item${items.length === 1 ? "" : "s"} ready to order`} />
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-4">
          {items.map(({ product, quantity }) => (
            <div
              key={product.id}
              className="card flex items-center gap-4 p-4"
            >
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-kb-mist">
                {product.images?.[0] && (
                  <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-kb-charcoal">{product.name}</p>
                <p className="text-sm font-semibold text-kb-green">
                  ₦{product.price.toLocaleString()} / {product.unit}
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-kb-forest/25 px-2 py-1">
                <button
                  onClick={() => updateQuantity(product.id, quantity - 1)}
                  className="p-1 hover:text-kb-green"
                  aria-label="Decrease quantity"
                >
                  <Minus size={14} />
                </button>
                <span className="w-6 text-center text-sm">{quantity}</span>
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
                className="p-2 text-kb-charcoal/40 hover:text-red-600"
                aria-label={`Remove ${product.name}`}
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>

        <aside className="card h-fit p-6 lg:sticky lg:top-28">
          <h2 className="text-xl font-bold text-kb-forest">Order summary</h2>
          <div className="mt-5 flex items-center justify-between border-t border-kb-forest/10 pt-5">
            <p className="font-semibold text-kb-charcoal">Total</p>
            <p className="text-2xl font-bold text-kb-green">₦{total.toLocaleString()}</p>
          </div>
          <p className="mt-2 text-sm text-kb-charcoal/60">Payment is collected on delivery.</p>
          <Link href="/checkout" className="btn btn-primary mt-6 w-full">
            Proceed to checkout
          </Link>
          <Link href="/food-mart" className="mt-3 block text-center text-sm font-semibold text-kb-green hover:underline">
            Continue shopping
          </Link>
        </aside>
      </div>
    </>
  );
}
