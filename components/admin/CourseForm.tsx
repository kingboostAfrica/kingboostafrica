"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Course } from "@/lib/types";
import { Field, ImageUploader, inputCls, slugify } from "@/components/admin/ui";
import { revalidateSite } from "@/lib/revalidate-client";

export default function CourseForm({ initial }: { initial?: Course }) {
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
    duration: initial?.duration ?? "",
    price: initial ? String(initial.price) : "",
    isActive: initial?.is_active ?? true,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const price = parseFloat(form.price || "0");
    if (!Number.isFinite(price) || price < 0) {
      setError("Price must be a valid, non-negative number.");
      setSubmitting(false);
      return;
    }

    const payload = {
      title: form.title.trim(),
      summary: form.summary.trim() || null,
      description: form.description.trim() || null,
      duration: form.duration.trim() || null,
      price,
      image_url: images[0] ?? null,
      is_active: form.isActive,
    };

    const { error: saveError } = initial
      ? await supabase
          .from("courses")
          .update({ ...payload, updated_at: new Date().toISOString() })
          .eq("id", initial.id)
      : await supabase.from("courses").insert({ ...payload, slug: slugify(form.title) });

    if (saveError) {
      setError(saveError.message);
      setSubmitting(false);
      return;
    }

    revalidateSite();
    router.push("/admin/courses");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Course title">
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
      <div className="grid grid-cols-2 gap-4">
        <Field label="Price (₦)">
          <input
            required
            type="number"
            min="0"
            step="0.01"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            className={inputCls}
          />
        </Field>
        <Field label="Duration">
          <input
            value={form.duration}
            onChange={(e) => setForm({ ...form, duration: e.target.value })}
            placeholder="e.g. 4 weeks"
            className={inputCls}
          />
        </Field>
      </div>
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
          Visible on the Academy page
        </label>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting || uploading}
        className="w-full bg-kb-green text-white px-6 py-3 rounded-full font-medium hover:bg-kb-green-dark transition-colors disabled:opacity-60"
      >
        {submitting ? "Saving..." : initial ? "Save Changes" : "Publish Course"}
      </button>
    </form>
  );
}
