"use client";

// Remembers which products the logged-in customer has hearted, so every heart button on the
// page can show the right state without asking the database again. Visitors who are not logged in
// simply have an empty wishlist, and are sent to the login page if they try to add something.
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface WishlistValue {
  ids: Set<string>;
  has: (productId: string) => boolean;
  toggle: (productId: string) => Promise<void>;
  loggedIn: boolean;
}

const WishlistContext = createContext<WishlistValue | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [userId, setUserId] = useState<string | null>(null);
  const [ids, setIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    async function load(uid: string | null) {
      if (cancelled) return;
      setUserId(uid);
      if (!uid) {
        setIds(new Set());
        return;
      }
      const { data } = await supabase.from("wishlist_items").select("product_id").eq("user_id", uid);
      if (!cancelled) setIds(new Set((data ?? []).map((r: { product_id: string }) => r.product_id)));
    }

    // getSession reads the saved login locally, so visitors who are not logged in cost no network call.
    supabase.auth.getSession().then(({ data }) => load(data.session?.user.id ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      // Defer so we never call Supabase from inside its own auth callback.
      setTimeout(() => load(session?.user.id ?? null), 0);
    });
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  const has = useCallback((productId: string) => ids.has(productId), [ids]);

  const toggle = useCallback(
    async (productId: string) => {
      if (!userId) {
        router.push(`/account/login?next=${encodeURIComponent(pathname || "/")}`);
        return;
      }
      const supabase = createClient();
      const wasSaved = ids.has(productId);
      // Update the heart straight away, undo if the database refuses.
      setIds((prev) => {
        const next = new Set(prev);
        if (wasSaved) next.delete(productId);
        else next.add(productId);
        return next;
      });
      const { error } = wasSaved
        ? await supabase.from("wishlist_items").delete().eq("user_id", userId).eq("product_id", productId)
        : await supabase.from("wishlist_items").insert({ user_id: userId, product_id: productId });
      if (error) {
        setIds((prev) => {
          const next = new Set(prev);
          if (wasSaved) next.add(productId);
          else next.delete(productId);
          return next;
        });
      }
    },
    [ids, userId, router, pathname]
  );

  const value = useMemo(() => ({ ids, has, toggle, loggedIn: Boolean(userId) }), [ids, has, toggle, userId]);
  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used inside WishlistProvider");
  return ctx;
}
