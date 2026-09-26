"use client";

import { useState } from "react";
import { Send } from "lucide-react";

export default function ContactForm() {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "general",
          website,
          full_name: form.name,
          email: form.email,
          message: form.message,
        }),
      });
      if (!res.ok) throw new Error("Failed to send. Please try again.");
      setSubmitted(true);
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-lg bg-kb-mist p-5 font-semibold text-kb-green">
        Thanks for reaching out — we&apos;ll be in touch shortly.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="relative space-y-4">
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
      />
      <div>
        <label className="block text-sm font-medium text-kb-charcoal mb-1">Name</label>
        <input
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full border border-kb-forest/25 rounded-lg px-4 py-2.5 bg-white"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-kb-charcoal mb-1">Email</label>
        <input
          required
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full border border-kb-forest/25 rounded-lg px-4 py-2.5 bg-white"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-kb-charcoal mb-1">Message</label>
        <textarea
          required
          rows={5}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className="w-full border border-kb-forest/25 rounded-lg px-4 py-2.5 bg-white"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={submitting} className="btn btn-primary disabled:opacity-60">
        <Send size={16} /> {submitting ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}
