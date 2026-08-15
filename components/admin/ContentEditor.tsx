"use client";

import { useState } from "react";
import type { ContentRow } from "@/lib/content";

export default function ContentEditor({
  initialRows,
}: {
  page: string;
  initialRows: ContentRow[];
}) {
  const [rows, setRows] = useState(initialRows);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  function update(id: string, field: "title" | "body" | "icon" | "image_url", value: string) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/content", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows }),
      });
      if (!res.ok) throw new Error("Save failed. Please try again.");
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  const sections = Array.from(new Set(rows.map((r) => r.section)));

  return (
    <div className="space-y-10 pb-24">
      {sections.map((section) => {
        const sectionRows = rows
          .filter((r) => r.section === section)
          .sort((a, b) => a.sort_order - b.sort_order);
        const showIcon = section !== "hero" && section !== "intro";

        return (
          <div key={section}>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-kb-gold-dark mb-4">
              {section.replace(/_/g, " ")}
            </h2>
            <div className="grid sm:grid-cols-2 gap-5">
              {sectionRows.map((row) => (
                <div key={row.id} className="p-5 border border-kb-green/15 rounded-2xl space-y-3">
                  <p className="text-xs text-kb-charcoal/40">{row.key}</p>

                  {showIcon && (
                    <div>
                      <label className="block text-xs font-medium text-kb-charcoal/60 mb-1">
                        Icon (lucide name, e.g. Leaf)
                      </label>
                      <input
                        value={row.icon ?? ""}
                        onChange={(e) => update(row.id, "icon", e.target.value)}
                        className="w-full border border-kb-green/30 rounded-lg px-3 py-2 text-sm"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-medium text-kb-charcoal/60 mb-1">
                      Title
                    </label>
                    <input
                      value={row.title ?? ""}
                      onChange={(e) => update(row.id, "title", e.target.value)}
                      className="w-full border border-kb-green/30 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-kb-charcoal/60 mb-1">
                      Body
                    </label>
                    <textarea
                      rows={4}
                      value={row.body ?? ""}
                      onChange={(e) => update(row.id, "body", e.target.value)}
                      className="w-full border border-kb-green/30 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-kb-charcoal/60 mb-1">
                      Image URL (optional)
                    </label>
                    <input
                      value={row.image_url ?? ""}
                      onChange={(e) => update(row.id, "image_url", e.target.value)}
                      placeholder="https://..."
                      className="w-full border border-kb-green/30 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-kb-green/15 px-5 py-4 flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-kb-green text-white px-6 py-3 rounded-full font-medium hover:bg-kb-green-dark transition-colors disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
        {saved && <span className="text-sm text-kb-green">Saved.</span>}
      </div>
    </div>
  );
}
