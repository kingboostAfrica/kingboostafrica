"use client";

import { useState } from "react";
import { Plus, Send, Trash2 } from "lucide-react";

type Line = { name: string; unit: string; quantity: string };

export default function QuoteRequestForm() {
  const [lines, setLines] = useState<Line[]>([{ name: "", unit: "", quantity: "" }]);
  const [company, setCompany] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  function updateLine(i: number, patch: Partial<Line>) {
    setLines((ls) => ls.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  }
  function addLine() {
    if (lines.length >= 20) return;
    setLines((ls) => [...ls, { name: "", unit: "", quantity: "" }]);
  }
  function removeLine(i: number) {
    setLines((ls) => (ls.length > 1 ? ls.filter((_, idx) => idx !== i) : ls));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const items = lines
      .map((l) => ({ name: l.name.trim(), unit: l.unit.trim(), quantity: l.quantity }))
      .filter((l) => l.name && l.quantity);
    if (items.length === 0) {
      setError("Please list at least one item and quantity.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/quote-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          website,
          company_name: company,
          contact_name: contact,
          email,
          phone,
          message,
          items,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? "Something went wrong. Please try again.");
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="card rounded-lg bg-kb-mist p-6 font-semibold text-kb-green">
        Thank you — we have received your request and will get back to you with pricing shortly.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card relative space-y-6 p-6 sm:p-8">
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-kb-charcoal">Your name</label>
          <input required value={contact} onChange={(e) => setContact(e.target.value)} className="w-full rounded-lg border border-kb-forest/25 bg-white px-4 py-2.5" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-kb-charcoal">Company (optional)</label>
          <input value={company} onChange={(e) => setCompany(e.target.value)} className="w-full rounded-lg border border-kb-forest/25 bg-white px-4 py-2.5" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-kb-charcoal">Email</label>
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-lg border border-kb-forest/25 bg-white px-4 py-2.5" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-kb-charcoal">Phone (optional)</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded-lg border border-kb-forest/25 bg-white px-4 py-2.5" />
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-kb-charcoal">What do you need?</p>
        <div className="space-y-2">
          {lines.map((line, i) => (
            <div key={i} className="grid grid-cols-[1fr_5rem_5rem_auto] gap-2">
              <input
                value={line.name}
                onChange={(e) => updateLine(i, { name: e.target.value })}
                placeholder="Item, e.g. Rice"
                className="rounded-lg border border-kb-forest/25 bg-white px-3 py-2 text-sm"
              />
              <input
                value={line.quantity}
                onChange={(e) => updateLine(i, { quantity: e.target.value })}
                placeholder="Qty"
                inputMode="numeric"
                className="rounded-lg border border-kb-forest/25 bg-white px-3 py-2 text-sm"
              />
              <input
                value={line.unit}
                onChange={(e) => updateLine(i, { unit: e.target.value })}
                placeholder="Unit"
                className="rounded-lg border border-kb-forest/25 bg-white px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={() => removeLine(i)}
                aria-label="Remove item"
                className="flex items-center justify-center rounded-lg border border-kb-forest/15 text-kb-charcoal/50 hover:border-red-200 hover:text-red-600"
              >
                <Trash2 size={15} aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addLine}
          className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-kb-green hover:underline"
        >
          <Plus size={15} aria-hidden="true" /> Add another item
        </button>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-kb-charcoal">Anything else we should know? (optional)</label>
        <textarea
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full rounded-lg border border-kb-forest/25 bg-white px-4 py-2.5"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={submitting} className="btn btn-primary disabled:opacity-60">
        <Send size={16} aria-hidden="true" /> {submitting ? "Sending..." : "Request a quote"}
      </button>
    </form>
  );
}
