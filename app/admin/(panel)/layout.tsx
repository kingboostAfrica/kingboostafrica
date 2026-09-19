import Link from "next/link";
import Image from "next/image";
import { requireAdmin } from "@/lib/admin";
import {
  LayoutDashboard,
  Package,
  BookOpen,
  Briefcase,
  Images,
  FileText,
  Inbox,
  ShoppingCart,
  Tags,
} from "lucide-react";
import LogoutButton from "@/components/LogoutButton";

const navLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Tags },
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
      <header className="sticky top-0 z-40 bg-kb-forest border-b-2 border-kb-gold">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between gap-6">
          <Link href="/admin" className="flex shrink-0 items-center gap-3">
            <Image src="/kingboost-icon-light.png" alt="" width={32} height={44} className="h-10 w-auto" />
            <span className="font-display text-lg font-bold text-white">Admin</span>
          </Link>
          <nav className="flex items-center gap-1 overflow-x-auto">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="flex items-center gap-1.5 text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg whitespace-nowrap transition-colors"
              >
                <l.icon size={16} />
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="flex shrink-0 items-center gap-3">
            <Link href="/" target="_blank" className="hidden text-sm font-medium text-white/80 hover:text-white sm:block">
              View site
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
