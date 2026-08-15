import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import {
  LayoutDashboard,
  Package,
  BookOpen,
  Briefcase,
  Images,
  FileText,
  Inbox,
} from "lucide-react";
import LogoutButton from "@/components/LogoutButton";

const navLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/courses", label: "Courses", icon: BookOpen },
  { href: "/admin/consulting", label: "Consulting", icon: Briefcase },
  { href: "/admin/gallery", label: "Gallery", icon: Images },
  { href: "/admin/content", label: "Site Content", icon: FileText },
  { href: "/admin/messages", label: "Messages", icon: Inbox },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="min-h-screen bg-kb-charcoal/[0.02]">
      <header className="sticky top-0 z-40 bg-white border-b border-kb-green/15">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between gap-6">
          <Link
            href="/admin"
            className="font-display text-lg font-bold text-kb-green shrink-0"
          >
            KingBoost<span className="text-kb-gold">Farms</span> Admin
          </Link>
          <nav className="flex items-center gap-1 overflow-x-auto">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="flex items-center gap-1.5 text-sm font-medium text-kb-charcoal/70 hover:text-kb-green hover:bg-kb-green/5 px-3 py-2 rounded-lg whitespace-nowrap transition-colors"
              >
                <l.icon size={16} />
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="shrink-0">
            <LogoutButton />
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
