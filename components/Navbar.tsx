"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X, ShoppingBasket, ChevronDown } from "lucide-react";
import { useCart } from "@/lib/cart-context";

const services = [
  { href: "/food-mart", label: "Food Mart" },
  { href: "/academy", label: "Academy" },
  { href: "/consulting", label: "Consulting" },
  { href: "/agritech", label: "Agritech" },
  { href: "/organics", label: "Organics" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const { count } = useCart();

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-kb-green/15">
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image
            src="/logo-icon.png"
            alt="KingBoostFarms"
            width={40}
            height={40}
            priority
            className="h-9 w-9 object-contain"
          />
          <span className="font-display text-lg font-bold text-kb-green tracking-tight">
            KingBoost<span className="text-kb-gold">Farms</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-7">
          <div
            className="relative"
            onMouseEnter={() => setServicesOpen(true)}
            onMouseLeave={() => setServicesOpen(false)}
          >
            <button
              className="flex items-center gap-1 text-sm font-medium text-kb-charcoal hover:text-kb-green transition-colors"
              onClick={() => setServicesOpen((v) => !v)}
              aria-expanded={servicesOpen}
            >
              Services
              <ChevronDown
                size={14}
                className={`transition-transform ${servicesOpen ? "rotate-180" : ""}`}
              />
            </button>

            {servicesOpen && (
              <div className="absolute top-full left-0 pt-3 w-56">
                <div className="bg-white border border-kb-green/15 rounded-xl shadow-lg py-2">
                  {services.map((s) => (
                    <Link
                      key={s.href}
                      href={s.href}
                      className="block px-4 py-2.5 text-sm font-medium text-kb-charcoal hover:bg-kb-green/5 hover:text-kb-green transition-colors"
                      onClick={() => setServicesOpen(false)}
                    >
                      {s.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Link
            href="/about"
            className="text-sm font-medium text-kb-charcoal hover:text-kb-green transition-colors"
          >
            About
          </Link>
        </nav>

        <div className="hidden lg:flex items-center gap-4">
          <Link
            href="/cart"
            aria-label="View cart"
            className="relative p-2 text-kb-charcoal hover:text-kb-green transition-colors"
          >
            <ShoppingBasket size={20} />
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-kb-gold text-white text-[10px] font-semibold w-4 h-4 rounded-full flex items-center justify-center">
                {count}
              </span>
            )}
          </Link>
          <Link
            href="/contact"
            className="text-sm font-medium px-4 py-2 bg-kb-green text-white rounded-full hover:bg-kb-green-dark transition-colors"
          >
            Contact Us
          </Link>
        </div>

        <button
          className="lg:hidden p-2 text-kb-charcoal"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <nav className="lg:hidden border-t border-kb-green/15 bg-white px-5 py-4 flex flex-col gap-1">
          <button
            className="flex items-center justify-between text-sm font-medium text-kb-charcoal hover:text-kb-green py-2"
            onClick={() => setMobileServicesOpen((v) => !v)}
            aria-expanded={mobileServicesOpen}
          >
            Services
            <ChevronDown
              size={16}
              className={`transition-transform ${mobileServicesOpen ? "rotate-180" : ""}`}
            />
          </button>
          {mobileServicesOpen && (
            <div className="pl-4 flex flex-col gap-3 pb-2">
              {services.map((s) => (
                <Link
                  key={s.href}
                  href={s.href}
                  className="text-sm text-kb-charcoal/80 hover:text-kb-green"
                  onClick={() => setOpen(false)}
                >
                  {s.label}
                </Link>
              ))}
            </div>
          )}

          <Link
            href="/about"
            className="text-sm font-medium text-kb-charcoal hover:text-kb-green py-2"
            onClick={() => setOpen(false)}
          >
            About
          </Link>
          <Link
            href="/cart"
            className="text-sm font-medium text-kb-charcoal hover:text-kb-green py-2"
            onClick={() => setOpen(false)}
          >
            Cart
          </Link>
          <Link
            href="/contact"
            className="text-sm font-medium px-4 py-2.5 bg-kb-green text-white rounded-full text-center mt-2"
            onClick={() => setOpen(false)}
          >
            Contact Us
          </Link>
        </nav>
      )}
    </header>
  );
}
