"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { parseCsv, toCsv } from "@/lib/csv";
import { revalidateSite } from "@/lib/revalidate-client";
import type { Category } from "@/lib/types";

type Row = {
  line: number;
  name: string;
  category: string;
  price: string;
  unit: string;
  stock: string;
  description: string;
  errors: string[];
  categoryId: string | null;
};

const HEADERS = ["name", "category", "price", "unit", "stock", "description"];

function slugify(text: string) {
  const base = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `${base}-${Math.random().toString(36).slice(2, 7)}`;
}

export default function ProductImport({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const supabase = createClient();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);
  const catByName = new Map(categories.map((c) => [c.name.trim().toLowerCase(), c.id]));

  function downloadTemplate() {
    const csv = toCsv(HEADERS, [
      ["Long-grain parboiled rice", "Grains", "1450", "kg", "50", "Naturally grown, no additives."],
      ["Ripe plantain bunch", "Vegetables", "1500", "bunch", "20", ""],
    ]);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "kingboostfarms-product-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setResult(null);
    const reader = new FileReader();
    reader.onload = () => {
      const table = parseCsv(String(reader.result ?? ""));
      if (table.length === 0) {
        setResult({ ok: false, text: "That file has no rows." });
        return;
      }
      const header = table[0].map((h) => h.trim().toLowerCase());
      const idx = (name: string) => header.indexOf(name);
      const body = /name/.test(header[0] ?? "") ? table.slice(1) : table; // skip a header row if present

      const parsed: Row[] = body.map((cells, i) => {
        const get = (name: string, fallback: number) => (idx(name) >= 0 ? cells[idx(name)] : cells[fallback]) ?? "";
        const name = (get("name", 0) || "").trim();
        const category = (get("category", 1) || "").trim();
        const price = (get("price", 2) || "").trim();
        const unit = (get("unit", 3) || "kg").trim() || "kg";
        const stock = (get("stock", 4) || "0").trim();
        const description = (get("description", 5) || "").trim();

        const errors: string[] = [];
        if (!name) errors.push("missing name");
        const priceNum = parseFloat(price);
        if (!Number.isFinite(priceNum) || priceNum < 0) errors.push("invalid price");
        const stockNum = stock === "" ? 0 : parseInt(stock, 10);
        if (!Number.isFinite(stockNum) || stockNum < 0) errors.push("invalid stock");
        const categoryId = category ? catByName.get(category.toLowerCase()) ?? null : null;
        if (category && !categoryId) errors.push("category not found (will be uncategorised)");

        return { line: i + 2, name, category, price, unit, stock, description, errors, categoryId };
      });
      setRows(parsed);
    };
    reader.readAsText(file);
  }

  const importable = (rows ?? []).filter((r) => r.name && r.errors.every((e) => e.includes("uncategorised")));
  const blocked = (rows ?? []).filter((r) => !importable.includes(r));

  async function doImport() {
    if (importable.length === 0) return;
    setImporting(true);
    setResult(null);
    const payload = importable.map((r) => ({
      name: r.name,
      slug: slugify(r.name),
      category_id: r.categoryId,
      price: parseFloat(r.price),
      unit: r.unit,
      stock: parseInt(r.stock || "0", 10),
      description: r.description || null,
      is_active: true,
    }));
    const { error } = await supabase.from("products").insert(payload);
    setImporting(false);
    if (error) {
      setResult({ ok: false, text: error.message });
      return;
    }
    revalidateSite();
    setResult({ ok: true, text: `Imported ${payload.length} product${payload.length === 1 ? "" : "s"}.` });
    setRows(null);
    router.push("/admin/products");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <button onClick={downloadTemplate} className="btn btn-outline">
          <Download size={16} aria-hidden="true" /> Download CSV template
        </button>
        <label className="btn btn-primary cursor-pointer">
          <Upload size={16} aria-hidden="true" /> Choose CSV file
          <input type="file" accept=".csv,text/csv" onChange={handleFile} className="hidden" />
        </label>
      </div>

      {rows && (
        <div>
          <p className="mb-3 text-sm text-kb-charcoal/70">
            {importable.length} of {rows.length} row{rows.length === 1 ? "" : "s"} ready to import
            {blocked.length > 0 ? `, ${blocked.length} need fixing first` : ""}.
          </p>
          <div className="max-h-96 overflow-auto rounded-xl border border-kb-forest/15">
            <table className="w-full text-sm">
              <thead className="bg-kb-mist text-left text-xs uppercase tracking-wide text-kb-charcoal/50">
                <tr>
                  <th className="px-3 py-2 font-semibold">Line</th>
                  <th className="px-3 py-2 font-semibold">Name</th>
                  <th className="px-3 py-2 font-semibold">Category</th>
                  <th className="px-3 py-2 text-right font-semibold">Price</th>
                  <th className="px-3 py-2 font-semibold">Unit</th>
                  <th className="px-3 py-2 text-right font-semibold">Stock</th>
                  <th className="px-3 py-2 font-semibold">Notes</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.line} className={`border-t border-kb-forest/10 ${blocked.includes(r) ? "bg-red-50/60" : ""}`}>
                    <td className="px-3 py-2 text-kb-charcoal/50">{r.line}</td>
                    <td className="px-3 py-2 font-medium text-kb-charcoal">{r.name || "—"}</td>
                    <td className="px-3 py-2 text-kb-charcoal/70">{r.category || "—"}</td>
                    <td className="px-3 py-2 text-right text-kb-charcoal/70">{r.price}</td>
                    <td className="px-3 py-2 text-kb-charcoal/70">{r.unit}</td>
                    <td className="px-3 py-2 text-right text-kb-charcoal/70">{r.stock}</td>
                    <td className="px-3 py-2 text-xs text-red-600">{r.errors.join(", ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            onClick={doImport}
            disabled={importing || importable.length === 0}
            className="btn btn-primary mt-4 disabled:opacity-60"
          >
            {importing ? "Importing..." : `Import ${importable.length} product${importable.length === 1 ? "" : "s"}`}
          </button>
        </div>
      )}

      {result && (
        <p className={`text-sm font-semibold ${result.ok ? "text-kb-green" : "text-red-600"}`}>{result.text}</p>
      )}
    </div>
  );
}
