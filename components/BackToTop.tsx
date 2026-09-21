"use client";

import { ArrowUp } from "lucide-react";
import { scrollToTop } from "@/components/ScrollTopLink";

export default function BackToTop() {
  return (
    <button
      type="button"
      onClick={scrollToTop}
      className="inline-flex items-center gap-1.5 rounded-full border border-white/25 px-3 py-1.5 text-xs font-semibold text-white/80 transition-colors hover:border-kb-gold hover:bg-kb-gold hover:text-kb-forest"
    >
      <ArrowUp size={14} aria-hidden="true" /> Back to top
    </button>
  );
}
