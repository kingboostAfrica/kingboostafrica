"use client";

import { useState } from "react";
import { Mail, MapPin, Send } from "lucide-react";
import PageHeader from "@/components/PageHeader";

export default function ContactPage() {
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

  return (
    <>
      <PageHeader
        title="Contact us"
        description="Questions about Food Mart, Academy, Consulting, Agritech, or Organics? Reach out and our team will get back to you."
      />
      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-14 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="space-y-6">
          <div className="flex gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-kb-forest text-kb-gold">
              <MapPin size={20} aria-hidden="true" />
            </span>
            <div>
              <p className="font-bold text-kb-forest">Visit us</p>
              <p className="mt-1 text-kb-charcoal/70">
                8 Ibudo Oloja Street, Igbanko, Badagry, Lagos State, Nigeria
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-kb-forest text-kb-gold">
              <Mail size={20} aria-hidden="true" />
            </span>
            <div>
              <p className="font-bold text-kb-forest">Email us</p>
              <a href="mailto:kingboost.africa@gmail.com" className="mt-1 block text-kb-charcoal/70 hover:text-kb-green">
                kingboost.africa@gmail.com
              </a>
            </div>
          </div>
        </div>

        <div className="card p-6 sm:p-8">
          <h2 className="mb-5 text-2xl font-bold text-kb-forest">Send us a message</h2>
      {submitted ? (
        <div className="rounded-lg bg-kb-mist p-5 font-semibold text-kb-green">
          Thanks for reaching out — we&apos;ll be in touch shortly.
        </div>
      ) : (
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
          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary disabled:opacity-60"
          >
            <Send size={16} /> {submitting ? "Sending..." : "Send Message"}
          </button>
        </form>
      )}
        </div>
      </div>
    </>
  );
}
