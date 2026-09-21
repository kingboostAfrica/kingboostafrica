"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { SOCIAL_PLATFORMS, isValidSocialUrl } from "@/lib/social";
import { inputCls } from "@/components/admin/ui";
import { revalidateSite } from "@/lib/revalidate-client";
import SocialIcons from "@/components/SocialIcons";

export type SocialRow = { platform: string; url: string; is_active: boolean };

export default function SocialLinksManager({ rows }: { rows: SocialRow[] }) {
  const router = useRouter();
  const supabase = createClient();
  const initial = Object.fromEntries(
    SOCIAL_PLATFORMS.map((p) => {
      const r = rows.find((x) => x.platform === p.key);
      return [p.key, { url: r?.url ?? "", active: r?.is_active ?? true }];
    })
  );
  const [values, setValues] = useState<Record<string, { url: string; active: boolean }>>(initial);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const set = (key: string, patch: Partial<{ url: string; active: boolean }>) =>
    setValues((v) => ({ ...v, [key]: { ...v[key], ...patch } }));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    const bad = SOCIAL_PLATFORMS.find((p) => values[p.key].url.trim() && !isValidSocialUrl(values[p.key].url.trim()));
    if (bad) {
      setMessage({ ok: false, text: `The ${bad.label} address must start with https:// and be a full web address.` });
      return;
    }

    setSaving(true);
    const toSave = SOCIAL_PLATFORMS.filter((p) => values[p.key].url.trim()).map((p) => ({
      platform: p.key,
      url: values[p.key].url.trim(),
      is_active: values[p.key].active,
      updated_at: new Date().toISOString(),
    }));
    const toRemove = SOCIAL_PLATFORMS.filter((p) => !values[p.key].url.trim()).map((p) => p.key);

    const up = toSave.length ? await supabase.from("social_links").upsert(toSave) : { error: null };
    const del = toRemove.length ? await supabase.from("social_links").delete().in("platform", toRemove) : { error: null };
    setSaving(false);

    const error = up.error ?? del.error;
    if (error) return setMessage({ ok: false, text: error.message });
    revalidateSite();
    router.refresh();
    setMessage({ ok: true, text: "Saved. The icons on the website are updated." });
  }

  const preview = SOCIAL_PLATFORMS.filter((p) => values[p.key].url.trim() && values[p.key].active && isValidSocialUrl(values[p.key].url.trim())).map(
    (p) => ({ platform: p.key, url: values[p.key].url.trim() })
  );

  return (
    <form onSubmit={save}>
      <div className="mb-8 rounded-xl bg-kb-forest p-5">
        <p className="mb-3 text-sm font-semibold text-white">How it will look in the footer</p>
        {preview.length > 0 ? (
          <SocialIcons links={preview} tone="light" />
        ) : (
          <p className="text-sm text-white/60">No icons yet. Add at least one address below.</p>
        )}
      </div>

      <div className="space-y-3">
        {SOCIAL_PLATFORMS.map((p) => (
          <div key={p.key} className="grid gap-3 rounded-xl border border-kb-forest/15 p-4 sm:grid-cols-[9rem_1fr_auto] sm:items-center">
            <label htmlFor={`sm-${p.key}`} className="font-semibold text-kb-charcoal">
              {p.label}
            </label>
            <input
              id={`sm-${p.key}`}
              type="url"
              value={values[p.key].url}
              onChange={(e) => set(p.key, { url: e.target.value })}
              placeholder={p.placeholder}
              className={inputCls}
            />
            <label className="flex items-center gap-2 text-sm text-kb-charcoal/70">
              <input
                type="checkbox"
                checked={values[p.key].active}
                onChange={(e) => set(p.key, { active: e.target.checked })}
                className="h-4 w-4 accent-[#2E7D32]"
              />
              Show
            </label>
          </div>
        ))}
      </div>

      {message && (
        <p className={`mt-5 text-sm font-semibold ${message.ok ? "text-kb-green" : "text-red-600"}`}>{message.text}</p>
      )}
      <button type="submit" disabled={saving} className="btn btn-primary mt-5 disabled:opacity-60">
        {saving ? "Saving..." : "Save social media links"}
      </button>
    </form>
  );
}
