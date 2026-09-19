"use client";

import { usePathname } from "next/navigation";

// The admin area has its own header, so the public header/footer step aside there.
export default function HideOnAdmin({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;
  return <>{children}</>;
}
