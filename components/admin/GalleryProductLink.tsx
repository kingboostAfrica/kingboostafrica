"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { revalidateSite } from "@/lib/revalidate-client";

export default function GalleryProductLink({
  galleryItemId,
  productId,
  products,
}: {
  galleryItemId: string;
  productId: string | null;
  products: { id: string; name: string }[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const [value, setValue] = useState(productId ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function change(next: string) {
    setValue(next);
    setBusy(true);
    setError("");
    const { error: err } = await supabase
      .from("gallery_items")
      .update({ product_id: next || null })
      .eq("id", galleryItemId);
    setBusy(false);
    if (err) return setError(err.message);
    revalidateSite();
    router.refresh();
  }

  return (
    <div>
      <select
        value={value}
        onChange={(e) => change(e.target.value)}
        disabled={busy}
        className="w-full rounded-lg border border-kb-forest/25 bg-white px-2 py-1.5 text-xs disabled:opacity-60"
      >
        <option value="">Not linked to a product</option>
        {products.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-[11px] text-red-600">{error}</p>}
    </div>
  );
}
