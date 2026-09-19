"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Category } from "@/lib/types";
import DeleteButton from "@/components/admin/DeleteButton";
import { inputCls, slugify } from "@/components/admin/ui";

const TYPE_LABEL: Record<Category["type"], string> = {
  product: "Food Mart",
  gallery: "Gallery",
  both: "Food Mart + Gallery",
};

export default function CategoryManager({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const supabase = createClient();
  const [name, setName] = useState("");
  const [type, setType] = useState<Category["type"]>("product");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    setSaving(true);
    setError("");

    const { error: insError } = await supabase
      .from("categories")
      .insert({ name: trimmed, slug: slugify(trimmed, false), type });

    setSaving(false);
    if (insError) {
      setError(
        insError.code === "23505"
          ? "A category with that name already exists."
          : insError.message
      );
      return;
    }
    setName("");
    router.refresh();
  }

  return (
    <div>
      <form onSubmit={handleAdd} className="flex flex-wrap gap-3 items-end mb-10">
        <div className="flex-1 min-w-48">
          <label className="block text-sm font-medium text-kb-charcoal mb-1">New category</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Grains & Tubers"
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-kb-charcoal mb-1">Used for</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as Category["type"])}
            className={inputCls}
          >
            <option value="product">Food Mart</option>
            <option value="gallery">Gallery</option>
            <option value="both">Both</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="bg-kb-green text-white px-6 py-2.5 rounded-full font-medium hover:bg-kb-green-dark transition-colors disabled:opacity-60"
        >
          {saving ? "Adding..." : "Add"}
        </button>
        {error && <p className="w-full text-sm text-red-600">{error}</p>}
      </form>

      {categories.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-kb-green/30 rounded-2xl">
          <p className="text-kb-charcoal/60">No categories yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {categories.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between gap-4 p-4 border border-kb-green/15 rounded-2xl"
            >
              <div>
                <p className="font-medium text-kb-charcoal">{c.name}</p>
                <p className="text-xs text-kb-charcoal/50">
                  {TYPE_LABEL[c.type] ?? c.type} · /{c.slug}
                </p>
              </div>
              <DeleteButton
                table="categories"
                id={c.id}
                confirmText="Delete this category?"
                inUseMessage="Still used by products or photos. Move or remove those first."
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
