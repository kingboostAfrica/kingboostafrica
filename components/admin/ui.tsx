"use client";

import { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { uploadMultipleToCloudinary } from "@/lib/cloudinary";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

export const inputCls =
  "w-full border border-kb-green/30 rounded-xl px-4 py-2.5 bg-white";

export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-kb-charcoal mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}

export function slugify(text: string, withSuffix = true) {
  const base = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return withSuffix ? `${base}-${Math.random().toString(36).slice(2, 7)}` : base;
}

// Uploads to Cloudinary (unsigned preset) and reports the resulting URLs.
export function ImageUploader({
  value,
  onChange,
  multiple = false,
  onBusyChange,
}: {
  value: string[];
  onChange: (urls: string[]) => void;
  multiple?: boolean;
  onBusyChange?: (busy: boolean) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files || []);
    e.target.value = "";
    if (picked.length === 0) return;

    // Only real web photos, and not huge ones. (Cloudinary has its own limits too.)
    const files = picked.filter((f) => ALLOWED_TYPES.includes(f.type) && f.size <= MAX_BYTES);
    const rejected = picked.length - files.length;
    setError(
      rejected > 0
        ? `${rejected} file${rejected === 1 ? " was" : "s were"} skipped. Use JPG, PNG or WebP photos under 10 MB.`
        : ""
    );
    if (files.length === 0) return;

    setUploading(true);
    onBusyChange?.(true);
    try {
      const urls = await uploadMultipleToCloudinary(files);
      onChange(multiple ? [...value, ...urls] : urls.slice(0, 1));
    } catch {
      setError("Image upload failed. Check your connection and try again.");
    } finally {
      setUploading(false);
      onBusyChange?.(false);
    }
  }

  return (
    <div>
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple={multiple}
        onChange={handleChange}
        disabled={uploading}
        className="w-full text-sm"
      />
      {uploading && (
        <p className="text-xs text-kb-charcoal/50 mt-1">Uploading...</p>
      )}
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
      {value.length > 0 && (
        <div className="flex gap-2 mt-3 flex-wrap">
          {value.map((url, i) => (
            <div
              key={url}
              className="relative w-16 h-16 rounded-lg overflow-hidden"
            >
              <Image src={url} alt="" fill className="object-cover" />
              <button
                type="button"
                onClick={() => onChange(value.filter((_, idx) => idx !== i))}
                className="absolute top-0.5 right-0.5 bg-kb-charcoal/70 text-white rounded-full p-0.5"
                aria-label="Remove image"
              >
                <X size={10} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
