"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";

// On every admin page except the dashboard itself: one clear way back to all the tools.
export default function AdminBackBar({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  if (!isAdmin || pathname === "/admin") return null;
  return (
    <div className="border-b border-kb-forest/10 bg-white">
      <div className="mx-auto max-w-6xl px-5 py-2.5">
        <Link href="/admin" className="inline-flex items-center gap-1.5 text-sm font-semibold text-kb-green hover:underline">
          <ArrowLeft size={15} aria-hidden="true" /> Back to dashboard
        </Link>
      </div>
    </div>
  );
}
