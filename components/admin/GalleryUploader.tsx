"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Category } from "@/lib/types";
import { Field, ImageUploader, inputCls } from "@/components/admin/ui";

export default function GalleryUploader({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const supabase = createClient();
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [caption, setCaption] = useState("");

  async function handlePublish() {
    if (images.length === 0) return;
    setSaving(true);
    setError("");

    const { error: insError } = await supabase.from("gallery_items").insert(
      images.map((url) => ({
        image_url: url,
        caption: caption.trim() || null,
        category_id: categoryId || null,
      }))
    );

    setSaving(false);
    if (insError) {
      setError(insError.message);
      return;
    }
    setImages([]);
    setCaption("");
    router.refresh();
  }

  return (
    <div className="p-6 border border-kb-green/15 rounded-2xl space-y-4">
      <h2 className="font-display text-lg font-bold text-kb-charcoal">Add photos</h2>

      <Field label="Photos (you can pick several at once)">
        <ImageUploader multiple value={images} onChange={setImages} onBusyChange={setUploading} />
      </Field>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Category (optional)">
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className={inputCls}
          >
            <option value="">Uncategorised</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Caption (optional, applied to all)">
          <input value={caption} onChange={(e) => setCaption(e.target.value)} className={inputCls} />
        </Field>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        onClick={handlePublish}
        disabled={images.length === 0 || uploading || saving}
        className="bg-kb-green text-white px-6 py-3 rounded-full font-medium hover:bg-kb-green-dark transition-colors disabled:opacity-60"
      >
        {saving ? "Publishing..." : `Publish ${images.length || ""} photo${images.length === 1 ? "" : "s"}`}
      </button>
    </div>
  );
}
