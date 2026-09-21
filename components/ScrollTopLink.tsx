"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import type { MouseEvent, ReactNode } from "react";

// Smoothly scrolls the page back to the top (people who ask their device for less motion get an instant jump).
export function scrollToTop() {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
}

// Set when a footer link is clicked, so the page can glide up again the moment the new page appears
// (the browser cancels the first glide when the page content is swapped).
let pendingScroll = false;

// Place once (in the footer). It finishes the job after a footer link changes the page.
export function ScrollAfterNavigation() {
  const pathname = usePathname();
  useEffect(() => {
    if (pendingScroll && window.scrollY > 0) scrollToTop();
    pendingScroll = false;
  }, [pathname]);
  return null;
}

// Internal link used in the footer. Whether it goes to another page or to the page you are already on,
// the browser glides smoothly up to the very top.
// (We do this ourselves and switch off Next.js' own scroll-to-top for these links, because with smooth
// scrolling Next.js stops a little short of the top, underneath the sticky header.)
export default function ScrollTopLink({
  href,
  className,
  children,
  ariaLabel,
}: {
  href: string;
  className?: string;
  children: ReactNode;
  ariaLabel?: string;
}) {
  function handleClick(e: MouseEvent<HTMLAnchorElement>) {
    // Ctrl/Cmd/Shift-click opens a new tab or window: leave this page alone.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    pendingScroll = true;
    scrollToTop();
  }
  return (
    <Link href={href} scroll={false} className={className} aria-label={ariaLabel} onClick={handleClick}>
      {children}
    </Link>
  );
}
