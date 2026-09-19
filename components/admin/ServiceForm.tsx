"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { ConsultingService } from "@/lib/types";
import { Field, ImageUploader, inputCls, slugify } from "@/components/admin/ui";

export default function ServiceForm({ initial }: { initial?: ConsultingService }) {
  const router = useRouter();
  const supabase = createClient();
  const [images, setImages] = useState<string[]>(initial?.image_url ? [initial.image_url] : []);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: initial?.title ?? "",
    summary: initial?.summary ?? "",
    description: initial?.description ?? "",
    priceFrom: initial?.price_from != null ? String(initial.price_from) : "",
    isActive: initial?.is_active ?? true,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const priceFrom = form.priceFrom ? parseFloat(form.priceFrom) : null;
    if (priceFrom !== null && (!Number.isFinite(priceFrom) || priceFrom < 0)) {
      setError("Starting price must be a valid, non-negative number.");
      setSubmitting(false);
      return;
    }

    const payload = {
      title: form.title.trim(),
      summary: form.summary.trim() || null,
      description: form.description.trim() || null,
      price_from: priceFrom,
      image_url: images[0] ?? null,
      is_active: form.isActive,
    };

    const { error: saveError } = initial
      ? await supabase
          .from("consulting_services")
          .update({ ...payload, updated_at: new Date().toISOString() })
          .eq("id", initial.id)
      : await supabase
          .from("consulting_services")
          .insert({ ...payload, slug: slugify(form.title) });

    if (saveError) {
      setError(saveError.message);
      setSubmitting(false);
      return;
    }

    router.push("/admin/consulting");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Service title">
        <input
          required
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className={inputCls}
        />
      </Field>
      <Field label="Short summary">
        <input
          value={form.summary}
          onChange={(e) => setForm({ ...form, summary: e.target.value })}
          className={inputCls}
        />
      </Field>
      <Field label="Starting price (₦, optional)">
        <input
          type="number"
          min="0"
          step="0.01"
          value={form.priceFrom}
          onChange={(e) => setForm({ ...form, priceFrom: e.target.value })}
          className={inputCls}
        />
      </Field>
      <Field label="Full description">
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={4}
          className={inputCls}
        />
      </Field>
      <Field label="Cover image">
        <ImageUploader value={images} onChange={setImages} onBusyChange={setUploading} />
      </Field>

      {initial && (
        <label className="flex items-center gap-2 text-sm text-kb-charcoal">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
          />
          Visible on the Consulting page
        </label>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting || uploading}
        className="w-full bg-kb-green text-white px-6 py-3 rounded-full font-medium hover:bg-kb-green-dark transition-colors disabled:opacity-60"
      >
        {submitting ? "Saving..." : initial ? "Save Changes" : "Publish Service"}
      </button>
    </form>
  );
}
