"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import type { InquirySource } from "@/lib/types";

export default function InquiryForm({
  source,
  title = "Send an inquiry",
}: {
  source: InquirySource;
  title?: string;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source,
          full_name: form.name,
          email: form.email,
          phone: form.phone,
          message: form.message,
        }),
      });
      if (!res.ok) throw new Error("Failed to send. Please try again.");
      setSubmitted(true);
      setForm({ name: "", email: "", phone: "", message: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="p-5 bg-kb-green/10 rounded-2xl text-kb-green font-medium">
        Thanks — we&apos;ve received your inquiry and will be in touch shortly.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="font-display text-lg font-bold text-kb-charcoal">{title}</h3>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-kb-charcoal mb-1">Name</label>
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border border-kb-green/30 rounded-xl px-4 py-2.5 bg-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-kb-charcoal mb-1">Email</label>
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full border border-kb-green/30 rounded-xl px-4 py-2.5 bg-white"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-kb-charcoal mb-1">Phone (optional)</label>
        <input
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className="w-full border border-kb-green/30 rounded-xl px-4 py-2.5 bg-white"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-kb-charcoal mb-1">Message</label>
        <textarea
          required
          rows={4}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className="w-full border border-kb-green/30 rounded-xl px-4 py-2.5 bg-white"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="inline-flex items-center gap-2 bg-kb-green text-white px-6 py-3 rounded-full font-medium hover:bg-kb-green-dark transition-colors disabled:opacity-60"
      >
        <Send size={16} /> {submitting ? "Sending..." : "Send Inquiry"}
      </button>
    </form>
  );
}
