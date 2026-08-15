"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { uploadToCloudinary } from "@/lib/cloudinary";
import type { Farmer } from "@/lib/types";

export default function ProfilePage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    bio: "",
    location: "",
    state: "",
    phone: "",
    photoUrl: "",
  });

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("farmers")
        .select("*")
        .eq("id", user.id)
        .single();

      const f = data as Farmer | null;
      if (f) {
        setForm({
          fullName: f.full_name || "",
          bio: f.bio || "",
          location: f.location || "",
          state: f.state || "",
          phone: f.phone || "",
          photoUrl: f.photo_url || "",
        });
      }
      setLoading(false);
    }
    load();
  }, [supabase]);

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      setForm((f) => ({ ...f, photoUrl: url }));
    } catch {
      setError("Photo upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in.");

      const { error: updateError } = await supabase
        .from("farmers")
        .update({
          full_name: form.fullName,
          bio: form.bio || null,
          location: form.location || null,
          state: form.state || null,
          phone: form.phone || null,
          photo_url: form.photoUrl || null,
        })
        .eq("id", user.id);

      if (updateError) throw updateError;
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="max-w-xl mx-auto px-5 py-24 text-center text-ink/50">Loading...</div>;
  }

  return (
    <div className="max-w-xl mx-auto px-5 py-12">
      <h1 className="font-display text-3xl font-semibold text-ink mb-8">
        Your Profile
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-sage-light overflow-hidden relative shrink-0">
            {form.photoUrl && (
              <Image src={form.photoUrl} alt="" fill className="object-cover" />
            )}
          </div>
          <div>
            <input type="file" accept="image/*" onChange={handlePhotoChange} disabled={uploading} className="text-sm" />
            {uploading && <p className="text-xs text-ink/50 mt-1">Uploading...</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-1">Full name</label>
          <input
            required
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            className="w-full border border-sage rounded-xl px-4 py-2.5 bg-white/60"
          />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Location / Town</label>
            <input
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="w-full border border-sage rounded-xl px-4 py-2.5 bg-white/60"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">State</label>
            <input
              value={form.state}
              onChange={(e) => setForm({ ...form, state: e.target.value })}
              className="w-full border border-sage rounded-xl px-4 py-2.5 bg-white/60"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-ink mb-1">Phone</label>
          <input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full border border-sage rounded-xl px-4 py-2.5 bg-white/60"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink mb-1">Bio</label>
          <textarea
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            rows={3}
            className="w-full border border-sage rounded-xl px-4 py-2.5 bg-white/60"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {saved && <p className="text-sm text-cassava">Profile saved.</p>}

        <button
          type="submit"
          disabled={saving || uploading}
          className="w-full bg-cassava text-millet px-6 py-3 rounded-full font-medium hover:bg-cassava-dark transition-colors disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Profile"}
        </button>
      </form>
    </div>
  );
}
