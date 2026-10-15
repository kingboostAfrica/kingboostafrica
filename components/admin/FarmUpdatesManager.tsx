"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { revalidateSite } from "@/lib/revalidate-client";
import { Field, ImageUploader, inputCls } from "@/components/admin/ui";
import DeleteButton from "@/components/admin/DeleteButton";

export type AdminUpdate = {
  id: string;
  title: string;
  body: string | null;
  image_url: string | null;
  is_published: boolean;
  published_at: string;
};

function Row({ update }: { update: AdminUpdate }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function togglePublished() {
    setBusy(true);
    setError("");
    const { error: err } = await createClient().from("farm_updates").update({ is_published: !update.is_published }).eq("id", update.id);
    setBusy(false);
    if (err) return setError(err.message);
    revalidateSite();
    router.refresh();
  }

  return (
    <li className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-kb-forest/15 bg-white p-4">
      <div className="flex min-w-0 items-center gap-3">
        {update.image_url && (
          <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg">
            <Image src={update.image_url} alt="" fill sizes="56px" className="object-cover" />
          </span>
        )}
        <div className="min-w-0">
          <p className="flex items-center gap-2 font-semibold text-kb-charcoal">
            <span className="truncate">{update.title}</span>
            {!update.is_published && (
              <span className="rounded-full bg-kb-charcoal/10 px-2 py-0.5 text-[10px] font-semibold text-kb-charcoal/60">HIDDEN</span>
            )}
          </p>
          <p className="text-xs text-kb-charcoal/50">{new Date(update.published_at).toLocaleDateString("en-NG")}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button type="button" disabled={busy} onClick={togglePublished} className="rounded-full border border-kb-forest/25 px-3 py-1.5 text-xs font-medium hover:bg-kb-mist disabled:opacity-50">
          {update.is_published ? "Hide" : "Publish"}
        </button>
        <DeleteButton table="farm_updates" id={update.id} confirmText={`Delete "${update.title}"? This cannot be undone.`} />
      </div>
      {error && <p className="w-full text-xs text-red-600">{error}</p>}
    </li>
  );
}

export default function FarmUpdatesManager({ updates }: { updates: AdminUpdate[] }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return setError("Please add a title.");
    setSaving(true);
    setError("");
    const { error: err } = await createClient().from("farm_updates").insert({
      title: title.trim().slice(0, 200),
      body: body.trim() || null,
      image_url: images[0] ?? null,
      published_at: new Date(`${date}T12:00:00`).toISOString(),
      is_published: true,
    });
    setSaving(false);
    if (err) return setError(err.message);
    setTitle("");
    setBody("");
    setImages([]);
    revalidateSite();
    router.refresh();
  }

  return (
    <div className="space-y-10">
      <form onSubmit={add} className="space-y-4 rounded-2xl border border-kb-green/15 p-6">
        <h2 className="font-display text-xl font-bold text-kb-forest">Post a new update</h2>
        <Field label="Title">
          <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} className={inputCls} placeholder="e.g. Plantain harvest begins" />
        </Field>
        <Field label="Message (leave a blank line between paragraphs)">
          <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={5} className={inputCls} />
        </Field>
        <Field label="Date">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
        </Field>
        <Field label="Photo (optional)">
          <ImageUploader value={images} onChange={setImages} onBusyChange={setUploading} />
        </Field>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={saving || uploading} className="btn btn-primary disabled:opacity-60">
          {saving ? "Publishing..." : "Publish update"}
        </button>
      </form>

      <section>
        <h2 className="mb-3 font-display text-xl font-bold text-kb-forest">
          Your updates <span className="text-base font-normal text-kb-charcoal/50">({updates.length})</span>
        </h2>
        {updates.length === 0 ? (
          <p className="text-sm text-kb-charcoal/50">Nothing posted yet.</p>
        ) : (
          <ul className="space-y-3">
            {updates.map((u) => (
              <Row key={u.id} update={u} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
