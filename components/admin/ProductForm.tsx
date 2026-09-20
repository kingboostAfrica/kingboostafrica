"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Category, Product } from "@/lib/types";
import { Field, ImageUploader, inputCls, slugify } from "@/components/admin/ui";
import { revalidateSite } from "@/lib/revalidate-client";

export default function ProductForm({
  categories,
  initial,
}: {
  categories: Category[];
  initial?: Product;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [images, setImages] = useState<string[]>(initial?.images ?? []);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: initial?.name ?? "",
    categoryId: initial?.category_id ?? "",
    description: initial?.description ?? "",
    price: initial ? String(initial.price) : "",
    unit: initial?.unit ?? "kg",
    stock: initial ? String(initial.stock) : "",
    isActive: initial?.is_active ?? true,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const price = parseFloat(form.price);
    const stock = parseInt(form.stock || "0", 10);
    if (!Number.isFinite(price) || price < 0 || !Number.isFinite(stock) || stock < 0) {
      setError("Price and stock must be valid, non-negative numbers.");
      setSubmitting(false);
      return;
    }

    const payload = {
      category_id: form.categoryId || null,
      name: form.name.trim(),
      description: form.description.trim() || null,
      price,
      unit: form.unit.trim() || "kg",
      stock,
      images,
      is_active: form.isActive,
    };

    const { error: saveError } = initial
      ? await supabase
          .from("products")
          .update({ ...payload, updated_at: new Date().toISOString() })
          .eq("id", initial.id)
      : await supabase.from("products").insert({ ...payload, slug: slugify(form.name) });

    if (saveError) {
      setError(saveError.message);
      setSubmitting(false);
      return;
    }

    revalidateSite();
    router.push("/admin/products");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Product name">
        <input
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className={inputCls}
        />
      </Field>

      <Field label="Category">
        <select
          required
          value={form.categoryId}
          onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
          className={inputCls}
        >
          <option value="">Select a category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {categories.length === 0 && (
          <p className="text-xs text-kb-charcoal/50 mt-1">
            No product categories yet — add one under Categories first.
          </p>
        )}
      </Field>

      <div className="grid grid-cols-3 gap-4">
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
        <Field label="Unit">
          <input
            value={form.unit}
            onChange={(e) => setForm({ ...form, unit: e.target.value })}
            placeholder="kg, bag, crate"
            className={inputCls}
          />
        </Field>
        <Field label="Stock">
          <input
            required
            type="number"
            min="0"
            step="1"
            value={form.stock}
            onChange={(e) => setForm({ ...form, stock: e.target.value })}
            className={inputCls}
          />
        </Field>
      </div>

      <Field label="Description">
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={3}
          className={inputCls}
        />
      </Field>

      <Field label="Photos">
        <ImageUploader
          multiple
          value={images}
          onChange={setImages}
          onBusyChange={setUploading}
        />
      </Field>

      {initial && (
        <label className="flex items-center gap-2 text-sm text-kb-charcoal">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
          />
          Visible in Food Mart
        </label>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting || uploading}
        className="w-full bg-kb-green text-white px-6 py-3 rounded-full font-medium hover:bg-kb-green-dark transition-colors disabled:opacity-60"
      >
        {submitting ? "Saving..." : initial ? "Save Changes" : "List Product"}
      </button>
    </form>
  );
}
