"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { X } from "lucide-react";

export default function NewConsultingServicePage() {
  const router = useRouter();
  const supabase = createClient();
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const [form, setForm] = useState({
    title: "",
    summary: "",
    description: "",
    priceFrom: "",
  });

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

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const url = await uploadToCloudinary(file);
      setImageUrl(url);
    } catch {
      setError("Image upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const { error: insertError } = await supabase.from("consulting_services").insert({
        title: form.title,
        slug: slugify(form.title),
        summary: form.summary || null,
        description: form.description || null,
        price_from: form.priceFrom ? parseFloat(form.priceFrom) : null,
        image_url: imageUrl || null,
      });

      if (insertError) throw insertError;

      router.push("/admin/consulting");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto px-5 py-12">
      <h1 className="font-display text-3xl font-bold text-kb-charcoal mb-8">
        New Consulting Service
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-kb-charcoal mb-1">Service title</label>
          <input
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full border border-kb-green/30 rounded-xl px-4 py-2.5 bg-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-kb-charcoal mb-1">Short summary</label>
          <input
            value={form.summary}
            onChange={(e) => setForm({ ...form, summary: e.target.value })}
            className="w-full border border-kb-green/30 rounded-xl px-4 py-2.5 bg-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-kb-charcoal mb-1">Starting price (₦, optional)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.priceFrom}
            onChange={(e) => setForm({ ...form, priceFrom: e.target.value })}
            className="w-full border border-kb-green/30 rounded-xl px-4 py-2.5 bg-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-kb-charcoal mb-1">Full description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={4}
            className="w-full border border-kb-green/30 rounded-xl px-4 py-2.5 bg-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-kb-charcoal mb-1">Cover image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            disabled={uploading}
            className="w-full text-sm"
          />
          {uploading && <p className="text-xs text-kb-charcoal/50 mt-1">Uploading...</p>}
          {imageUrl && (
            <div className="relative w-16 h-16 rounded-lg overflow-hidden mt-3">
              <Image src={imageUrl} alt="" fill className="object-cover" />
              <button
                type="button"
                onClick={() => setImageUrl("")}
                className="absolute top-0.5 right-0.5 bg-kb-charcoal/70 text-white rounded-full p-0.5"
              >
                <X size={10} />
              </button>
            </div>
          )}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting || uploading}
          className="w-full bg-kb-green text-white px-6 py-3 rounded-full font-medium hover:bg-kb-green-dark transition-colors disabled:opacity-60"
        >
          {submitting ? "Publishing..." : "Publish Service"}
        </button>
      </form>
    </div>
  );
}
