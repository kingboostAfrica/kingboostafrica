"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Menu,
  X,
  ShoppingBasket,
  Mail,
  MapPin,
  ShoppingCart,
  GraduationCap,
  Briefcase,
  Cpu,
  Leaf,
  ArrowRight,
} from "lucide-react";
import { useCart } from "@/lib/cart-context";

const verticals = [
  { href: "/food-mart", label: "Food Mart", desc: "Fresh, natural produce", icon: ShoppingCart },
  { href: "/academy", label: "Academy", desc: "Agribusiness training", icon: GraduationCap },
  { href: "/consulting", label: "Consulting", desc: "Expert farm advisory", icon: Briefcase },
  { href: "/agritech", label: "Agritech", desc: "Technology for farming", icon: Cpu },
  { href: "/organics", label: "Organics", desc: "Certified organic solutions", icon: Leaf },
];

const secondary = [
  { href: "/gallery", label: "Gallery" },
  { href: "/about", label: "About" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { count } = useCart();
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const close = () => setOpen(false);

  if (pathname.startsWith("/admin")) return null;

  return (
    <>
      {/* Utility bar */}
      <div className="hidden bg-kb-forest text-white/80 sm:block">
        <div className="mx-auto flex h-9 max-w-6xl items-center justify-between px-5 text-xs">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5">
              <MapPin size={13} className="text-kb-gold" aria-hidden="true" />
              Igbanko, Badagry, Lagos
            </span>
            <a
              href="mailto:kingboost.africa@gmail.com"
              className="flex items-center gap-1.5 hover:text-white"
            >
              <Mail size={13} className="text-kb-gold" aria-hidden="true" />
              kingboost.africa@gmail.com
            </a>
          </div>
          <p className="hidden font-display italic text-white/70 md:block">
            Cultivating Growth, Nourishing Nations
          </p>
        </div>
      </div>

      <header className="sticky top-0 z-50 border-b border-kb-forest/10 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-[4.5rem] max-w-6xl items-center justify-between gap-6 px-5">
          <Link href="/" className="flex shrink-0 items-center gap-3" aria-label="KingBoostFarms home" onClick={close}>
            <Image
              src="/kingboost-icon.png"
              alt=""
              width={40}
              height={56}
              priority
              className="h-12 w-auto sm:h-14"
            />
            <Image
              src="/kingboost-wordmark.png"
              alt="KingBoost Farms Ltd."
              width={170}
              height={36}
              priority
              className="h-7 w-auto sm:h-9"
            />
          </Link>

          <nav className="hidden items-center gap-1 xl:flex" aria-label="Main">
            {[...verticals, ...secondary].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                aria-current={isActive(l.href) ? "page" : undefined}
                className={`relative px-3 py-2 text-[0.9375rem] font-semibold transition-colors ${
                  isActive(l.href) ? "text-kb-green" : "text-kb-charcoal hover:text-kb-green"
                }`}
              >
                {l.label}
                {isActive(l.href) && (
                  <span className="absolute inset-x-3 -bottom-[1.05rem] h-[3px] rounded-full bg-kb-gold" />
                )}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/cart"
              aria-label={count > 0 ? `View cart, ${count} item${count === 1 ? "" : "s"}` : "View cart"}
              className="relative rounded-lg p-2.5 text-kb-charcoal transition-colors hover:bg-kb-mist hover:text-kb-green"
            >
              <ShoppingBasket size={22} />
              {count > 0 && (
                <span className="absolute right-0.5 top-0.5 flex h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-full bg-kb-gold px-1 text-[10px] font-bold text-kb-forest">
                  {count}
                </span>
              )}
            </Link>
            <Link href="/contact" className="btn btn-primary hidden !px-5 !py-2.5 xl:inline-flex">
              Contact us
            </Link>
            <button
              className="rounded-lg p-2.5 text-kb-charcoal hover:bg-kb-mist xl:hidden"
              onClick={() => setOpen(!open)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="mobile-menu"
            >
              {open ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {open && (
          <nav
            id="mobile-menu"
            aria-label="Mobile"
            className="max-h-[calc(100dvh-4.5rem)] overflow-y-auto border-t border-kb-forest/10 bg-white xl:hidden"
          >
            <div className="mx-auto max-w-6xl px-5 py-5">
              <ul className="grid gap-1 sm:grid-cols-2">
                {verticals.map((v) => (
                  <li key={v.href}>
                    <Link
                      href={v.href}
                      onClick={close}
                      className={`flex items-center gap-4 rounded-lg px-3 py-3 ${
                        isActive(v.href) ? "bg-kb-mist" : "hover:bg-kb-mist"
                      }`}
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-kb-forest text-kb-gold">
                        <v.icon size={20} aria-hidden="true" />
                      </span>
                      <span>
                        <span className="block font-semibold text-kb-charcoal">{v.label}</span>
                        <span className="block text-sm text-kb-charcoal/60">{v.desc}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-kb-forest/10 pt-4">
                {secondary.map((l) => (
                  <Link key={l.href} href={l.href} onClick={close} className="py-2 font-semibold text-kb-charcoal hover:text-kb-green">
                    {l.label}
                  </Link>
                ))}
                <Link href="/cart" onClick={close} className="py-2 font-semibold text-kb-charcoal hover:text-kb-green">
                  Cart{count > 0 ? ` (${count})` : ""}
                </Link>
                <Link href="/contact" onClick={close} className="btn btn-primary ml-auto">
                  Contact us <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </div>
            </div>
          </nav>
        )}
      </header>
    </>
  );
}
