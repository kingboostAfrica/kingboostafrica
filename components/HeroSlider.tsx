"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

export type Slide = { src: string; alt: string; caption?: string | null };

const QUERY = "(prefers-reduced-motion: reduce)";
const subscribe = (cb: () => void) => {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

// Photo slider for the homepage hero: slides on its own every few seconds, pauses when you hover
// or touch it, has arrows, dots and a pause button, and does not move at all for people who have
// asked their device to reduce motion.
export default function HeroSlider({ slides }: { slides: Slide[] }) {
  const count = slides.length;
  const [index, setIndex] = useState(0);
  const [hover, setHover] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const reducedMotion = useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false
  );
  const touchX = useRef<number | null>(null);

  const go = useCallback((i: number) => setIndex(((i % count) + count) % count), [count]);
  const playing = count > 1 && !hover && !userPaused && !reducedMotion;

  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % count), 5500);
    return () => clearInterval(timer);
  }, [playing, count]);

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="KingBoostFarms photos"
      className="absolute inset-0"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocusCapture={() => setHover(true)}
      onBlurCapture={() => setHover(false)}
      onTouchStart={(e) => {
        touchX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        touchX.current = null;
        if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
      }}
    >
      <div
        className="flex h-full transition-transform duration-700 ease-out motion-reduce:transition-none"
        style={{ transform: `translateX(-${index * 100}%)` }}
        aria-live={playing ? "off" : "polite"}
      >
        {slides.map((s, i) => (
          <div
            key={s.src}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${count}`}
            aria-hidden={i !== index}
            className="relative h-full w-full shrink-0"
          >
            <Image
              src={s.src}
              alt={s.alt}
              fill
              priority={i === 0}
              loading={i === 0 || i === index || i === (index + 1) % count ? "eager" : "lazy"}
              sizes="(min-width: 1024px) 32rem, 90vw"
              className="object-cover"
            />
            {s.caption && (
              <p className="absolute inset-x-4 bottom-4 rounded-lg bg-kb-forest/80 px-3 py-2 text-sm text-white backdrop-blur">
                {s.caption}
              </p>
            )}
          </div>
        ))}
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(index - 1)}
            aria-label="Previous photo"
            className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-kb-forest/70 text-white backdrop-blur transition-colors hover:bg-kb-gold hover:text-kb-forest"
          >
            <ChevronLeft size={20} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => go(index + 1)}
            aria-label="Next photo"
            className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-kb-forest/70 text-white backdrop-blur transition-colors hover:bg-kb-gold hover:text-kb-forest"
          >
            <ChevronRight size={20} aria-hidden="true" />
          </button>

          <div className="absolute right-3 top-3">
            <button
              type="button"
              onClick={() => setUserPaused((p) => !p)}
              aria-label={userPaused ? "Play slideshow" : "Pause slideshow"}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-kb-forest/70 text-white backdrop-blur transition-colors hover:bg-kb-gold hover:text-kb-forest"
            >
              {userPaused || reducedMotion ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}
            </button>
          </div>

          <div className="absolute inset-x-0 bottom-3 flex justify-center gap-2" role="tablist" aria-label="Choose a photo">
            {slides.map((s, i) => (
              <button
                key={s.src}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Go to photo ${i + 1}`}
                onClick={() => go(i)}
                className={`h-2 rounded-full transition-all ${
                  i === index ? "w-6 bg-kb-gold" : "w-2 bg-white/60 hover:bg-white"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
