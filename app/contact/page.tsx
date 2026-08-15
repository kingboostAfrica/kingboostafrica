"use client";

import { useState } from "react";
import { Mail, MapPin, Send } from "lucide-react";

export default function ContactPage() {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
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

  return (
    <div className="max-w-xl mx-auto px-5 py-16">
      <h1 className="font-display text-4xl font-bold text-kb-charcoal mb-4">
        Contact Us
      </h1>
      <p className="text-kb-charcoal/60 mb-8">
        Questions about Food Mart, Academy, Consulting, Agritech, or
        Organics? Reach out and our team will get back to you.
      </p>

      <div className="space-y-3 mb-10 text-sm text-kb-charcoal/70">
        <p className="flex items-center gap-2">
          <MapPin size={16} className="text-kb-green shrink-0" />
          8 Ibudo Oloja Street, Igbanko, Badagry, Lagos State, Nigeria
        </p>
        <p className="flex items-center gap-2">
          <Mail size={16} className="text-kb-green shrink-0" />
          <a href="mailto:info@kingboostfarms.com" className="hover:text-kb-green">
            info@kingboostfarms.com
          </a>
        </p>
      </div>

      {submitted ? (
        <div className="p-5 bg-kb-green/10 rounded-2xl text-kb-green font-medium">
          Thanks for reaching out — we&apos;ll be in touch shortly.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
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
          <div>
            <label className="block text-sm font-medium text-kb-charcoal mb-1">Message</label>
            <textarea
              required
              rows={5}
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
            <Send size={16} /> {submitting ? "Sending..." : "Send Message"}
          </button>
        </form>
      )}
    </div>
  );
}
