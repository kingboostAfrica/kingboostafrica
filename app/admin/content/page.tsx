import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { Home, Info, Cpu, Leaf } from "lucide-react";

const pages = [
  { slug: "home", label: "Home Page", icon: Home },
  { slug: "about", label: "About Page", icon: Info },
  { slug: "agritech", label: "Agritech Page", icon: Cpu },
  { slug: "organics", label: "Organics Page", icon: Leaf },
];

export default async function AdminContentIndexPage() {
  await requireAdmin();

  return (
    <div className="max-w-3xl mx-auto px-5 py-12">
      <h1 className="font-display text-3xl font-bold text-kb-charcoal mb-2">
        Site Content
      </h1>
      <p className="text-kb-charcoal/60 mb-10">
        Edit the text shown on these pages. Changes go live immediately.
      </p>

      <div className="grid sm:grid-cols-2 gap-6">
        {pages.map((p) => (
          <Link
            key={p.slug}
            href={`/admin/content/${p.slug}`}
            className="p-6 border border-kb-green/15 rounded-2xl hover:bg-kb-green/5 transition-colors flex items-center gap-4"
          >
            <p.icon className="text-kb-gold-dark" size={26} />
            <span className="font-medium text-kb-charcoal">{p.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
