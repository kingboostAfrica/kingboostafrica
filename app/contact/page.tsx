export const metadata = { title: "Contact — KingBoostAfrica" };

export default function ContactPage() {
  return (
    <div className="max-w-xl mx-auto px-5 py-16">
      <h1 className="font-display text-4xl font-semibold text-ink mb-4">
        Contact Us
      </h1>
      <p className="text-ink/60 mb-10">
        Questions about buying, selling, or the platform? Reach out.
      </p>

      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-ink mb-1">Name</label>
          <input className="w-full border border-sage rounded-xl px-4 py-2.5 bg-white/60" />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink mb-1">Email</label>
          <input type="email" className="w-full border border-sage rounded-xl px-4 py-2.5 bg-white/60" />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink mb-1">Message</label>
          <textarea rows={5} className="w-full border border-sage rounded-xl px-4 py-2.5 bg-white/60" />
        </div>
        <button
          type="submit"
          className="bg-cassava text-millet px-6 py-3 rounded-full font-medium hover:bg-cassava-dark transition-colors"
        >
          Send Message
        </button>
      </form>
    </div>
  );
}
