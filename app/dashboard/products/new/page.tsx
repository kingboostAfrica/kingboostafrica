"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { uploadMultipleToCloudinary } from "@/lib/cloudinary";
import type { Category } from "@/lib/types";
import { X } from "lucide-react";

export default function NewProductPage() {
  const router = useRouter();
  const supabase = createClient();
  const [categories, setCategories] = useState<Category[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    categoryId: "",
    description: "",
    price: "",
    unit: "kg",
    stock: "",
  });

  useEffect(() => {
    supabase
      .from("categories")
      .select("*")
      .in("type", ["product", "both"])
      .then(({ data }) => setCategories((data as Category[]) || []));
  }, [supabase]);

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    setError("");
    try {
      const urls = await uploadMultipleToCloudinary(files);
      setImages((prev) => [...prev, ...urls]);
    } catch {
      setError("Image upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  function slugify(text: string) {
    return (
      text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") +
      "-" +
      Math.random().toString(36).slice(2, 7)
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("You must be logged in.");

      const { error: insertError } = await supabase.from("products").insert({
        farmer_id: user.id,
        category_id: form.categoryId || null,
        name: form.name,
        slug: slugify(form.name),
        description: form.description || null,
        price: parseFloat(form.price),
        unit: form.unit,
        stock: parseInt(form.stock || "0", 10),
        images,
      });

      if (insertError) throw insertError;

      router.push("/dashboard/products");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto px-5 py-12">
      <h1 className="font-display text-3xl font-semibold text-ink mb-8">
        List a New Product
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-ink mb-1">
            Product name
          </label>
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border border-sage rounded-xl px-4 py-2.5 bg-white/60"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-1">
            Category
          </label>
          <select
            required
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            className="w-full border border-sage rounded-xl px-4 py-2.5 bg-white/60"
          >
            <option value="">Select a category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-1">
            <label className="block text-sm font-medium text-ink mb-1">
              Price (₦)
            </label>
            <input
              required
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="w-full border border-sage rounded-xl px-4 py-2.5 bg-white/60"
            />
          </div>
          <div className="col-span-1">
            <label className="block text-sm font-medium text-ink mb-1">
              Unit
            </label>
            <input
              value={form.unit}
              onChange={(e) => setForm({ ...form, unit: e.target.value })}
              placeholder="kg, bag, crate"
              className="w-full border border-sage rounded-xl px-4 py-2.5 bg-white/60"
            />
          </div>
          <div className="col-span-1">
            <label className="block text-sm font-medium text-ink mb-1">
              Stock
            </label>
            <input
              required
              type="number"
              min="0"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
              className="w-full border border-sage rounded-xl px-4 py-2.5 bg-white/60"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-1">
            Description
          </label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            className="w-full border border-sage rounded-xl px-4 py-2.5 bg-white/60"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-1">
            Photos
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            disabled={uploading}
            className="w-full text-sm"
          />
          {uploading && <p className="text-xs text-ink/50 mt-1">Uploading...</p>}
          {images.length > 0 && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {images.map((url, i) => (
                <div key={url} className="relative w-16 h-16 rounded-lg overflow-hidden">
                  <Image src={url} alt="" fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => setImages(images.filter((_, idx) => idx !== i))}
                    className="absolute top-0.5 right-0.5 bg-ink/70 text-millet rounded-full p-0.5"
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting || uploading}
          className="w-full bg-clay text-millet px-6 py-3 rounded-full font-medium hover:bg-clay-dark transition-colors disabled:opacity-60"
        >
          {submitting ? "Listing..." : "List Product"}
        </button>
      </form>
    </div>
  );
}
