"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { Pause, Play } from "lucide-react";

export type HeroItem = { id: string; slug: string; name: string; price: number; unit: string; image: string };

const QUERY = "(prefers-reduced-motion: reduce)";
const subscribe = (cb: () => void) => {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

const ROTATE_MS = 5500;

// The hero's visual: a shop window of real products with their prices, each one a link to its page.
// One tall card and two smaller ones. With more than three products it changes to the next three on its
// own, pauses while hovered or focused, has dots and a pause button, and stays still for people who have
// asked their device to reduce motion.
export default function HeroShopWindow({ products }: { products: HeroItem[] }) {
  // Split into sets of three (a last set is topped up from the start of the list).
  const sets: HeroItem[][] = [];
  for (let i = 0; i < products.length && sets.length < 3; i += 3) {
    const set = products.slice(i, i + 3);
    while (set.length < 3 && products.length >= 3) set.push(products[(i + set.length) % products.length]);
    if (set.length === 3 || sets.length === 0) sets.push(set);
  }
  const count = sets.length;

  const [index, setIndex] = useState(0);
  const [hover, setHover] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const reducedMotion = useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false
  );
  const playing = count > 1 && !hover && !userPaused && !reducedMotion;

  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => {
      if (!document.hidden) setIndex((i) => (i + 1) % count);
    }, ROTATE_MS);
    return () => clearInterval(timer);
  }, [playing, count]);

  const go = useCallback((i: number) => setIndex(((i % count) + count) % count), [count]);

  if (sets.length === 0 || sets[0].length === 0) return null;

  const tile = (p: HeroItem, sizes: string, priority: boolean, active: boolean) => (
    <Link
      key={p.id}
      href={`/products/${p.slug}`}
      tabIndex={active ? 0 : -1}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-kb-cream shadow-xl ring-1 ring-white/20 transition-transform duration-300 hover:-translate-y-1"
    >
      <div className="relative min-h-0 flex-1">
        <Image
          src={p.image}
          alt={p.name}
          fill
          sizes={sizes}
          priority={priority}
          className="object-contain p-2 transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </div>
      <div className="flex items-baseline justify-between gap-2 bg-kb-forest px-3.5 py-2.5 text-white">
        <span className="truncate text-sm font-semibold">{p.name}</span>
        <span className="shrink-0 text-sm font-bold text-kb-gold">
          ₦{p.price.toLocaleString()}
          {p.unit && <span className="text-xs font-medium text-white/70"> / {p.unit}</span>}
        </span>
      </div>
    </Link>
  );

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured products"
      className="relative"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocusCapture={() => setHover(true)}
      onBlurCapture={() => setHover(false)}
    >
      <div className="pointer-events-none absolute -bottom-4 -right-4 hidden h-full w-full rounded-3xl border-2 border-kb-gold/50 sm:block" aria-hidden="true" />

      {/* All sets sit on top of each other; the current one is visible and the rest fade out. */}
      <div className="relative grid h-[26rem] sm:h-[30rem] lg:h-[28rem]" aria-live={playing ? "off" : "polite"}>
        {sets.map((set, si) => {
          const active = si === index;
          const [main, ...rest] = set;
          return (
            <div
              key={si}
              inert={!active}
              aria-hidden={!active}
              className={`col-start-1 row-start-1 grid gap-3 transition-opacity duration-700 motion-reduce:transition-none ${
                rest.length > 0 ? "grid-cols-[1.15fr_1fr] grid-rows-2" : "grid-cols-1"
              } ${active ? "opacity-100" : "opacity-0"}`}
            >
              <div className={rest.length > 0 ? "row-span-2" : ""}>
                {tile(main, "(min-width: 1024px) 18rem, 55vw", si === 0, active)}
              </div>
              {rest.map((p) => (
                <div key={p.id}>{tile(p, "(min-width: 1024px) 15rem, 45vw", false, active)}</div>
              ))}
            </div>
          );
        })}
      </div>

      {count > 1 && (
        <div className="relative mt-4 flex items-center justify-center gap-3">
          <div className="flex gap-2" role="group" aria-label="Choose a set of products">
            {sets.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Show products ${i + 1} of ${count}`}
                aria-current={i === index}
                onClick={() => go(i)}
                className={`h-2 rounded-full transition-all ${i === index ? "w-6 bg-kb-gold" : "w-2 bg-white/50 hover:bg-white"}`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => setUserPaused((p) => !p)}
            aria-label={userPaused || reducedMotion ? "Play product rotation" : "Pause product rotation"}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-kb-gold hover:text-kb-forest"
          >
            {userPaused || reducedMotion ? <Play size={12} aria-hidden="true" /> : <Pause size={12} aria-hidden="true" />}
          </button>
        </div>
      )}
    </div>
  );
}
