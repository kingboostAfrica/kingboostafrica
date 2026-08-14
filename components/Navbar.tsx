"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, ShoppingBasket } from "lucide-react";
import { useCart } from "@/lib/cart-context";

const links = [
  { href: "/shop", label: "Marketplace" },
  { href: "/farmers", label: "Farmers" },
  { href: "/gallery", label: "Gallery" },
  { href: "/about", label: "About" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { count } = useCart();

  return (
    <header className="sticky top-0 z-50 bg-millet/95 backdrop-blur border-b border-sage/40">
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        <Link href="/" className="font-display text-xl font-semibold text-cassava tracking-tight">
          KingBoost<span className="text-clay">Africa</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-ink hover:text-clay transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/cart"
            aria-label="View cart"
            className="relative p-2 text-ink hover:text-clay transition-colors"
          >
            <ShoppingBasket size={20} />
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-clay text-millet text-[10px] font-semibold w-4 h-4 rounded-full flex items-center justify-center">
                {count}
              </span>
            )}
          </Link>
          <Link
            href="/login"
            className="text-sm font-medium px-4 py-2 border border-cassava text-cassava rounded-full hover:bg-cassava hover:text-millet transition-colors"
          >
            Farmer Login
          </Link>
          <Link
            href="/farmers/register"
            className="text-sm font-medium px-4 py-2 bg-clay text-millet rounded-full hover:bg-clay-dark transition-colors"
          >
            Sell on KingBoost
          </Link>
        </div>

        <button
          className="md:hidden p-2 text-ink"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <nav className="md:hidden border-t border-sage/40 bg-millet px-5 py-4 flex flex-col gap-4">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-ink hover:text-clay"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <Link href="/cart" className="text-sm font-medium text-ink hover:text-clay" onClick={() => setOpen(false)}>
            Cart
          </Link>
          <Link href="/login" className="text-sm font-medium text-cassava" onClick={() => setOpen(false)}>
            Farmer Login
          </Link>
          <Link
            href="/farmers/register"
            className="text-sm font-medium px-4 py-2 bg-clay text-millet rounded-full text-center"
            onClick={() => setOpen(false)}
          >
            Sell on KingBoost
          </Link>
        </nav>
      )}
    </header>
  );
}
